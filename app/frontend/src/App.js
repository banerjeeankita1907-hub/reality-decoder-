"import { useState, useEffect } from \"react\";
import \"@/App.css\";
import axios from \"axios\";
import { 
  Brain, Shield, Target, TrendingUp, AlertTriangle, 
  CheckCircle, Search, Book, BarChart3, Eye, Zap,
  Globe, FileText, Link as LinkIcon
} from \"lucide-react\";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [currentView, setCurrentView] = useState(\"home\");
  const [content, setContent] = useState(\"\");
  const [contentType, setContentType] = useState(\"text\");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [sources, setSources] = useState([]);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error(\"Error fetching stats:\", error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API}/analyses?limit=20`);
      setHistory(response.data.analyses || []);
    } catch (error) {
      console.error(\"Error fetching history:\", error);
    }
  };

  const fetchSources = async () => {
    try {
      const response = await axios.get(`${API}/sources?limit=50`);
      setSources(response.data || []);
    } catch (error) {
      console.error(\"Error fetching sources:\", error);
    }
  };

  const handleAnalyze = async () => {
    if (!content.trim()) {
      alert(\"Please enter content to analyze\");
      return;
    }

    setAnalyzing(true);
    try {
      const response = await axios.post(`${API}/analyze`, {
        content: content,
        content_type: contentType
      });
      setAnalysisResult(response.data);
      setCurrentView(\"results\");
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error(\"Analysis error:\", error);
      alert(\"Analysis failed. Please try again.\");
    } finally {
      setAnalyzing(false);
    }
  };

  const getCredibilityColor = (score) => {
    if (score >= 75) return \"text-green-500\";
    if (score >= 50) return \"text-yellow-500\";
    return \"text-red-500\";
  };

  const getCredibilityLabel = (score) => {
    if (score >= 75) return \"High Credibility\";
    if (score >= 50) return \"Moderate Credibility\";
    return \"Low Credibility\";
  };

  return (
    <div className=\"min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900\">
      {/* Navigation */}
      <nav className=\"bg-black/30 backdrop-blur-lg border-b border-white/10\">
        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
          <div className=\"flex items-center justify-between h-16\">
            <div className=\"flex items-center space-x-3\">
              <Brain className=\"w-8 h-8 text-purple-400\" />
              <span className=\"text-2xl font-bold text-white\">Reality Decoder</span>
            </div>
            <div className=\"flex space-x-4\">
              <button 
                onClick={() => setCurrentView(\"home\")}
                className={`px-4 py-2 rounded-lg transition ${
                  currentView === \"home\" 
                    ? \"bg-purple-600 text-white\" 
                    : \"text-gray-300 hover:text-white\"
                }`}
                data-testid=\"nav-home-btn\"
              >
                Home
              </button>
              <button 
                onClick={() => setCurrentView(\"analyzer\")}
                className={`px-4 py-2 rounded-lg transition ${
                  currentView === \"analyzer\" 
                    ? \"bg-purple-600 text-white\" 
                    : \"text-gray-300 hover:text-white\"
                }`}
                data-testid=\"nav-analyzer-btn\"
              >
                Analyze
              </button>
              <button 
                onClick={() => { setCurrentView(\"history\"); fetchHistory(); }}
                className={`px-4 py-2 rounded-lg transition ${
                  currentView === \"history\" 
                    ? \"bg-purple-600 text-white\" 
                    : \"text-gray-300 hover:text-white\"
                }`}
                data-testid=\"nav-history-btn\"
              >
                History
              </button>
              <button 
                onClick={() => { setCurrentView(\"sources\"); fetchSources(); }}
                className={`px-4 py-2 rounded-lg transition ${
                  currentView === \"sources\" 
                    ? \"bg-purple-600 text-white\" 
                    : \"text-gray-300 hover:text-white\"
                }`}
                data-testid=\"nav-sources-btn\"
              >
                Sources
              </button>
              <button 
                onClick={() => setCurrentView(\"learn\")}
                className={`px-4 py-2 rounded-lg transition ${
                  currentView === \"learn\" 
                    ? \"bg-purple-600 text-white\" 
                    : \"text-gray-300 hover:text-white\"
                }`}
                data-testid=\"nav-learn-btn\"
              >
                Learn
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12\">
        
        {/* HOME VIEW */}
        {currentView === \"home\" && (
          <div className=\"space-y-16\">
            {/* Hero Section */}
            <div className=\"text-center space-y-6\">
              <div className=\"flex justify-center\">
                <div className=\"p-4 bg-purple-600/20 rounded-full\">
                  <Eye className=\"w-16 h-16 text-purple-400\" />
                </div>
              </div>
              <h1 className=\"text-6xl font-bold text-white\" data-testid=\"hero-title\">
                Decode Reality
              </h1>
              <p className=\"text-xl text-gray-300 max-w-3xl mx-auto\">
                The world's first AI-powered platform that helps you understand truth, 
                detect bias, and develop critical thinking skills. Analyze any content 
                in seconds and see beyond the manipulation.
              </p>
              <button 
                onClick={() => setCurrentView(\"analyzer\")}
                className=\"px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition shadow-lg\"
                data-testid=\"hero-cta-btn\"
              >
                Start Analyzing Now
              </button>
            </div>

            {/* Stats Section */}
            {stats && (
              <div className=\"grid grid-cols-1 md:grid-cols-4 gap-6\">
                <div className=\"bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20\">
                  <BarChart3 className=\"w-8 h-8 text-blue-400 mb-3\" />
                  <div className=\"text-3xl font-bold text-white\">{stats.total_analyses}</div>
                  <div className=\"text-gray-300\">Analyses Complete</div>
                </div>
                <div className=\"bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20\">
                  <Globe className=\"w-8 h-8 text-green-400 mb-3\" />
                  <div className=\"text-3xl font-bold text-white\">{stats.total_sources_tracked}</div>
                  <div className=\"text-gray-300\">Sources Tracked</div>
                </div>
                <div className=\"bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20\">
                  <Target className=\"w-8 h-8 text-purple-400 mb-3\" />
                  <div className=\"text-3xl font-bold text-white\">{stats.average_credibility_score}%</div>
                  <div className=\"text-gray-300\">Avg Credibility</div>
                </div>
                <div className=\"bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20\">
                  <Shield className=\"w-8 h-8 text-yellow-400 mb-3\" />
                  <div className=\"text-3xl font-bold text-white\">{stats.average_manipulation_score}%</div>
                  <div className=\"text-gray-300\">Avg Manipulation</div>
                </div>
              </div>
            )}

            {/* Features Section */}
            <div className=\"grid grid-cols-1 md:grid-cols-3 gap-8\">
              <div className=\"bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10\">
                <Brain className=\"w-12 h-12 text-purple-400 mb-4\" />
                <h3 className=\"text-2xl font-bold text-white mb-3\">AI-Powered Analysis</h3>
                <p className=\"text-gray-300\">
                  GPT-5.2 analyzes content for bias, logical fallacies, emotional manipulation, 
                  and credibility in seconds.
                </p>
              </div>
              <div className=\"bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10\">
                <Shield className=\"w-12 h-12 text-blue-400 mb-4\" />
                <h3 className=\"text-2xl font-bold text-white mb-3\">Truth Detection</h3>
                <p className=\"text-gray-300\">
                  Distinguish facts from opinions, identify manipulation tactics, 
                  and understand the reliability of sources.
                </p>
              </div>
              <div className=\"bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10\">
                <TrendingUp className=\"w-12 h-12 text-green-400 mb-4\" />
                <h3 className=\"text-2xl font-bold text-white mb-3\">Track Your Progress</h3>
                <p className=\"text-gray-300\">
                  Build your media literacy skills over time with personalized insights 
                  and learning recommendations.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ANALYZER VIEW */}
        {currentView === \"analyzer\" && (
          <div className=\"space-y-8\">
            <div className=\"text-center space-y-4\">
              <h2 className=\"text-4xl font-bold text-white\">Content Analyzer</h2>
              <p className=\"text-gray-300\">Paste any text or URL to analyze for bias, credibility, and manipulation</p>
            </div>

            <div className=\"bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 space-y-6\">
              {/* Content Type Selector */}
              <div className=\"flex space-x-4\">
                <button
                  onClick={() => setContentType(\"text\")}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    contentType === \"text\"
                      ? \"bg-purple-600 text-white\"
                      : \"bg-white/5 text-gray-300 hover:bg-white/10\"
                  }`}
                  data-testid=\"content-type-text-btn\"
                >
                  <FileText className=\"w-5 h-5 inline mr-2\" />
                  Text Content
                </button>
                <button
                  onClick={() => setContentType(\"url\")}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    contentType === \"url\"
                      ? \"bg-purple-600 text-white\"
                      : \"bg-white/5 text-gray-300 hover:bg-white/10\"
                  }`}
                  data-testid=\"content-type-url-btn\"
                >
                  <LinkIcon className=\"w-5 h-5 inline mr-2\" />
                  URL / Link
                </button>
              </div>

              {/* Content Input */}
              <div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={contentType === \"text\" 
                    ? \"Paste the article, social media post, or any text content you want to analyze...\" 
                    : \"Enter the URL of an article or webpage...\"
                  }
                  className=\"w-full h-64 px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500\"
                  data-testid=\"content-input\"
                />
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={analyzing || !content.trim()}
                className=\"w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed\"
                data-testid=\"analyze-btn\"
              >
                {analyzing ? (
                  <span className=\"flex items-center justify-center\">
                    <Zap className=\"w-5 h-5 animate-pulse mr-2\" />
                    Analyzing...
                  </span>
                ) : (
                  <span className=\"flex items-center justify-center\">
                    <Search className=\"w-5 h-5 mr-2\" />
                    Analyze Content
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* RESULTS VIEW */}
        {currentView === \"results\" && analysisResult && (
          <div className=\"space-y-8\">
            <div className=\"flex justify-between items-center\">
              <h2 className=\"text-4xl font-bold text-white\">Analysis Results</h2>
              <button
                onClick={() => { setCurrentView(\"analyzer\"); setAnalysisResult(null); }}
                className=\"px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition\"
                data-testid=\"new-analysis-btn\"
              >
                New Analysis
              </button>
            </div>

            {/* Overall Score */}
            <div className=\"bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-xl p-8 border border-white/20\">
              <div className=\"text-center space-y-4\">
                <div className={`text-7xl font-bold ${getCredibilityColor(analysisResult.overall_credibility)}`} data-testid=\"credibility-score\">
                  {analysisResult.overall_credibility}%
                </div>
                <div className=\"text-2xl text-white font-semibold\" data-testid=\"credibility-label\">
                  {getCredibilityLabel(analysisResult.overall_credibility)}
                </div>
                <p className=\"text-gray-300 max-w-3xl mx-auto\" data-testid=\"analysis-summary\">
                  {analysisResult.summary}
                </p>
              </div>
            </div>

            {/* Key Metrics */}
            <div className=\"grid grid-cols-1 md:grid-cols-3 gap-6\">
              <div className=\"bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20\">
                <div className=\"flex items-center justify-between mb-3\">
                  <span className=\"text-gray-300\">Fact vs Opinion</span>
                  <Target className=\"w-5 h-5 text-blue-400\" />
                </div>
                <div className=\"text-3xl font-bold text-white\" data-testid=\"fact-ratio\">
                  {analysisResult.fact_vs_opinion_ratio}%
                </div>
                <div className=\"text-sm text-gray-400 mt-2\">Factual Content</div>
              </div>
              <div className=\"bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20\">
                <div className=\"flex items-center justify-between mb-3\">
                  <span className=\"text-gray-300\">Emotional Manipulation</span>
                  <AlertTriangle className=\"w-5 h-5 text-yellow-400\" />
                </div>
                <div className=\"text-3xl font-bold text-white\" data-testid=\"manipulation-score\">
                  {analysisResult.emotional_manipulation_score}%
                </div>
                <div className=\"text-sm text-gray-400 mt-2\">Manipulation Detected</div>
              </div>
              <div className=\"bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20\">
                <div className=\"flex items-center justify-between mb-3\">
                  <span className=\"text-gray-300\">Sentiment</span>
                  <Brain className=\"w-5 h-5 text-purple-400\" />
                </div>
                <div className=\"text-3xl font-bold text-white capitalize\" data-testid=\"sentiment\">
                  {analysisResult.sentiment}
                </div>
                <div className=\"text-sm text-gray-400 mt-2\">Overall Tone</div>
              </div>
            </div>

            {/* Bias Indicators */}
            {analysisResult.bias_indicators && analysisResult.bias_indicators.length > 0 && (
              <div className=\"bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20\">
                <h3 className=\"text-2xl font-bold text-white mb-6 flex items-center\">
                  <Target className=\"w-6 h-6 mr-3 text-purple-400\" />
                  Bias Indicators
                </h3>
                <div className=\"space-y-4\">
                  {analysisResult.bias_indicators.map((bias, idx) => (
                    <div key={idx} className=\"bg-black/30 rounded-lg p-4\" data-testid={`bias-indicator-${idx}`}>
                      <div className=\"flex justify-between items-center mb-2\">
                        <span className=\"text-white font-semibold capitalize\">{bias.type} Bias</span>
                        <span className=\"text-purple-400 font-bold\">{bias.score}%</span>
                      </div>
                      <p className=\"text-gray-300 text-sm\">{bias.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Logical Fallacies */}
            {analysisResult.logical_fallacies && analysisResult.logical_fallacies.length > 0 && (
              <div className=\"bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20\">
                <h3 className=\"text-2xl font-bold text-white mb-6 flex items-center\">
                  <AlertTriangle className=\"w-6 h-6 mr-3 text-yellow-400\" />
                  Logical Fallacies Detected
                </h3>
                <div className=\"space-y-4\">
                  {analysisResult.logical_fallacies.map((fallacy, idx) => (
                    <div key={idx} className=\"bg-black/30 rounded-lg p-4\" data-testid={`fallacy-${idx}`}>
                      <h4 className=\"text-white font-semibold mb-2\">{fallacy.name}</h4>
                      <p className=\"text-gray-300 text-sm mb-2\">{fallacy.description}</p>
                      <div className=\"bg-red-900/20 border-l-4 border-red-500 p-3 mt-2\">
                        <p className=\"text-gray-300 text-sm italic\">\"{fallacy.example_from_content}\"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Claims */}
            {analysisResult.key_claims && analysisResult.key_claims.length > 0 && (
              <div className=\"bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20\">
                <h3 className=\"text-2xl font-bold text-white mb-6 flex items-center\">
                  <FileText className=\"w-6 h-6 mr-3 text-blue-400\" />
                  Key Claims
                </h3>
                <ul className=\"space-y-3\">
                  {analysisResult.key_claims.map((claim, idx) => (
                    <li key={idx} className=\"flex items-start text-gray-300\" data-testid={`claim-${idx}`}>
                      <CheckCircle className=\"w-5 h-5 mr-3 mt-1 text-green-400 flex-shrink-0\" />
                      <span>{claim}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Red Flags & Strengths */}
            <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
              {/* Red Flags */}
              {analysisResult.red_flags && analysisResult.red_flags.length > 0 && (
                <div className=\"bg-red-900/20 backdrop-blur-lg rounded-xl p-6 border border-red-500/30\">
                  <h3 className=\"text-xl font-bold text-white mb-4 flex items-center\">
                    <AlertTriangle className=\"w-5 h-5 mr-2 text-red-400\" />
                    Red Flags
                  </h3>
                  <ul className=\"space-y-2\">
                    {analysisResult.red_flags.map((flag, idx) => (
                      <li key={idx} className=\"text-gray-300 text-sm\" data-testid={`red-flag-${idx}`}>• {flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Strengths */}
              {analysisResult.strengths && analysisResult.strengths.length > 0 && (
                <div className=\"bg-green-900/20 backdrop-blur-lg rounded-xl p-6 border border-green-500/30\">
                  <h3 className=\"text-xl font-bold text-white mb-4 flex items-center\">
                    <CheckCircle className=\"w-5 h-5 mr-2 text-green-400\" />
                    Strengths
                  </h3>
                  <ul className=\"space-y-2\">
                    {analysisResult.strengths.map((strength, idx) => (
                      <li key={idx} className=\"text-gray-300 text-sm\" data-testid={`strength-${idx}`}>• {strength}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* HISTORY VIEW */}
        {currentView === \"history\" && (
          <div className=\"space-y-8\">
            <h2 className=\"text-4xl font-bold text-white\">Analysis History</h2>
            
            {history.length === 0 ? (
              <div className=\"bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center\">
                <BarChart3 className=\"w-16 h-16 text-gray-400 mx-auto mb-4\" />
                <p className=\"text-gray-300 text-lg\">No analyses yet. Start analyzing content to see your history!</p>
                <button
                  onClick={() => setCurrentView(\"analyzer\")}
                  className=\"mt-6 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition\"
                >
                  Start Analyzing
                </button>
              </div>
            ) : (
              <div className=\"space-y-4\">
                {history.map((analysis, idx) => (
                  <div 
                    key={analysis.id || idx} 
                    className=\"bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-purple-500/50 transition cursor-pointer\"
                    onClick={() => { setAnalysisResult(analysis); setCurrentView(\"results\"); }}
                    data-testid={`history-item-${idx}`}
                  >
                    <div className=\"flex justify-between items-start\">
                      <div className=\"flex-1\">
                        <div className=\"flex items-center space-x-3 mb-2\">
                          <span className={`text-2xl font-bold ${getCredibilityColor(analysis.overall_credibility)}`}>
                            {analysis.overall_credibility}%
                          </span>
                          <span className=\"text-gray-400 text-sm\">
                            {new Date(analysis.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className=\"text-gray-300 line-clamp-2\">{analysis.content}</p>
                      </div>
                      <div className=\"ml-4\">
                        <Eye className=\"w-5 h-5 text-purple-400\" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SOURCES VIEW */}
        {currentView === \"sources\" && (
          <div className=\"space-y-8\">
            <h2 className=\"text-4xl font-bold text-white\">Source Reliability Tracker</h2>
            
            {sources.length === 0 ? (
              <div className=\"bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center\">
                <Globe className=\"w-16 h-16 text-gray-400 mx-auto mb-4\" />
                <p className=\"text-gray-300 text-lg\">No sources tracked yet. Analyze URL content to build your source database!</p>
              </div>
            ) : (
              <div className=\"bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden\">
                <table className=\"w-full\">
                  <thead className=\"bg-black/30\">
                    <tr>
                      <th className=\"px-6 py-4 text-left text-white font-semibold\">Source Domain</th>
                      <th className=\"px-6 py-4 text-left text-white font-semibold\">Reliability Score</th>
                      <th className=\"px-6 py-4 text-left text-white font-semibold\">Analyses</th>
                      <th className=\"px-6 py-4 text-left text-white font-semibold\">Last Checked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sources.map((source, idx) => (
                      <tr key={idx} className=\"border-t border-white/10 hover:bg-white/5 transition\" data-testid={`source-${idx}`}>
                        <td className=\"px-6 py-4 text-gray-300\">{source.domain}</td>
                        <td className=\"px-6 py-4\">
                          <span className={`text-xl font-bold ${getCredibilityColor(source.reliability_score)}`}>
                            {Math.round(source.reliability_score)}%
                          </span>
                        </td>
                        <td className=\"px-6 py-4 text-gray-300\">{source.analysis_count}</td>
                        <td className=\"px-6 py-4 text-gray-400 text-sm\">
                          {new Date(source.last_analyzed).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* LEARN VIEW */}
        {currentView === \"learn\" && (
          <div className=\"space-y-8\">
            <div className=\"text-center space-y-4\">
              <h2 className=\"text-4xl font-bold text-white\">Media Literacy Hub</h2>
              <p className=\"text-gray-300\">Learn to think critically and spot manipulation</p>
            </div>

            <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
              {/* Common Logical Fallacies */}
              <div className=\"bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20\">
                <h3 className=\"text-2xl font-bold text-white mb-6 flex items-center\">
                  <Book className=\"w-6 h-6 mr-3 text-purple-400\" />
                  Common Logical Fallacies
                </h3>
                <div className=\"space-y-4\">
                  <div className=\"bg-black/30 rounded-lg p-4\">
                    <h4 className=\"text-white font-semibold mb-2\">Ad Hominem</h4>
                    <p className=\"text-gray-300 text-sm\">Attacking the person instead of their argument</p>
                  </div>
                  <div className=\"bg-black/30 rounded-lg p-4\">
                    <h4 className=\"text-white font-semibold mb-2\">Straw Man</h4>
                    <p className=\"text-gray-300 text-sm\">Misrepresenting an argument to make it easier to attack</p>
                  </div>
                  <div className=\"bg-black/30 rounded-lg p-4\">
                    <h4 className=\"text-white font-semibold mb-2\">Appeal to Emotion</h4>
                    <p className=\"text-gray-300 text-sm\">Using emotions instead of logic to persuade</p>
                  </div>
                  <div className=\"bg-black/30 rounded-lg p-4\">
                    <h4 className=\"text-white font-semibold mb-2\">False Dichotomy</h4>
                    <p className=\"text-gray-300 text-sm\">Presenting only two options when more exist</p>
                  </div>
                </div>
              </div>

              {/* Bias Recognition */}
              <div className=\"bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20\">
                <h3 className=\"text-2xl font-bold text-white mb-6 flex items-center\">
                  <Target className=\"w-6 h-6 mr-3 text-blue-400\" />
                  Types of Bias
                </h3>
                <div className=\"space-y-4\">
                  <div className=\"bg-black/30 rounded-lg p-4\">
                    <h4 className=\"text-white font-semibold mb-2\">Confirmation Bias</h4>
                    <p className=\"text-gray-300 text-sm\">Favoring information that confirms existing beliefs</p>
                  </div>
                  <div className=\"bg-black/30 rounded-lg p-4\">
                    <h4 className=\"text-white font-semibold mb-2\">Selection Bias</h4>
                    <p className=\"text-gray-300 text-sm\">Choosing sources that support a particular viewpoint</p>
                  </div>
                  <div className=\"bg-black/30 rounded-lg p-4\">
                    <h4 className=\"text-white font-semibold mb-2\">Framing Bias</h4>
                    <p className=\"text-gray-300 text-sm\">Presenting information in a way that influences perception</p>
                  </div>
                  <div className=\"bg-black/30 rounded-lg p-4\">
                    <h4 className=\"text-white font-semibold mb-2\">Sensationalism</h4>
                    <p className=\"text-gray-300 text-sm\">Exaggerating facts to provoke emotional reactions</p>
                  </div>
                </div>
              </div>

              {/* Critical Questions */}
              <div className=\"bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20\">
                <h3 className=\"text-2xl font-bold text-white mb-6 flex items-center\">
                  <Brain className=\"w-6 h-6 mr-3 text-green-400\" />
                  Critical Questions to Ask
                </h3>
                <ul className=\"space-y-3 text-gray-300\">
                  <li className=\"flex items-start\">
                    <CheckCircle className=\"w-5 h-5 mr-3 mt-1 text-green-400 flex-shrink-0\" />
                    Who created this content and why?
                  </li>
                  <li className=\"flex items-start\">
                    <CheckCircle className=\"w-5 h-5 mr-3 mt-1 text-green-400 flex-shrink-0\" />
                    What evidence supports the claims?
                  </li>
                  <li className=\"flex items-start\">
                    <CheckCircle className=\"w-5 h-5 mr-3 mt-1 text-green-400 flex-shrink-0\" />
                    Are alternative viewpoints presented?
                  </li>
                  <li className=\"flex items-start\">
                    <CheckCircle className=\"w-5 h-5 mr-3 mt-1 text-green-400 flex-shrink-0\" />
                    Is the language neutral or emotional?
                  </li>
                  <li className=\"flex items-start\">
                    <CheckCircle className=\"w-5 h-5 mr-3 mt-1 text-green-400 flex-shrink-0\" />
                    Can the facts be verified elsewhere?
                  </li>
                </ul>
              </div>

              {/* Tips */}
              <div className=\"bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20\">
                <h3 className=\"text-2xl font-bold text-white mb-6 flex items-center\">
                  <Shield className=\"w-6 h-6 mr-3 text-yellow-400\" />
                  Protection Tips
                </h3>
                <ul className=\"space-y-3 text-gray-300\">
                  <li className=\"flex items-start\">
                    <AlertTriangle className=\"w-5 h-5 mr-3 mt-1 text-yellow-400 flex-shrink-0\" />
                    Check multiple sources before believing claims
                  </li>
                  <li className=\"flex items-start\">
                    <AlertTriangle className=\"w-5 h-5 mr-3 mt-1 text-yellow-400 flex-shrink-0\" />
                    Look for original sources and primary evidence
                  </li>
                  <li className=\"flex items-start\">
                    <AlertTriangle className=\"w-5 h-5 mr-3 mt-1 text-yellow-400 flex-shrink-0\" />
                    Be skeptical of headlines designed to provoke
                  </li>
                  <li className=\"flex items-start\">
                    <AlertTriangle className=\"w-5 h-5 mr-3 mt-1 text-yellow-400 flex-shrink-0\" />
                    Verify author credentials and expertise
                  </li>
                  <li className=\"flex items-start\">
                    <AlertTriangle className=\"w-5 h-5 mr-3 mt-1 text-yellow-400 flex-shrink-0\" />
                    Watch for cherry-picked data and statistics
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
"
Observation: Overwrite successful: /app/frontend/src/App.js
