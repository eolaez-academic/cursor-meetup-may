import { Link, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { getLowStockItems } from "../../lib/planner";
import { loadInventory, loadWeeklyPlan } from "../../lib/storage";
import { WeeklyPlan } from "../../lib/types";

export default function HomeScreen() {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [lowCount, setLowCount] = useState(0);
  const [tonight, setTonight] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const inv = await loadInventory();
        const p = await loadWeeklyPlan();
        setPlan(p);
        setLowCount(getLowStockItems(inv).length);
        const today = new Date().getDay();
        const idx = today === 0 ? 6 : today - 1;
        setTonight(p?.days[idx]?.recipeName ?? null);
      })();
    }, [])
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Lutong Bahay</Text>
        <Text style={styles.heroSub}>Filipino dinner planner for 4</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Tonight</Text>
        <Text style={styles.cardValue}>{tonight ?? "Generate your week plan"}</Text>
      </View>

      {lowCount > 0 && (
        <View style={[styles.card, styles.warn]}>
          <Text style={styles.warnText}>{lowCount} item(s) running low</Text>
        </View>
      )}

      <Link href="/scan" asChild>
        <Pressable style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Scan fridge or pantry</Text>
        </Pressable>
      </Link>

      <Link href="/(tabs)/plan" asChild>
        <Pressable style={styles.secondaryBtn}>
          <Text style={styles.secondaryBtnText}>
            {plan ? "View weekly plan" : "Create weekly plan"}
          </Text>
        </Pressable>
      </Link>

      <Link href="/(tabs)/inventory" asChild>
        <Pressable style={styles.secondaryBtn}>
          <Text style={styles.secondaryBtnText}>Manage stock</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF8F0" },
  content: { padding: 20, gap: 14 },
  hero: {
    backgroundColor: "#8B0000",
    borderRadius: 16,
    padding: 24,
  },
  heroTitle: { fontSize: 28, fontWeight: "800", color: "#fff" },
  heroSub: { fontSize: 14, color: "#FFD7D7", marginTop: 4 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardLabel: { fontSize: 12, color: "#888", textTransform: "uppercase" },
  cardValue: { fontSize: 20, fontWeight: "700", color: "#222", marginTop: 4 },
  warn: { backgroundColor: "#FFF3CD", borderColor: "#FFE69C" },
  warnText: { color: "#856404", fontWeight: "600" },
  primaryBtn: {
    backgroundColor: "#8B0000",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  secondaryBtn: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#8B0000",
  },
  secondaryBtnText: { color: "#8B0000", fontWeight: "600", fontSize: 16 },
});
