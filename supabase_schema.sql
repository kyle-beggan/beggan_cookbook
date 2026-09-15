-- Run this SQL in your Supabase project's SQL Editor

CREATE TABLE cookbook_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  description text,
  ingredients jsonb NOT NULL,
  prep_instructions text NOT NULL,
  cook_instructions text,
  prep_time text,
  cook_time text,
  source_url text,
  image_url text,
  added_by_name text,
  difficulty text,
  cuisine text,
  occasion text,
  dietary_needs text[],
  added_by_avatar_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create the ratings table
CREATE TABLE cookbook_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES cookbook_recipes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(recipe_id, user_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE cookbook_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cookbook_ratings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all recipes
CREATE POLICY "Enable read access for authenticated users" 
ON cookbook_recipes FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert recipes
CREATE POLICY "Enable insert for authenticated users" 
ON cookbook_recipes FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users to update their recipes
CREATE POLICY "Enable update for authenticated users" 
ON cookbook_recipes FOR UPDATE TO authenticated USING (true);

-- Allow authenticated users to delete recipes
CREATE POLICY "Enable delete for authenticated users" 
ON cookbook_recipes FOR DELETE TO authenticated USING (true);

-- Ratings Policies
CREATE POLICY "Enable read access for authenticated users on ratings" 
ON cookbook_ratings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users on ratings" 
ON cookbook_ratings FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users on ratings" 
ON cookbook_ratings FOR UPDATE TO authenticated USING (true);
