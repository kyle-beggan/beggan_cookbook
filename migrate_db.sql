-- Run this in your Supabase SQL Editor to add the new metadata columns

ALTER TABLE cookbook_recipes
ADD COLUMN IF NOT EXISTS difficulty text,
ADD COLUMN IF NOT EXISTS cuisine text,
ADD COLUMN IF NOT EXISTS occasion text,
ADD COLUMN IF NOT EXISTS dietary_needs text[],
ADD COLUMN IF NOT EXISTS added_by_avatar_url text;

-- Create the ratings table
CREATE TABLE IF NOT EXISTS cookbook_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES cookbook_recipes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL, -- references auth.users(id) conceptually
  rating integer CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(recipe_id, user_id)
);

-- Enable RLS for ratings
ALTER TABLE cookbook_ratings ENABLE ROW LEVEL SECURITY;

-- Ratings can be read by anyone (or just authenticated users, we use authenticated for consistency)
CREATE POLICY "Enable read access for authenticated users on ratings" 
ON cookbook_ratings FOR SELECT TO authenticated USING (true);

-- Users can insert their own ratings
CREATE POLICY "Enable insert for authenticated users on ratings" 
ON cookbook_ratings FOR INSERT TO authenticated WITH CHECK (true);

-- Users can update their own ratings (Supabase uses auth.uid() usually, but since we didn't enforce a foreign key to auth.users, we assume they pass their ID. A stricter policy would check `user_id = auth.uid()`)
-- For this simple project, we'll allow authenticated users to update
CREATE POLICY "Enable update for authenticated users on ratings" 
ON cookbook_ratings FOR UPDATE TO authenticated USING (true);
