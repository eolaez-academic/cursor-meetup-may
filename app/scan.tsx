import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { loadInventory, loadScanHistory, saveInventory, saveScanHistory } from "../lib/storage";
import { analyzeFridgePhoto } from "../lib/vision";
import { DetectedItem, InventoryItem, StorageLocation } from "../lib/types";

export default function ScanScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<StorageLocation>("fridge");
  const [detected, setDetected] = useState<DetectedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"ai" | "demo" | null>(null);

  const pickAndAnalyze = async (useCamera: boolean) => {
    const perm = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Camera or photo access is required.");
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.5 })
      : await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.5 });

    if (result.canceled || !result.assets[0]?.base64) return;

    setLoading(true);
    const { items, mode: analysisMode } = await analyzeFridgePhoto(
      result.assets[0].base64,
      location
    );
    setDetected(items);
    setMode(analysisMode);
    setLoading(false);
  };

  const mergeIntoInventory = async () => {
    const existing = await loadInventory();
    const merged = [...existing];

    for (const d of detected) {
      const key = d.name.toLowerCase();
      const idx = merged.findIndex((i) => i.name.toLowerCase() === key);
      if (idx >= 0) {
        merged[idx] = {
          ...merged[idx],
          quantity: merged[idx].quantity + d.quantity,
          location: d.location,
          updatedAt: new Date().toISOString(),
        };
      } else {
        const item: InventoryItem = {
          id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: d.name,
          location: d.location,
          quantity: d.quantity,
          unit: d.unit,
          minThreshold: Math.max(1, Math.floor(d.quantity * 0.2)),
          updatedAt: new Date().toISOString(),
        };
        merged.push(item);
      }
    }

    await saveInventory(merged);
    const history = await loadScanHistory();
    await saveScanHistory([
      {
        id: `scan-${Date.now()}`,
        location,
        detected,
        createdAt: new Date().toISOString(),
      },
      ...history,
    ]);

    Alert.alert("Stock updated", `${detected.length} items saved to memory.`, [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.locRow}>
        {(["fridge", "pantry", "freezer"] as StorageLocation[]).map((loc) => (
          <Pressable
            key={loc}
            style={[styles.chip, location === loc && styles.chipOn]}
            onPress={() => setLocation(loc)}
          >
            <Text style={[styles.chipText, location === loc && styles.chipTextOn]}>{loc}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.btn} onPress={() => pickAndAnalyze(true)}>
        <Text style={styles.btnText}>Take photo</Text>
      </Pressable>
      <Pressable style={styles.btnOutline} onPress={() => pickAndAnalyze(false)}>
        <Text style={styles.btnOutlineText}>Choose from gallery</Text>
      </Pressable>

      {loading && <ActivityIndicator size="large" color="#8B0000" style={{ marginTop: 20 }} />}

      {mode && (
        <Text style={styles.mode}>
          {mode === "ai" ? "AI vision" : "Demo mode (add EXPO_PUBLIC_OPENAI_API_KEY in .env for AI)"}
        </Text>
      )}

      <FlatList
        data={detected}
        keyExtractor={(_, i) => String(i)}
        style={{ marginTop: 12 }}
        ListEmptyComponent={
          <Text style={styles.empty}>Take a photo to detect items — confirm before saving</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemQty}>
              {item.quantity} {item.unit} · {(item.confidence * 100).toFixed(0)}%
            </Text>
          </View>
        )}
      />

      {detected.length > 0 && (
        <Pressable style={styles.saveBtn} onPress={mergeIntoInventory}>
          <Text style={styles.saveBtnText}>Confirm & save to stock memory</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF8F0", padding: 16 },
  locRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "#eee" },
  chipOn: { backgroundColor: "#8B0000" },
  chipText: { textTransform: "capitalize", color: "#333" },
  chipTextOn: { color: "#fff", fontWeight: "600" },
  btn: {
    backgroundColor: "#8B0000",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 8,
  },
  btnText: { color: "#fff", fontWeight: "700" },
  btnOutline: {
    borderWidth: 1,
    borderColor: "#8B0000",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  btnOutlineText: { color: "#8B0000", fontWeight: "600" },
  mode: { marginTop: 12, fontSize: 12, color: "#666", fontStyle: "italic" },
  empty: { textAlign: "center", color: "#888", marginTop: 24 },
  item: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  itemName: { fontWeight: "700", fontSize: 16 },
  itemQty: { color: "#666", marginTop: 4 },
  saveBtn: {
    backgroundColor: "#2e7d32",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnText: { color: "#fff", fontWeight: "700" },
});
