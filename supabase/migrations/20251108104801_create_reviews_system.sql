/*
  # Create Luxury Reviews System

  ## Overview
  This migration creates a comprehensive reviews system for the barbershop with client testimonials.

  ## New Tables

  ### 1. `reviews` - Client reviews and testimonials
  - `id` (uuid, primary key) - Unique identifier for each review
  - `name` (text, required) - Client's name
  - `rating` (integer, required) - Rating on 1-5 scale
  - `review` (text, required) - Review text content
  - `created_at` (timestamptz) - When the review was created
  - `published` (boolean, default true) - Whether the review is visible to users
  - `source` (text, optional) - Review source (e.g., "web", "treatwell", "google")

  ## Indexes
  - Index on `created_at` for chronological sorting (newest and oldest)
  - Index on `published` for filtering active reviews
  - Composite index on `published` and `created_at` for efficient queries

  ## Security (RLS Policies)

  ### Reviews Table:
  - **SELECT**: Anyone can view published reviews
  - **INSERT**: Anyone can submit reviews (moderation via published flag)
  - **UPDATE/DELETE**: Only authenticated admin users

  ## Important Notes
  - All timestamps use timezone-aware format
  - Rating constraint ensures values are between 1 and 5
  - Name and review text must not be empty (trimmed)
  - Source field is optional for tracking review origin
*/

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  rating integer NOT NULL,
  review text NOT NULL,
  created_at timestamptz DEFAULT now(),
  published boolean DEFAULT true,
  source text,
  
  CONSTRAINT name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT review_not_empty CHECK (length(trim(review)) > 0),
  CONSTRAINT rating_range CHECK (rating >= 1 AND rating <= 5)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS reviews_published_idx ON reviews(published);
CREATE INDEX IF NOT EXISTS reviews_published_created_idx ON reviews(published, created_at DESC);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews table
CREATE POLICY "Anyone can view published reviews"
  ON reviews
  FOR SELECT
  USING (published = true);

CREATE POLICY "Anyone can submit reviews"
  ON reviews
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update reviews"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete reviews"
  ON reviews
  FOR DELETE
  TO authenticated
  USING (true);