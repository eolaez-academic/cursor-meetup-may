import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { InventoryItem } from "./types";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function ensureNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return false;
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("low-stock", {
      name: "Low stock alerts",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  return true;
}

export async function notifyLowStock(items: InventoryItem[]): Promise<void> {
  if (!items.length) return;
  const ok = await ensureNotificationPermissions();
  if (!ok) return;

  const names = items
    .slice(0, 3)
    .map((i) => `${i.name} (${i.quantity} ${i.unit})`)
    .join(", ");
  const more = items.length > 3 ? ` +${items.length - 3} more` : "";

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Low stock — Lutong Bahay",
      body: `Running low: ${names}${more}`,
      data: { type: "low_stock" },
    },
    trigger: null,
  });
}

export async function notifyPlanReady(dishCount: number): Promise<void> {
  const ok = await ensureNotificationPermissions();
  if (!ok) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Weekly dinner plan ready",
      body: `${dishCount} Filipino dinners planned for 4 — no repeats this week!`,
      data: { type: "plan_ready" },
    },
    trigger: null,
  });
}
