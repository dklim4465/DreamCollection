# AI Server

## Setup

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create `.env` from `.env.example`, then set `GEMINI_API_KEY`.

## Run

```powershell
python app.py
```

The server runs on `http://localhost:5000`. Check it with `GET /health`.
