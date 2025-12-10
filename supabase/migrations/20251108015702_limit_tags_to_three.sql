/*
  # Limit posts to maximum 3 tags

  1. Changes
    - Add check constraint to ensure tags array has maximum 3 elements
    - Update existing posts to have only first 3 tags if they exceed the limit

  2. Security
    - Constraint ensures data integrity at database level
*/

-- First, update any existing posts that have more than 3 tags
UPDATE posts 
SET tags = tags[1:3] 
WHERE array_length(tags, 1) > 3;

-- Add constraint to limit tags to maximum 3
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'posts_tags_max_three'
  ) THEN
    ALTER TABLE posts 
    ADD CONSTRAINT posts_tags_max_three 
    CHECK (array_length(tags, 1) IS NULL OR array_length(tags, 1) <= 3);
  END IF;
END $$;