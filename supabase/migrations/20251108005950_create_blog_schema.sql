/*
  # Blog System Database Schema
  
  ## Overview
  This migration creates a comprehensive blog system for a barber shop with posts, comments, and likes functionality.
  
  ## New Tables
  
  ### 1. `posts` - Blog articles
  - `id` (uuid, primary key) - Unique identifier for each post
  - `slug` (text, unique) - URL-friendly identifier (e.g., "kaip-issirinkti-tinkama-kirpima")
  - `title` (text) - Article title
  - `excerpt` (text) - Short description/preview text
  - `content` (text) - Full article content (supports Markdown/HTML)
  - `cover_image_url` (text) - URL to the cover image
  - `category` (text) - Category (e.g., 'haircuts', 'beard_care', 'styling_tips')
  - `reading_time_minutes` (integer) - Estimated reading time in minutes
  - `created_at` (timestamptz) - When the post was created
  - `updated_at` (timestamptz) - When the post was last updated
  - `is_published` (boolean, default true) - Whether the post is visible to users
  - `featured` (boolean, default false) - Whether to highlight this post
  
  ### 2. `comments` - User comments on posts
  - `id` (uuid, primary key) - Unique identifier for each comment
  - `post_id` (uuid, foreign key) - References the post this comment belongs to
  - `author_name` (text) - Name of the comment author
  - `author_email` (text) - Email of the comment author (for admin contact)
  - `body` (text) - Comment content
  - `created_at` (timestamptz) - When the comment was created
  - `is_approved` (boolean, default true) - Whether the comment is visible (for moderation)
  
  ### 3. `post_likes` - Like tracking for posts
  - `id` (uuid, primary key) - Unique identifier for each like
  - `post_id` (uuid, foreign key) - References the post that was liked
  - `created_at` (timestamptz) - When the like was created
  - `ip_address` (text, optional) - IP address for spam prevention
  
  ## Indexes
  - Unique index on `posts.slug` for fast URL lookups
  - Index on `comments.post_id` for fast comment retrieval
  - Index on `post_likes.post_id` for fast like counting
  - Index on `posts.created_at` for chronological sorting
  - Index on `posts.category` for category filtering
  
  ## Security (RLS Policies)
  
  ### Posts Table:
  - **SELECT**: Anyone can view published posts (is_published = true)
  - **INSERT/UPDATE/DELETE**: Only authenticated admin users
  
  ### Comments Table:
  - **SELECT**: Anyone can view approved comments (is_approved = true)
  - **INSERT**: Anyone can create comments (for moderation later)
  - **UPDATE/DELETE**: Only authenticated admin users
  
  ### Post Likes Table:
  - **SELECT**: Anyone can view likes (for counting)
  - **INSERT**: Anyone can create likes
  - **DELETE**: Only authenticated admin users (for spam management)
  
  ## Important Notes
  - All tables use CASCADE deletion: deleting a post removes its comments and likes
  - Email addresses in comments are stored for admin contact only
  - IP addresses in likes are optional and used for spam prevention
  - Admin access is controlled through authentication (can be extended with role-based access)
  - All timestamps use timezone-aware format
*/

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  cover_image_url text NOT NULL,
  category text NOT NULL,
  reading_time_minutes integer NOT NULL DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_published boolean DEFAULT true,
  featured boolean DEFAULT false,
  
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT reading_time_positive CHECK (reading_time_minutes > 0)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_email text NOT NULL,
  body text NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_approved boolean DEFAULT true,
  
  CONSTRAINT author_name_not_empty CHECK (length(trim(author_name)) > 0),
  CONSTRAINT author_email_format CHECK (author_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT body_not_empty CHECK (length(trim(body)) > 0)
);

-- Create post_likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  ip_address text,
  
  CONSTRAINT ip_address_format CHECK (ip_address IS NULL OR ip_address ~ '^(\d{1,3}\.){3}\d{1,3}$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$')
);

-- Create indexes for performance
CREATE UNIQUE INDEX IF NOT EXISTS posts_slug_idx ON posts(slug);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS posts_category_idx ON posts(category);
CREATE INDEX IF NOT EXISTS posts_published_idx ON posts(is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS comments_post_id_idx ON comments(post_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS post_likes_post_id_idx ON post_likes(post_id);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for posts table
CREATE POLICY "Anyone can view published posts"
  ON posts
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "Authenticated users can create posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for comments table
CREATE POLICY "Anyone can view approved comments"
  ON comments
  FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Anyone can create comments"
  ON comments
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update comments"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete comments"
  ON comments
  FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for post_likes table
CREATE POLICY "Anyone can view likes"
  ON post_likes
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create likes"
  ON post_likes
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete likes"
  ON post_likes
  FOR DELETE
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();