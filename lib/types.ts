export type StorageLocation = "fridge" | "pantry" | "freezer";

export interface InventoryItem {
  id: string;
  name: string;
  location: StorageLocation;
  quantity: number;
  unit: string;
  minThreshold: number;
  updatedAt: string;
}

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  optional?: boolean;
}

export interface FilipinoRecipe {
  id: string;
  name: string;
  nameTl: string;
  protein: "pork" | "chicken" | "beef" | "fish" | "seafood" | "veg";
  baseServings: number;
  prepMinutes: number;
  cookMinutes: number;
  ingredients: RecipeIngredient[];
  steps: string[];
}

export interface MealPlanDay {
  dayIndex: number;
  dayLabel: string;
  recipeId: string;
  recipeName: string;
  cooked: boolean;
}

export interface WeeklyPlan {
  weekStart: string;
  servings: number;
  days: MealPlanDay[];
  shoppingList: ShoppingItem[];
  generatedAt: string;
}

export interface ShoppingItem {
  name: string;
  quantity: number;
  unit: string;
}

export interface DetectedItem {
  name: string;
  quantity: number;
  unit: string;
  location: StorageLocation;
  confidence: number;
}

export interface ScanSession {
  id: string;
  location: StorageLocation;
  detected: DetectedItem[];
  createdAt: string;
}
