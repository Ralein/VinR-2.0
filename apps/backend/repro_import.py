import os
import sys

# Add apps/backend to sys.path
backend_path = "/Users/ralein/Desktop/Project/VinR/apps/backend"
sys.path.append(backend_path)

print(f"sys.path: {sys.path}")

try:
    print("Trying to import app.models.user...")
    from app.models.user import User
    print("Import app.models.user successful!")
    
    print("Trying to import app.models.checkin...")
    from app.models.checkin import Checkin, Plan
    print("Import app.models.checkin successful!")
    
    print("Trying to import app.models.streak...")
    from app.models.streak import Streak, DailyCompletion
    print("Import app.models.streak successful!")
    
except Exception as e:
    print(f"Import failed: {e}")
    import traceback
    traceback.print_exc()
