import sys
import os
sys.path.append(os.getcwd())

from app.db.database import engine
from sqlalchemy import inspect

inspector = inspect(engine)
columns = inspector.get_columns('resources')
print("Các cột trong bảng 'resources':")
for column in columns:
    print(f"- {column['name']} ({column['type']})")

has_task_id = any(c['name'] == 'task_id' for c in columns)
print(f"\nCó cột task_id không? {has_task_id}")
