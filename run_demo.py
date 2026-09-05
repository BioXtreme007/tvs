"""
TVS Credit AI-Powered Smart Lending Decision Hub
One-Click Demo & Local Web Server Launcher
"""

import os
import sys
import webbrowser
from pathlib import Path

# Ensure UTF-8 stdout on Windows
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

HUB_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(HUB_ROOT))

import uvicorn
from fastapi.staticfiles import StaticFiles
from tvs_lending.api.app import app

# Mount static web UI (prioritize compiled React production build if available)
dist_dir = HUB_ROOT / "web" / "dist"
web_dir = dist_dir if (dist_dir / "index.html").exists() else (HUB_ROOT / "web")
app.mount("/", StaticFiles(directory=str(web_dir), html=True), name="static")

if __name__ == "__main__":
    port = 8000
    host = "127.0.0.1"
    url = f"http://{host}:{port}"
    print("=" * 70)
    print("[STARTED] TVS CREDIT AI-POWERED SMART LENDING DECISION HUB (ROUND 2)")
    print("=" * 70)
    print(f"[*] Local Web Cockpit: {url}")
    print(f"[*] API Documentation: {url}/docs")
    print("=" * 70)
    
    uvicorn.run(app, host=host, port=port)
