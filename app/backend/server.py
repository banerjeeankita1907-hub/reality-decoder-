from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
import json
import re
from urllib.parse import urlparse


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix=\"/api\")


# Define Models
class ContentAnalysisRequest(BaseModel):
    content: str
    content_type: str = \"text\"  # \"text\" or \"url\"
    
class BiasIndicator(BaseModel):
    type: str  # \"left\", \"right\", \"center\", \"sensational\"
    score: float  # 0-100
    explanation: str

class LogicalFallacy(BaseModel):
    name: str
    description: str
    example_from_content: str

class AnalysisResult(BaseModel):
    model_config = ConfigDict(extra=\"ignore\")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    content: str
    content_type: str
    overall_credibility: float  # 0-100
    bias_indicators: List[BiasIndicator]
    logical_fallacies: List[LogicalFallacy]
    sentiment: str  # \"positive\", \"negative\", \"neutral\"
    emotional_manipulation_score: float  # 0-100
    fact_vs_opinion_ratio: float  # 0-100 (higher = more factual)
    source_domain: Optional[str] = None
    key_claims: List[str]
    red_flags: List[str]
    strengths: List[str]
    summary: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AnalysisHistory(BaseModel):
    model_config = ConfigDict(extra=\"ignore\")
    analyses: List[AnalysisResult]
    total_count: int
    avg_credibility: float

class SourceReliability(BaseModel):
    model_config = ConfigDict(extra=\"ignore\")
    domain: str
    reliability_score: float
    analysis_count: int
    last_analyzed: datetime


# Initialize LLM Chat
def get_llm_chat():
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    system_message = \"\"\"You are a world-class media literacy expert and critical thinking analyst. 
    Your role is to analyze content for bias, logical fallacies, emotional manipulation, and credibility.
    You help people understand the difference between facts and opinions, identify manipulation tactics,
    and develop critical thinking skills. Provide detailed, educational analysis that empowers users.\"\"\"
    
    chat = LlmChat(
        api_key=api_key,
        session_id=f\"reality-decoder-{uuid.uuid4()}\",
        system_message=system_message
    ).with_model(\"openai\", \"gpt-5.2\")
    
    return chat


async def analyze_content_with_ai(content: str, content_type: str) -> Dict[str, Any]:
    \"\"\"Use GPT-5.2 to analyze content for bias, fallacies, and credibility\"\"\"
    
    analysis_prompt = f\"\"\"Analyze the following {content_type} for media literacy and critical thinking:

CONTENT TO ANALYZE:
{content[:4000]}  

Provide a comprehensive analysis in the following JSON format:
{{
    \"overall_credibility\": <0-100 score>,
    \"bias_indicators\": [
        {{\"type\": \"left/right/center/sensational\", \"score\": <0-100>, \"explanation\": \"why\"}}
    ],
    \"logical_fallacies\": [
        {{\"name\": \"fallacy name\", \"description\": \"what it is\", \"example_from_content\": \"quote\"}}
    ],
    \"sentiment\": \"positive/negative/neutral\",
    \"emotional_manipulation_score\": <0-100>,
    \"fact_vs_opinion_ratio\": <0-100, higher means more factual>,
    \"key_claims\": [\"claim 1\", \"claim 2\", \"claim 3\"],
    \"red_flags\": [\"warning 1\", \"warning 2\"],
    \"strengths\": [\"strength 1\", \"strength 2\"],
    \"summary\": \"2-3 sentence summary of the analysis\"
}}

Be specific, cite examples from the content, and explain your reasoning.\"\"\"

    chat = get_llm_chat()
    user_message = UserMessage(text=analysis_prompt)
    
    response = await chat.send_message(user_message)
    
    # Parse the response
    try:
        # Extract JSON from response
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            analysis_data = json.loads(json_match.group())
        else:
            # Fallback parsing
            analysis_data = json.loads(response)
        
        return analysis_data
    except Exception as e:
        logging.error(f\"Error parsing AI response: {e}\")
        # Return a default structure
        return {
            \"overall_credibility\": 50,
            \"bias_indicators\": [{\"type\": \"center\", \"score\": 50, \"explanation\": \"Unable to determine bias\"}],
            \"logical_fallacies\": [],
            \"sentiment\": \"neutral\",
            \"emotional_manipulation_score\": 0,
            \"fact_vs_opinion_ratio\": 50,
            \"key_claims\": [],
            \"red_flags\": [],
            \"strengths\": [],
            \"summary\": \"Analysis could not be completed. Please try again.\"
        }


# API Routes
@api_router.get(\"/\")
async def root():
    return {\"message\": \"Reality Decoder API - Empowering Critical Thinking\"}


@api_router.post(\"/analyze\", response_model=AnalysisResult)
async def analyze_content(request: ContentAnalysisRequest):
    \"\"\"Analyze content for bias, fallacies, and credibility\"\"\"
    try:
        # Extract domain if URL
        source_domain = None
        if request.content_type == \"url\":
            try:
                parsed = urlparse(request.content)
                source_domain = parsed.netloc
            except:
                pass
        
        # Get AI analysis
        ai_analysis = await analyze_content_with_ai(request.content, request.content_type)
        
        # Create analysis result
        analysis = AnalysisResult(
            content=request.content[:500],  # Store first 500 chars
            content_type=request.content_type,
            overall_credibility=ai_analysis.get(\"overall_credibility\", 50),
            bias_indicators=[BiasIndicator(**b) for b in ai_analysis.get(\"bias_indicators\", [])],
            logical_fallacies=[LogicalFallacy(**f) for f in ai_analysis.get(\"logical_fallacies\", [])],
            sentiment=ai_analysis.get(\"sentiment\", \"neutral\"),
            emotional_manipulation_score=ai_analysis.get(\"emotional_manipulation_score\", 0),
            fact_vs_opinion_ratio=ai_analysis.get(\"fact_vs_opinion_ratio\", 50),
            source_domain=source_domain,
            key_claims=ai_analysis.get(\"key_claims\", []),
            red_flags=ai_analysis.get(\"red_flags\", []),
            strengths=ai_analysis.get(\"strengths\", []),
            summary=ai_analysis.get(\"summary\", \"\")
        )
        
        # Save to database
        doc = analysis.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        await db.analyses.insert_one(doc)
        
        # Update source reliability if applicable
        if source_domain:
            existing_source = await db.sources.find_one({\"domain\": source_domain})
            if existing_source:
                # Update average reliability
                new_count = existing_source[\"analysis_count\"] + 1
                new_avg = ((existing_source[\"reliability_score\"] * existing_source[\"analysis_count\"]) + 
                          analysis.overall_credibility) / new_count
                await db.sources.update_one(
                    {\"domain\": source_domain},
                    {\"$set\": {
                        \"reliability_score\": new_avg,
                        \"analysis_count\": new_count,
                        \"last_analyzed\": datetime.now(timezone.utc).isoformat()
                    }}
                )
            else:
                # Create new source entry
                await db.sources.insert_one({
                    \"domain\": source_domain,
                    \"reliability_score\": analysis.overall_credibility,
                    \"analysis_count\": 1,
                    \"last_analyzed\": datetime.now(timezone.utc).isoformat()
                })
        
        return analysis
        
    except Exception as e:
        logging.error(f\"Analysis error: {e}\")
        raise HTTPException(status_code=500, detail=f\"Analysis failed: {str(e)}\")


@api_router.get(\"/analyses\", response_model=AnalysisHistory)
async def get_analyses(limit: int = 20):
    \"\"\"Get analysis history\"\"\"
    try:
        analyses_docs = await db.analyses.find({}, {\"_id\": 0}).sort(\"timestamp\", -1).limit(limit).to_list(limit)
        
        # Convert timestamps
        for doc in analyses_docs:
            if isinstance(doc.get('timestamp'), str):
                doc['timestamp'] = datetime.fromisoformat(doc['timestamp'])
        
        total_count = await db.analyses.count_documents({})
        
        # Calculate average credibility
        avg_credibility = 50
        if analyses_docs:
            avg_credibility = sum(doc.get(\"overall_credibility\", 50) for doc in analyses_docs) / len(analyses_docs)
        
        return AnalysisHistory(
            analyses=[AnalysisResult(**doc) for doc in analyses_docs],
            total_count=total_count,
            avg_credibility=round(avg_credibility, 1)
        )
        
    except Exception as e:
        logging.error(f\"Error fetching analyses: {e}\")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get(\"/sources\", response_model=List[SourceReliability])
async def get_sources(limit: int = 50):
    \"\"\"Get source reliability scores\"\"\"
    try:
        sources = await db.sources.find({}, {\"_id\": 0}).sort(\"analysis_count\", -1).limit(limit).to_list(limit)
        
        # Convert timestamps
        for source in sources:
            if isinstance(source.get('last_analyzed'), str):
                source['last_analyzed'] = datetime.fromisoformat(source['last_analyzed'])
        
        return [SourceReliability(**s) for s in sources]
        
    except Exception as e:
        logging.error(f\"Error fetching sources: {e}\")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get(\"/stats\")
async def get_stats():
    \"\"\"Get overall statistics\"\"\"
    try:
        total_analyses = await db.analyses.count_documents({})
        total_sources = await db.sources.count_documents({})
        
        # Get average credibility across all analyses
        pipeline = [
            {\"$group\": {
                \"_id\": None,
                \"avg_credibility\": {\"$avg\": \"$overall_credibility\"},
                \"avg_bias_score\": {\"$avg\": \"$emotional_manipulation_score\"}
            }}
        ]
        
        stats_result = await db.analyses.aggregate(pipeline).to_list(1)
        
        avg_credibility = stats_result[0][\"avg_credibility\"] if stats_result else 50
        avg_bias = stats_result[0][\"avg_bias_score\"] if stats_result else 0
        
        return {
            \"total_analyses\": total_analyses,
            \"total_sources_tracked\": total_sources,
            \"average_credibility_score\": round(avg_credibility, 1),
            \"average_manipulation_score\": round(avg_bias, 1)
        }
        
    except Exception as e:
        logging.error(f\"Error fetching stats: {e}\")
        raise HTTPException(status_code=500, detail=str(e))


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=[\"*\"],
    allow_headers=[\"*\"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event(\"shutdown\")
async def shutdown_db_client():
    client.close()
"
Observation: Overwrite successful: /app/backend/server.py
