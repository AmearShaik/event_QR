import os
import pandas as pd
from sqlalchemy import create_engine, text

def main():
    # 1. Read Excel file
    excel_path = r"C:\Users\Amear\OneDrive\Desktop\Graduation Day -2026  FEE STATUS 20-08-2026 - Group.xlsx"
    df = pd.read_excel(excel_path, sheet_name='ListofStudents-20.08.2026', header=2)
    
    # Clean column names
    df.columns = df.columns.str.strip()
    
    # Drop rows without Roll No
    df = df.dropna(subset=['Roll No'])
    
    print(f"Loaded {len(df)} rows from Excel.")
    
    # 2. Connect to database
    # From .env
    db_url = "postgresql://neondb_owner:npg_VsUkyHo34JNA@ep-crimson-glade-axgzv03m.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"
    engine = create_engine(db_url)
    
    # Fetch existing candidates
    with engine.connect() as conn:
        result = conn.execute(text('SELECT "studentId", "name", "paymentStatus" FROM "Candidate"'))
        existing_rows = result.fetchall()
        
    existing_dict = {row[0]: {'name': row[1], 'paymentStatus': row[2]} for row in existing_rows}
    print(f"Loaded {len(existing_dict)} existing candidates from database.")
    
    # 3. Compare datasets
    new_rows = []
    updated_rows = []
    unchanged_count = 0
    
    for _, row in df.iterrows():
        student_id = str(row['Roll No']).strip()
        name = str(row['Name']).strip()
        status = str(row['Status']).strip()
        
        if student_id not in existing_dict:
            new_rows.append(student_id)
        else:
            existing = existing_dict[student_id]
            # Consider only status change for now, can also check name
            if existing['paymentStatus'] != status:
                updated_rows.append(student_id)
            else:
                unchanged_count += 1
                
    print("\n--- Summary of Differences ---")
    print(f"New rows to insert: {len(new_rows)}")
    print(f"Existing rows with changed status: {len(updated_rows)}")
    print(f"Unchanged rows: {unchanged_count}")
    
    print("\nSample of new rows:", new_rows[:5])
    print("Sample of updated rows:", updated_rows[:5])

if __name__ == "__main__":
    main()
