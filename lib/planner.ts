import { DAY_LABELS, FILIPINO_RECIPES, SERVINGS, getRecipeById } from "./recipes";
import { InventoryItem, MealPlanDay, ShoppingItem, WeeklyPlan } from "./types";

function normalize(name: string): string {
  return name.toLowerCase().trim();
}

function findStock(inventory: InventoryItem[], ingredientName: string): InventoryItem | undefined {
  const key = normalize(ingredientName);
  return inventory.find(
    (i) => normalize(i.name) === key || normalize(i.name).includes(key) || key.includes(normalize(i.name))
  );
}

function scoreRecipe(recipeId: string, inventory: InventoryItem[]): number {
  const recipe = getRecipeById(recipeId);
  if (!recipe) return 0;
  let total = 0;
  let have = 0;
  for (const ing of recipe.ingredients) {
    const weight = ing.optional ? 0.5 : 1;
    total += weight;
    const stock = findStock(inventory, ing.name);
    if (stock && stock.quantity > 0) have += weight;
  }
  return total === 0 ? 0 : have / total;
}

function buildShoppingList(inventory: InventoryItem[], recipeIds: string[]): ShoppingItem[] {
  const needed = new Map<string, ShoppingItem>();

  for (const id of recipeIds) {
    const recipe = getRecipeById(id);
    if (!recipe) continue;
    const factor = SERVINGS / recipe.baseServings;
    for (const ing of recipe.ingredients) {
      const required = ing.quantity * factor;
      const stock = findStock(inventory, ing.name);
      const onHand = stock?.quantity ?? 0;
      const missing = Math.max(0, required - onHand);
      if (missing <= 0) continue;
      const key = normalize(ing.name);
      const existing = needed.get(key);
      if (existing) {
        existing.quantity += missing;
      } else {
        needed.set(key, { name: ing.name, quantity: Math.round(missing * 10) / 10, unit: ing.unit });
      }
    }
  }

  return Array.from(needed.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function generateWeeklyPlan(inventory: InventoryItem[]): WeeklyPlan {
  const usedProteins = new Set<string>();
  const selectedIds: string[] = [];

  const ranked = [...FILIPINO_RECIPES]
    .map((r) => ({ id: r.id, score: scoreRecipe(r.id, inventory), protein: r.protein }))
    .sort((a, b) => b.score - a.score);

  for (const candidate of ranked) {
    if (selectedIds.length >= 7) break;
    if (selectedIds.includes(candidate.id)) continue;
    if (usedProteins.has(candidate.protein) && selectedIds.length < 5) continue;
    selectedIds.push(candidate.id);
    usedProteins.add(candidate.protein);
  }

  for (const candidate of ranked) {
    if (selectedIds.length >= 7) break;
    if (!selectedIds.includes(candidate.id)) selectedIds.push(candidate.id);
  }

  const days: MealPlanDay[] = selectedIds.slice(0, 7).map((recipeId, dayIndex) => {
    const recipe = getRecipeById(recipeId)!;
    return {
      dayIndex,
      dayLabel: DAY_LABELS[dayIndex],
      recipeId,
      recipeName: recipe.name,
      cooked: false,
    };
  });

  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  const day = weekStart.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  weekStart.setDate(weekStart.getDate() + diff);

  return {
    weekStart: weekStart.toISOString().slice(0, 10),
    servings: SERVINGS,
    days,
    shoppingList: buildShoppingList(inventory, selectedIds.slice(0, 7)),
    generatedAt: new Date().toISOString(),
  };
}

export function deductRecipeFromInventory(
  inventory: InventoryItem[],
  recipeId: string
): InventoryItem[] {
  const recipe = getRecipeById(recipeId);
  if (!recipe) return inventory;
  const factor = SERVINGS / recipe.baseServings;
  const updated = inventory.map((i) => ({ ...i }));

  for (const ing of recipe.ingredients) {
    const useQty = ing.quantity * factor;
    const idx = updated.findIndex(
      (i) =>
        normalize(i.name) === normalize(ing.name) ||
        normalize(i.name).includes(normalize(ing.name)) ||
        normalize(ing.name).includes(normalize(i.name))
    );
    if (idx >= 0) {
      updated[idx] = {
        ...updated[idx],
        quantity: Math.max(0, updated[idx].quantity - useQty),
        updatedAt: new Date().toISOString(),
      };
    }
  }
  return updated;
}

export function getLowStockItems(inventory: InventoryItem[]): InventoryItem[] {
  return inventory.filter((i) => i.quantity <= i.minThreshold);
}
