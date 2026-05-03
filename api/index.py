"""
Vercel Serverless Entry Point
Re-exports the FastAPI app from app.main for Vercel's Python runtime.
"""

import sys
import os

# Ensure the project root is on the Python path so `from app.engine import ...` works
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
