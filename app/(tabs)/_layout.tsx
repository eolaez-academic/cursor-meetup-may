import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#8B0000",
        headerStyle: { backgroundColor: "#8B0000" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarLabel: "Home" }} />
      <Tabs.Screen name="inventory" options={{ title: "Stock", tabBarLabel: "Stock" }} />
      <Tabs.Screen name="plan" options={{ title: "Week Plan", tabBarLabel: "Plan" }} />
    </Tabs>
  );
}
