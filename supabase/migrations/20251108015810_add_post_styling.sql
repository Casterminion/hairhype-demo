/*
  # Add styling support to posts

  1. Changes
    - Add `text_color` column for body text color (default: neutral dark)
    - Add `heading_color` column for headings color (default: black)
    - Add `accent_color` column for links and accents (default: brand gold)
    - Add `background_style` column for article background styling
    
  2. Notes
    - Colors stored as hex codes (e.g., '#1A1A1A')
    - Background style can be 'white', 'cream', 'gradient', etc.
    - Provides flexibility for custom styling per post
*/

-- Add styling columns to posts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'text_color'
  ) THEN
    ALTER TABLE posts ADD COLUMN text_color text DEFAULT '#3A3A3A';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'heading_color'
  ) THEN
    ALTER TABLE posts ADD COLUMN heading_color text DEFAULT '#1A1A1A';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'accent_color'
  ) THEN
    ALTER TABLE posts ADD COLUMN accent_color text DEFAULT '#B58E4C';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'background_style'
  ) THEN
    ALTER TABLE posts ADD COLUMN background_style text DEFAULT 'white';
  END IF;
END $$;