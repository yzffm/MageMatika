# VS6 Persistence Migration Proposal

## Identity and Authentication Limitation
> **IMPORTANT:** MageMatika currently uses `sessionStorage` for student context (`studentName`, `studentLevel`, `studentClass`). This is **not** a secure, authenticated Supabase user identity. 
> 
> True secure cross-device persistence requires a stable authenticated identity (e.g., Supabase Auth). The proposed schema below relies on `studentName` combined with `studentClass` as a best-effort, non-secure identifier. Because of this limitation, the UI will treat `sessionStorage` as the authoritative source of truth, treating this Supabase table strictly as an optional backup/sync mechanism.

## Proposed Supabase Persistence Schema
The following SQL creates a generic `challenge_progress` table that is independent of the legacy `progress` table used by AR checkpoints.

*Note: This SQL is for human/database-admin review and execution. The application does not run this automatically.*

```sql
-- Create the challenge_progress table
CREATE TABLE IF NOT EXISTS public.challenge_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name text NOT NULL,
  student_class text NOT NULL,
  challenge_id text NOT NULL,
  xp_awarded integer NOT NULL,
  completed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Create a unique constraint to ensure idempotent syncing (no duplicate XP per student/challenge)
  UNIQUE(student_name, student_class, challenge_id)
);

-- Enable RLS
ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;

-- Create an insert policy for anon keys (since we don't have authenticated users)
-- In a real production scenario, this should be scoped to auth.uid()
CREATE POLICY "Allow anonymous inserts for challenge progress" 
  ON public.challenge_progress
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create a select policy for anon keys
CREATE POLICY "Allow anonymous reads for challenge progress"
  ON public.challenge_progress
  FOR SELECT
  TO anon
  USING (true);
```

## Legacy Compatibility
This new schema does not modify or drop the existing `progress` table (`student_name, class, location_id, checkpoint_score`), ensuring that legacy AR checkpoints remain 100% functional.
