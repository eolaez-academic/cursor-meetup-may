import {
  deductRecipeFromInventory,
  generateWeeklyPlan,
  getLowStockItems,
} from "../lib/planner";
import { FILIPINO_RECIPES, SERVINGS } from "../lib/recipes";
import { InventoryItem } from "../lib/types";

function makeItem(
  name: string,
  quantity: number,
  minThreshold = 1
): InventoryItem {
  return {
    id: `test-${name}`,
    name,
    location: "pantry",
    quantity,
    unit: "pcs",
    minThreshold,
    updatedAt: new Date().toISOString(),
  };
}

describe("generateWeeklyPlan", () => {
  it("generates exactly 7 days", () => {
    const plan = generateWeeklyPlan([]);
    expect(plan.days).toHaveLength(7);
  });

  it("uses 4 servings", () => {
    const plan = generateWeeklyPlan([]);
    expect(plan.servings).toBe(SERVINGS);
  });

  it("has no duplicate recipes in the same week", () => {
    const plan = generateWeeklyPlan([
      makeItem("soy sauce", 500),
      makeItem("garlic", 20),
      makeItem("chicken thighs", 2),
    ]);
    const ids = plan.days.map((d) => d.recipeId);
    expect(new Set(ids).size).toBe(7);
  });

  it("maps days Mon through Sun", () => {
    const plan = generateWeeklyPlan([]);
    expect(plan.days.map((d) => d.dayLabel)).toEqual([
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ]);
  });

  it("only selects valid Filipino recipe ids", () => {
    const validIds = new Set(FILIPINO_RECIPES.map((r) => r.id));
    const plan = generateWeeklyPlan([]);
    for (const day of plan.days) {
      expect(validIds.has(day.recipeId)).toBe(true);
    }
  });

  it("builds a shopping list when inventory is empty", () => {
    const plan = generateWeeklyPlan([]);
    expect(plan.shoppingList.length).toBeGreaterThan(0);
  });

  it("reduces shopping list when staples are in stock", () => {
    const empty = generateWeeklyPlan([]);
    const stocked = generateWeeklyPlan([
      makeItem("soy sauce", 500),
      makeItem("vinegar", 500),
      makeItem("garlic", 50),
      makeItem("onion", 10),
      makeItem("tomato sauce", 5),
      makeItem("coconut milk", 5),
    ]);
    expect(stocked.shoppingList.length).toBeLessThanOrEqual(empty.shoppingList.length);
  });
});

describe("deductRecipeFromInventory", () => {
  it("reduces matching ingredient quantities", () => {
    const inventory = [
      makeItem("soy sauce", 200),
      makeItem("garlic", 10),
    ];
    const after = deductRecipeFromInventory(inventory, "adobo-chicken");
    const soy = after.find((i) => i.name === "soy sauce");
    const garlic = after.find((i) => i.name === "garlic");
    expect(soy!.quantity).toBeLessThan(200);
    expect(garlic!.quantity).toBeLessThan(10);
  });

  it("does not go below zero", () => {
    const inventory = [makeItem("soy sauce", 10)];
    const after = deductRecipeFromInventory(inventory, "adobo-chicken");
    expect(after[0].quantity).toBe(0);
  });

  it("returns unchanged inventory for unknown recipe", () => {
    const inventory = [makeItem("rice", 5)];
    const after = deductRecipeFromInventory(inventory, "not-a-recipe");
    expect(after[0].quantity).toBe(5);
  });
});

describe("getLowStockItems", () => {
  it("returns items at or below threshold", () => {
    const items = [
      makeItem("eggs", 3, 3),
      makeItem("milk", 1, 1),
      makeItem("rice", 10, 2),
    ];
    const low = getLowStockItems(items);
    expect(low.map((i) => i.name).sort()).toEqual(["eggs", "milk"]);
  });

  it("returns empty when all stock is above threshold", () => {
    const items = [makeItem("rice", 10, 2)];
    expect(getLowStockItems(items)).toHaveLength(0);
  });
});
