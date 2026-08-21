import os
import pandas as pd
from sqlalchemy import create_engine, text
import uuid
from datetime import datetime

def normalize_status(status_str):
    s = str(status_str).strip().lower()
    if s == 'paid':
        return 'PAID'
    elif s == 'not paid':
        return 'NOT_PAID'
    elif s == 'partially paid':
        return 'PARTIALLY_PAID'
    return 'NOT_PAID'

def main():
    excel_path = r"C:\Users\Amear\OneDrive\Desktop\Graduation Day -2026  FEE STATUS 20-08-2026 - Group.xlsx"
    df = pd.read_excel(excel_path, sheet_name='ListofStudents-20.08.2026', header=2)
    
    df.columns = df.columns.str.strip()
    df = df.dropna(subset=['Roll No'])
    
    db_url = "postgresql://neondb_owner:npg_VsUkyHo34JNA@ep-crimson-glade-axgzv03m.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"
    engine = create_engine(db_url)
    
    with engine.connect() as conn:
        result = conn.execute(text('SELECT "studentId", "name", "paymentStatus" FROM "Candidate"'))
        existing_rows = result.fetchall()
        
    existing_dict = {row[0]: {'name': row[1], 'paymentStatus': row[2]} for row in existing_rows}
    
    new_candidates = []
    updated_candidates = []
    
    for _, row in df.iterrows():
        student_id = str(row['Roll No']).strip()
        name = str(row['Name']).strip()
        course = str(row['Course']).strip()
        branch = str(row['Branch']).strip()
        program = f"{course} {branch}"
        status = str(row['Status']).strip()
        
        normalized_status = normalize_status(status)
        
        if student_id not in existing_dict:
            new_candidates.append({
                'id': str(uuid.uuid4()),
                'studentId': student_id,
                'name': name,
                'program': program,
                'paymentStatus': status,
                'normalizedPaymentStatus': normalized_status,
                'eligibilityStatus': True if normalized_status == 'PAID' else False,
                'registrationStatus': 'NOT_REGISTERED',
                'createdAt': datetime.utcnow(),
                'updatedAt': datetime.utcnow()
            })
        else:
            existing = existing_dict[student_id]
            if existing['paymentStatus'] != status:
                updated_candidates.append({
                    'studentId': student_id,
                    'paymentStatus': status,
                    'normalizedPaymentStatus': normalized_status,
                    'eligibilityStatus': True if normalized_status == 'PAID' else False,
                    'updatedAt': datetime.utcnow()
                })

    # Execute Updates
    with engine.begin() as conn:
        # Insert New Candidates
        if new_candidates:
            insert_query = text("""
                INSERT INTO "Candidate" (
                    id, "studentId", name, program, "paymentStatus", "normalizedPaymentStatus", 
                    "eligibilityStatus", "registrationStatus", "createdAt", "updatedAt"
                ) VALUES (
                    :id, :studentId, :name, :program, :paymentStatus, :normalizedPaymentStatus,
                    :eligibilityStatus, :registrationStatus, :createdAt, :updatedAt
                )
            """)
            conn.execute(insert_query, new_candidates)
            print(f"Successfully inserted {len(new_candidates)} new candidates.")
        
        # Update Existing Candidates
        if updated_candidates:
            update_query = text("""
                UPDATE "Candidate"
                SET "paymentStatus" = :paymentStatus,
                    "normalizedPaymentStatus" = :normalizedPaymentStatus,
                    "eligibilityStatus" = :eligibilityStatus,
                    "updatedAt" = :updatedAt
                WHERE "studentId" = :studentId
            """)
            conn.execute(update_query, updated_candidates)
            print(f"Successfully updated {len(updated_candidates)} candidates.")
            
        if not new_candidates and not updated_candidates:
            print("No changes to apply.")

if __name__ == "__main__":
    main()
