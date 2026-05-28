import { analyzeFridgePhoto } from "../lib/vision";

describe("analyzeFridgePhoto", () => {
  const originalKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    } else {
      process.env.EXPO_PUBLIC_OPENAI_API_KEY = originalKey;
    }
  });

  it("uses demo mode when API key is missing", async () => {
    delete process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    const { items, mode } = await analyzeFridgePhoto("fakebase64", "fridge");
    expect(mode).toBe("demo");
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((i) => i.location === "fridge")).toBe(true);
  });

  it("returns pantry items for pantry location in demo mode", async () => {
    delete process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    const { items, mode } = await analyzeFridgePhoto("fakebase64", "pantry");
    expect(mode).toBe("demo");
    expect(items[0].location).toBe("pantry");
  });

  it("includes confidence scores on detected items", async () => {
    delete process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    const { items } = await analyzeFridgePhoto("fakebase64", "fridge");
    for (const item of items) {
      expect(item.confidence).toBeGreaterThan(0);
      expect(item.confidence).toBeLessThanOrEqual(1);
    }
  });
});
