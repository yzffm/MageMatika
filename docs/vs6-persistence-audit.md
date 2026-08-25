# VS6 Persistence Audit

## A. Current Student Identity
- **Storage:** `sessionStorage`
- **Keys:** `studentName`, `studentLevel`, `studentClass`
- **Mechanism:** Managed by `src/hooks/useStudentContext.js`.
- **Note:** This is purely an application identity for the current session. It is not an authenticated Supabase user identity.

## B. Current Progress Model
- **Storage:** `sessionStorage`
- **Key:** `magematika_progress`
- **Structure:**
  ```json
  {
    "totalXP": 0,
    "completedChallenges": ["tas-jali-jali-sd-challenge-01"],
    "attempts": {
      "tas-jali-jali-sd-challenge-01": 1
    }
  }
  ```
- **Mechanism:** Managed by `src/hooks/useProgress.js`.
- **Duplicate Prevention:** Handled in `completeChallenge` by checking if the challenge ID is already in the `completedChallenges` array.

## C. Current Challenge Model
- **File:** `public/data/challenges.json`
- **Structure:**
  ```json
  {
    "id": "tas-jali-jali-sd-challenge-01",
    "learningModuleId": "tas-jali-jali-sd",
    "level": "SD",
    "type": "numeric",
    "title": "Tantangan Luas Anyaman",
    "reward": { "xp": 20 }
  }
  ```
- **Identifier:** `id` is a stable string.

## D. Supabase Client
- **File:** `src/lib/supabase.js`
- **Initialization:** Uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- **Existing Helpers:** Contains `insertProgress(payload)` which inserts into the `progress` table.
- **Error Handling:** Logs errors to the console, but the app does not currently handle them robustly in the UI.
- **Authentication:** No Supabase Auth is implemented.

## E. Actual Supabase Schema
**Supabase schema could not be fully verified from repository sources.**
- **Reason:** There is no `supabase` directory, no migration files, and no SQL setup scripts in the repository.
- **Inferred Legacy Schema (from `supabase.js`):** 
  `progress(student_name, class, location_id, checkpoint_score)`
- **Limitation:** We cannot verify if there are unique constraints, primary keys, or if RLS policies would allow extending this table without breaking legacy AR features. We also cannot verify if we have permissions to create a new table.

---

## Conclusion & Strategy
Because the schema cannot be safely modified or verified from the repository (and we must not invent it), we must select **OPTION C: Schema cannot be safely modified**.

### VS6 Implementation Plan:
1. **Fix Challenge Back Navigation:** We will use React Router state (`state: { from: '/missions' }`) to conditionally navigate back to the originating page, defaulting to `/math/:moduleId` if state is absent.
2. **Persistence Abstraction:** We will extract the persistence logic into a new abstraction (`src/domain/progress/persistenceAdapter.js`). This adapter will support both `sessionStorage` (local-first authority) and `Supabase` (optional async synchronization).
3. **Local-First Progress:** `useProgress.js` will rely on `sessionStorage` as the authoritative source of truth, attempting to push to Supabase asynchronously without blocking the UI or removing XP on network failure. Failures will be caught internally and logged without disrupting the student.
4. **Deferred Supabase Migration:** We will write a schema recommendation in `docs/vs6-persistence-migration.md` for a new `challenge_progress` table. This SQL must NOT be executed automatically. The code will fallback gracefully when the table doesn't exist, preserving existing `sessionStorage` functionality.
5. **Identity Limitation Documentation:** The application currently relies on `studentName`, `studentLevel`, and `studentClass` as a session identity, NOT a secure authenticated user identity. True secure cross-device persistence requires a future authentication mechanism. Supabase persistence in VS6 will be designed idempotently based on `studentName` and `challengeId`, but acknowledges this limitation.
6. **Legacy Compatibility:** The legacy `insertProgress` function in `supabase.js` will remain completely untouched to preserve AR compatibility.
