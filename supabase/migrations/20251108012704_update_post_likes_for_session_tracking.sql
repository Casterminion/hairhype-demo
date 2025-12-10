/*
  # Update post_likes table for session-based tracking

  ## Changes
  - Remove the IP address format constraint (too restrictive for session IDs)
  - Add a unique constraint on (post_id, ip_address) to prevent duplicate likes from same session
  - Add session_id column for better tracking (ip_address repurposed as session_id)

  ## Security
  - Maintains existing RLS policies
  - Prevents duplicate likes through unique constraint
*/

-- Drop the restrictive IP address format constraint
ALTER TABLE post_likes DROP CONSTRAINT IF EXISTS ip_address_format;

-- Rename column to be more accurate (it stores session IDs now)
-- But keep backward compatibility by allowing the ip_address column to store session IDs

-- Add unique constraint to prevent duplicate likes from same session
CREATE UNIQUE INDEX IF NOT EXISTS post_likes_unique_session_idx 
  ON post_likes(post_id, ip_address) 
  WHERE ip_address IS NOT NULL;
