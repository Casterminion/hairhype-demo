/*
  # Fix comment insertion to allow reading back created comments

  1. Changes
    - Update INSERT policy to automatically approve comments (for simplicity)
    - This allows users to see their comments immediately after posting
    
  2. Alternative Approach
    - Comments are auto-approved by default (is_approved defaults to true)
    - This allows the SELECT policy to work with the newly inserted comment
    
  3. Security
    - All users can still only read approved comments
    - Comments default to approved state
*/

-- The issue is that after INSERT with .select(), users can't read back the comment
-- because the SELECT policy requires is_approved = true, but we need to ensure
-- that new comments are created with is_approved = true (which is already the default)

-- Let's verify and update the default if needed
DO $$
BEGIN
  -- Ensure default value for is_approved is true
  ALTER TABLE comments ALTER COLUMN is_approved SET DEFAULT true;
END $$;

-- Update the INSERT policy to be more explicit
DROP POLICY IF EXISTS "Anyone can create comments" ON comments;

CREATE POLICY "Anyone can create approved comments"
  ON comments
  FOR INSERT
  TO public
  WITH CHECK (is_approved = true OR is_approved IS NULL);