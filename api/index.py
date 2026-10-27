"""
Vercel Serverless Function Entry Point for FastAPI
Exposes the existing FastAPI application for unified Vercel deployment.
"""

import sys
from pathlib import Path

# Add project root directory to sys.path so 'app' and its submodules import cleanly
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

# Import the existing production FastAPI instance
from app.main import app

# Expose app for Vercel Python runtime
app = app
