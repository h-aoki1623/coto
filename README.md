# Coto

AI English conversation practice app.

## Project Structure

```
coto/
├── apps/
│   ├── mobile/    # React Native (Expo) app
│   └── api/       # FastAPI backend
├── Makefile       # Root-level task runner
├── .env.example   # Environment variable template
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 20+
- Expo CLI

### Backend

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp ../../.env.example .env  # Edit with your values
alembic upgrade head
uvicorn src.coto.main:app --reload
```

### Mobile

```bash
cd apps/mobile
npm install
npx expo start --dev-client
```

### Common Commands

```bash
make dev-api        # Start backend dev server
make dev-mobile     # Start Expo dev server
make lint           # Lint both apps
make test           # Test both apps
make migrate        # Run database migrations
make migrate-new MSG="description"  # Create new migration
```
