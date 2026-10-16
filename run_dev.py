import subprocess
import sys
import os

def run():
    print("=" * 60)
    print("Starting Book Worm E-Bookstore Platform (Backend Server)...")
    print("API Swagger Docs will be available at: http://127.0.0.1:8000/docs")
    print("=" * 60)
    
    python_exe = sys.executable
    subprocess.run([python_exe, "-m", "uvicorn", "backend.app.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"])

if __name__ == "__main__":
    run()
