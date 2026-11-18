# Reality Decoder

A media-literacy prototype that uses an LLM to help a reader inspect supplied text for framing, emotional language, possible logical fallacies, and claims worth checking.

## What it does

- Accepts text or a URL string for a structured AI-assisted review.
- Returns heuristic indicators such as possible bias, fallacy examples, key claims, and a short summary.
- Stores an analysis history and aggregate source-domain counters in MongoDB.
- Provides a React interface for submitting content and reviewing results.

## Important scope and accuracy limits

- **This is not a fact-checking service.** It does not independently verify claims against primary sources or authoritative evidence.
- A credibility score is an LLM-generated heuristic, not a calibrated probability, scientific measurement, or ground-truth rating of a publisher.
- URL mode currently validates and records the URL hostname; it does **not** fetch and parse the linked webpage. To analyze an article, submit its text.
- LLM output can be incomplete, biased, or wrong. Treat the results as prompts for further investigation, not a verdict about a person, source, or claim.

## Stack

- FastAPI and Pydantic
- MongoDB with Motor
- React frontend
- LLM provider configured through the server-side integration

## Backend setup

Create a virtual environment and install the backend dependencies used by the application. Copy `app/backend/.env.example` to `app/backend/.env` and configure:

- `MONGO_URL`
- `DB_NAME`
- `EMERGENT_LLM_KEY`
- `CORS_ORIGINS` — comma-separated, exact trusted frontend origins

Run the API from `app/backend` with:

```bash
uvicorn server:app --reload --host 127.0.0.1 --port 8000
```

## Validation and tests

The API validates content type, text length, URL scheme/host, and URL credentials, and clamps history page sizes. Pure validation tests use only the Python standard library:

```bash
python -m unittest discover -s app/backend/tests -v
```

## Before public deployment

The current API stores supplied content and exposes history/source routes without user authentication. Do not deploy it with private or sensitive submissions until authentication, per-user authorization, retention controls, abuse protection, and appropriate privacy disclosures are implemented. Configure CORS for explicit origins and deploy only behind HTTPS.

## License

No open-source license is currently declared. All rights are reserved by default until a license is added.
