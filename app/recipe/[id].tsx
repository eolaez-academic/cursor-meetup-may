import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { getRecipeById, SERVINGS } from "../../lib/recipes";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = getRecipeById(id ?? "");

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Text>Recipe not found</Text>
      </View>
    );
  }

  const factor = SERVINGS / recipe.baseServings;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{recipe.name}</Text>
      <Text style={styles.sub}>{recipe.nameTl}</Text>
      <Text style={styles.meta}>
        Serves {SERVINGS} · {recipe.prepMinutes + recipe.cookMinutes} min total
      </Text>

      <Text style={styles.section}>Ingredients</Text>
      {recipe.ingredients.map((ing) => (
        <Text key={ing.name} style={styles.ing}>
          · {ing.name} — {Math.round(ing.quantity * factor * 10) / 10} {ing.unit}
        </Text>
      ))}

      <Text style={styles.section}>Steps</Text>
      {recipe.steps.map((step, i) => (
        <Text key={i} style={styles.step}>
          {i + 1}. {step}
        </Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF8F0" },
  content: { padding: 20 },
  title: { fontSize: 26, fontWeight: "800", color: "#8B0000" },
  sub: { fontSize: 16, color: "#666", marginTop: 4 },
  meta: { fontSize: 13, color: "#888", marginTop: 8, marginBottom: 20 },
  section: { fontSize: 18, fontWeight: "700", marginTop: 16, marginBottom: 8 },
  ing: { fontSize: 15, marginBottom: 6, color: "#333" },
  step: { fontSize: 15, marginBottom: 10, lineHeight: 22, color: "#333" },
});
