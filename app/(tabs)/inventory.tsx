import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { getLowStockItems } from "../../lib/planner";
import { loadInventory, saveInventory } from "../../lib/storage";
import { InventoryItem, StorageLocation } from "../../lib/types";

export default function InventoryScreen() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filter, setFilter] = useState<StorageLocation | "all">("all");
  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");

  const refresh = useCallback(async () => {
    setItems(await loadInventory());
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const filtered =
    filter === "all" ? items : items.filter((i) => i.location === filter);

  const addItem = async () => {
    if (!name.trim()) return;
    const newItem: InventoryItem = {
      id: `item-${Date.now()}`,
      name: name.trim(),
      location: filter === "all" ? "pantry" : filter,
      quantity: parseFloat(qty) || 1,
      unit: "pcs",
      minThreshold: 1,
      updatedAt: new Date().toISOString(),
    };
    const next = [...items, newItem];
    await saveInventory(next);
    setItems(next);
    setName("");
    setQty("1");
  };

  const adjustQty = async (id: string, delta: number) => {
    const next = items.map((i) =>
      i.id === id
        ? { ...i, quantity: Math.max(0, i.quantity + delta), updatedAt: new Date().toISOString() }
        : i
    );
    await saveInventory(next);
    setItems(next);
  };

  const low = getLowStockItems(items);

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        {(["all", "fridge", "pantry", "freezer"] as const).map((f) => (
          <Pressable
            key={f}
            style={[styles.chip, filter === f && styles.chipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{f}</Text>
          </Pressable>
        ))}
      </View>

      {low.length > 0 && (
        <Text style={styles.lowBanner}>Low: {low.map((i) => i.name).join(", ")}</Text>
      )}

      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="Add item name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[styles.input, styles.qtyInput]}
          placeholder="Qty"
          value={qty}
          onChangeText={setQty}
          keyboardType="decimal-pad"
        />
        <Pressable style={styles.addBtn} onPress={addItem}>
          <Text style={styles.addBtnText}>+</Text>
        </Pressable>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={<Text style={styles.empty}>No items — scan or add manually</Text>}
        renderItem={({ item }) => {
          const isLow = item.quantity <= item.minThreshold;
          return (
            <View style={[styles.row, isLow && styles.rowLow]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowName}>{item.name}</Text>
                <Text style={styles.rowMeta}>
                  {item.location} · min {item.minThreshold} {item.unit}
                </Text>
              </View>
              <View style={styles.qtyRow}>
                <Pressable onPress={() => adjustQty(item.id, -1)}>
                  <Text style={styles.qtyBtn}>−</Text>
                </Pressable>
                <Text style={styles.qtyVal}>
                  {item.quantity} {item.unit}
                </Text>
                <Pressable onPress={() => adjustQty(item.id, 1)}>
                  <Text style={styles.qtyBtn}>+</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF8F0", padding: 12 },
  filters: { flexDirection: "row", gap: 8, marginBottom: 10 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#eee",
  },
  chipActive: { backgroundColor: "#8B0000" },
  chipText: { fontSize: 12, color: "#333", textTransform: "capitalize" },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  lowBanner: { color: "#856404", marginBottom: 8, fontWeight: "600" },
  addRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  qtyInput: { flex: 0.3 },
  addBtn: {
    backgroundColor: "#8B0000",
    width: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: { color: "#fff", fontSize: 24, fontWeight: "700" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  rowLow: { borderColor: "#ffc107", backgroundColor: "#fffdf5" },
  rowName: { fontWeight: "700", fontSize: 16 },
  rowMeta: { fontSize: 12, color: "#888", marginTop: 2 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: { fontSize: 22, color: "#8B0000", fontWeight: "700", paddingHorizontal: 6 },
  qtyVal: { minWidth: 56, textAlign: "center", fontWeight: "600" },
  empty: { textAlign: "center", color: "#888", marginTop: 40 },
});
