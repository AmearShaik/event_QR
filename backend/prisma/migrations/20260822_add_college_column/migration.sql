-- Add college column to Candidate table with default MVSR Engineering College
ALTER TABLE "Candidate" ADD COLUMN IF NOT EXISTS "college" TEXT NOT NULL DEFAULT 'MVSR Engineering College';

-- Create index for faster college-based queries
CREATE INDEX IF NOT EXISTS "Candidate_college_idx" ON "Candidate"("college");
