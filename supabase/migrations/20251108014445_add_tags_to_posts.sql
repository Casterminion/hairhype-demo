/*
  # Add tags support to posts

  1. Changes
    - Add `tags` column to `posts` table as a text array to store post tags
    - Create an index on tags for faster tag-based queries

  2. Notes
    - Tags will be stored as an array of strings (e.g., ['kirpimas', 'stilius', 'priežiūra'])
    - This allows flexible tagging and efficient similarity matching
*/

-- Add tags column to posts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'tags'
  ) THEN
    ALTER TABLE posts ADD COLUMN tags text[] DEFAULT '{}';
  END IF;
END $$;

-- Create index on tags for faster queries
CREATE INDEX IF NOT EXISTS posts_tags_idx ON posts USING GIN (tags);