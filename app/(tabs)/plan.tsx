import { Link, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  deductRecipeFromInventory,
  generateWeeklyPlan,
  getLowStockItems,
} from "../../lib/planner";
import { notifyLowStock, notifyPlanReady } from "../../lib/notifications";
import { loadInventory, loadWeeklyPlan, saveInventory, saveWeeklyPlan } from "../../lib/storage";
import { WeeklyPlan } from "../../lib/types";

export default function PlanScreen() {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const router = useRouter();

  const refresh = useCallback(async () => {
    setPlan(await loadWeeklyPlan());
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const generate = async () => {
    const inv = await loadInventory();
    if (inv.length === 0) {
      Alert.alert(
        "No stock yet",
        "Scan your fridge/pantry or add items first for a smarter plan."
      );
    }
    const newPlan = generateWeeklyPlan(inv);
    await saveWeeklyPlan(newPlan);
    setPlan(newPlan);
    await notifyPlanReady(newPlan.days.length);
  };

  const markCooked = async (dayIndex: number) => {
    if (!plan) return;
    const day = plan.days[dayIndex];
    if (day.cooked) return;

    let inv = await loadInventory();
    inv = deductRecipeFromInventory(inv, day.recipeId);
    await saveInventory(inv);

    const updated: WeeklyPlan = {
      ...plan,
      days: plan.days.map((d, i) => (i === dayIndex ? { ...d, cooked: true } : d)),
    };
    await saveWeeklyPlan(updated);
    setPlan(updated);

    const low = getLowStockItems(inv);
    if (low.length) await notifyLowStock(low);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.generateBtn} onPress={generate}>
        <Text style={styles.generateText}>Generate 7 Filipino dinners (4 pax)</Text>
      </Pressable>

      {!plan && (
        <Text style={styles.hint}>No repeat dishes in the same week. Based on your stock.</Text>
      )}

      {plan?.days.map((day) => (
        <View key={day.dayIndex} style={styles.dayCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.dayLabel}>{day.dayLabel}</Text>
            <Text style={styles.dishName}>{day.recipeName}</Text>
            {day.cooked && <Text style={styles.cooked}>Cooked — stock updated</Text>}
          </View>
          <View style={styles.actions}>
            <Link href={`/recipe/${day.recipeId}`} asChild>
              <Pressable style={styles.smallBtn}>
                <Text style={styles.smallBtnText}>Recipe</Text>
              </Pressable>
            </Link>
            {!day.cooked && (
              <Pressable style={styles.cookBtn} onPress={() => markCooked(day.dayIndex)}>
                <Text style={styles.cookBtnText}>Cooked</Text>
              </Pressable>
            )}
          </View>
        </View>
      ))}

      {plan && plan.shoppingList.length > 0 && (
        <View style={styles.shopCard}>
          <Text style={styles.shopTitle}>Shopping list</Text>
          {plan.shoppingList.map((s) => (
            <Text key={s.name} style={styles.shopItem}>
              · {s.name} — {s.quantity} {s.unit}
            </Text>
          ))}
        </View>
      )}

      <Pressable
        style={styles.linkBtn}
        onPress={() => router.push("/scan")}
      >
        <Text style={styles.linkBtnText}>Update stock from photo</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF8F0" },
  content: { padding: 16, gap: 12 },
  generateBtn: {
    backgroundColor: "#8B0000",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  generateText: { color: "#fff", fontWeight: "700" },
  hint: { color: "#666", textAlign: "center", fontSize: 13 },
  dayCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    gap: 8,
  },
  dayLabel: { fontSize: 12, color: "#8B0000", fontWeight: "700" },
  dishName: { fontSize: 17, fontWeight: "700", marginTop: 2 },
  cooked: { fontSize: 12, color: "#2e7d32", marginTop: 4 },
  actions: { gap: 6 },
  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#8B0000",
  },
  smallBtnText: { color: "#8B0000", fontSize: 12, fontWeight: "600" },
  cookBtn: {
    backgroundColor: "#2e7d32",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cookBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  shopCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  shopTitle: { fontWeight: "800", fontSize: 16, marginBottom: 8 },
  shopItem: { fontSize: 14, color: "#333", marginBottom: 4 },
  linkBtn: { alignItems: "center", padding: 12 },
  linkBtnText: { color: "#8B0000", fontWeight: "600" },
});
