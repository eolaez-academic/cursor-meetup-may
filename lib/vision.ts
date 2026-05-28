import { DetectedItem, StorageLocation } from "./types";

const DEMO_ITEMS: Record<StorageLocation, DetectedItem[]> = {
  fridge: [
    { name: "eggs", quantity: 12, unit: "pcs", location: "fridge", confidence: 0.85 },
    { name: "chicken thighs", quantity: 1, unit: "kg", location: "fridge", confidence: 0.8 },
    { name: "pork", quantity: 500, unit: "g", location: "fridge", confidence: 0.75 },
    { name: "garlic", quantity: 10, unit: "cloves", location: "fridge", confidence: 0.9 },
    { name: "onion", quantity: 4, unit: "pcs", location: "fridge", confidence: 0.88 },
  ],
  pantry: [
    { name: "soy sauce", quantity: 1, unit: "bottle", location: "pantry", confidence: 0.92 },
    { name: "vinegar", quantity: 1, unit: "bottle", location: "pantry", confidence: 0.9 },
    { name: "mung beans", quantity: 2, unit: "cup", location: "pantry", confidence: 0.7 },
    { name: "tomato sauce", quantity: 2, unit: "can", location: "pantry", confidence: 0.8 },
    { name: "coconut milk", quantity: 2, unit: "can", location: "pantry", confidence: 0.78 },
  ],
  freezer: [
    { name: "fish fillet", quantity: 500, unit: "g", location: "freezer", confidence: 0.7 },
  ],
};

function getApiKey(): string | undefined {
  const key = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!key || key.trim() === "") return undefined;
  return key.trim();
}

export async function analyzeFridgePhoto(
  base64Image: string,
  location: StorageLocation
): Promise<{ items: DetectedItem[]; mode: "ai" | "demo" }> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { items: DEMO_ITEMS[location] ?? DEMO_ITEMS.fridge, mode: "demo" };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Identify food items visible in this ${location} photo for a Filipino household. Return ONLY JSON array: [{\"name\":\"\",\"quantity\":0,\"unit\":\"\",\"confidence\":0.0}]. Use common grocery names.`,
              },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${base64Image}` },
              },
            ],
          },
        ],
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      return { items: DEMO_ITEMS[location] ?? [], mode: "demo" };
    }

    const data = await response.json();
    const text: string = data.choices?.[0]?.message?.content ?? "[]";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : "[]") as Array<{
      name: string;
      quantity: number;
      unit: string;
      confidence?: number;
    }>;

    const items: DetectedItem[] = parsed.map((p) => ({
      name: p.name,
      quantity: p.quantity || 1,
      unit: p.unit || "pcs",
      location,
      confidence: p.confidence ?? 0.7,
    }));

    return { items: items.length ? items : (DEMO_ITEMS[location] ?? []), mode: "ai" };
  } catch {
    return { items: DEMO_ITEMS[location] ?? [], mode: "demo" };
  }
}
