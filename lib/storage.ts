import AsyncStorage from "@react-native-async-storage/async-storage";
import { InventoryItem, ScanSession, WeeklyPlan } from "./types";

const KEYS = {
  inventory: "@lutong/inventory",
  weeklyPlan: "@lutong/weeklyPlan",
  scanHistory: "@lutong/scanHistory",
} as const;

export async function loadInventory(): Promise<InventoryItem[]> {
  const raw = await AsyncStorage.getItem(KEYS.inventory);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as InventoryItem[];
  } catch {
    return [];
  }
}

export async function saveInventory(items: InventoryItem[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.inventory, JSON.stringify(items));
}

export async function loadWeeklyPlan(): Promise<WeeklyPlan | null> {
  const raw = await AsyncStorage.getItem(KEYS.weeklyPlan);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WeeklyPlan;
  } catch {
    return null;
  }
}

export async function saveWeeklyPlan(plan: WeeklyPlan | null): Promise<void> {
  if (!plan) {
    await AsyncStorage.removeItem(KEYS.weeklyPlan);
    return;
  }
  await AsyncStorage.setItem(KEYS.weeklyPlan, JSON.stringify(plan));
}

export async function loadScanHistory(): Promise<ScanSession[]> {
  const raw = await AsyncStorage.getItem(KEYS.scanHistory);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ScanSession[];
  } catch {
    return [];
  }
}

export async function saveScanHistory(sessions: ScanSession[]): Promise<void> {
  const trimmed = sessions.slice(0, 20);
  await AsyncStorage.setItem(KEYS.scanHistory, JSON.stringify(trimmed));
}

export async function clearAllMemory(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.inventory, KEYS.weeklyPlan, KEYS.scanHistory]);
}
