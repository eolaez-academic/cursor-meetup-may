import { DAY_LABELS, FILIPINO_RECIPES, SERVINGS, getRecipeById } from "../lib/recipes";

describe("FILIPINO_RECIPES", () => {
  it("has at least 7 recipes for a full week", () => {
    expect(FILIPINO_RECIPES.length).toBeGreaterThanOrEqual(7);
  });

  it("has unique recipe ids", () => {
    const ids = FILIPINO_RECIPES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("defaults all recipes to 4 base servings", () => {
    for (const recipe of FILIPINO_RECIPES) {
      expect(recipe.baseServings).toBe(4);
    }
  });

  it("each recipe has ingredients and steps", () => {
    for (const recipe of FILIPINO_RECIPES) {
      expect(recipe.ingredients.length).toBeGreaterThan(0);
      expect(recipe.steps.length).toBeGreaterThan(0);
      expect(recipe.name).toBeTruthy();
      expect(recipe.nameTl).toBeTruthy();
    }
  });
});

describe("getRecipeById", () => {
  it("returns recipe when id exists", () => {
    const recipe = getRecipeById("adobo-chicken");
    expect(recipe?.name).toBe("Chicken Adobo");
  });

  it("returns undefined for unknown id", () => {
    expect(getRecipeById("unknown")).toBeUndefined();
  });
});

describe("constants", () => {
  it("SERVINGS is 4 for dinner", () => {
    expect(SERVINGS).toBe(4);
  });

  it("DAY_LABELS covers a week", () => {
    expect(DAY_LABELS).toHaveLength(7);
  });
});
