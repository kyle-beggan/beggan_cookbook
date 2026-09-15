import { scrapeRecipeFromUrl } from './src/app/actions/scrapeRecipe.ts';

async function test() {
  const result = await scrapeRecipeFromUrl('https://www.savoryonline.com/recipes/tuna-salad-seaweed-snacks/');
  console.log(JSON.stringify(result, null, 2));
}

test();
