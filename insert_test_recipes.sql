-- Run this in your Supabase SQL Editor to add test recipes
INSERT INTO cookbook_recipes (
  title, 
  category, 
  description, 
  ingredients, 
  prep_instructions, 
  prep_time, 
  cook_time, 
  difficulty,
  cuisine
) VALUES 
(
  'Classic Homemade Pizza', 
  'Dinner', 
  'A delicious family-favorite pizza with a crispy crust and fresh toppings.', 
  '["2 cups flour", "1 packet yeast", "1 tsp salt", "1 tbsp olive oil", "3/4 cup warm water", "1/2 cup tomato sauce", "2 cups mozzarella cheese"]'::jsonb, 
  '1. Mix flour, yeast, and salt. 2. Add water and oil, knead for 5 mins. 3. Let rise for 30 mins. 4. Roll out dough. 5. Add sauce and cheese.', 
  '45 mins', 
  '15 mins',
  'Medium',
  'Italian'
),
(
  'Quick Breakfast Smoothie', 
  'Breakfast', 
  'A fast and healthy start to your day.', 
  '["1 banana", "1/2 cup strawberries", "1 cup spinach", "1/2 cup almond milk", "1 scoop protein powder"]'::jsonb, 
  '1. Add all ingredients to blender. 2. Blend until smooth. 3. Serve immediately.', 
  '5 mins', 
  '0 mins',
  'Easy',
  'American'
),
(
  'Grandma''s Chocolate Chip Cookies', 
  'Dessert', 
  'The best cookies you will ever have.', 
  '["2 1/4 cups flour", "1 tsp baking soda", "1 cup butter", "3/4 cup sugar", "3/4 cup brown sugar", "2 eggs", "2 cups chocolate chips"]'::jsonb, 
  '1. Cream butter and sugars. 2. Beat in eggs. 3. Mix in dry ingredients. 4. Stir in chocolate chips. 5. Bake at 375°F for 10 mins.', 
  '15 mins', 
  '10 mins',
  'Easy',
  'American'
);
