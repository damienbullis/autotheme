import { describe, it, expect } from "vitest";
import { CONFIG_SCHEMA, generateSchemaFile } from "../../src/config/schema";

describe("CONFIG_SCHEMA", () => {
  it("has correct JSON Schema draft version", () => {
    expect(CONFIG_SCHEMA.$schema).toBe("http://json-schema.org/draft-07/schema#");
  });

  it("has correct title and description", () => {
    expect(CONFIG_SCHEMA.title).toBe("AutoTheme Configuration");
    expect(CONFIG_SCHEMA.description).toContain("AutoTheme CSS generator");
  });

  it("defines all harmony types", () => {
    const harmonyProp = CONFIG_SCHEMA.properties.harmony;
    expect(harmonyProp.enum).toContain("complementary");
    expect(harmonyProp.enum).toContain("analogous");
    expect(harmonyProp.enum).toContain("triadic");
    expect(harmonyProp.enum).toContain("split-complementary");
    expect(harmonyProp.enum).toContain("tetradic");
    expect(harmonyProp.enum).toContain("square");
    expect(harmonyProp.enum).toContain("rectangle");
    expect(harmonyProp.enum).toContain("aurelian");
    expect(harmonyProp.enum).toContain("bi-polar");
    expect(harmonyProp.enum).toContain("retrograde");
  });

  it("has correct default values", () => {
    expect(CONFIG_SCHEMA.properties.harmony.default).toBe("analogous");
    expect(CONFIG_SCHEMA.properties.output.default).toBe("./src/autotheme.css");
    expect(CONFIG_SCHEMA.properties.preview.default).toBe(false);
    expect(CONFIG_SCHEMA.properties.tailwind.default).toBe(false);
    expect(CONFIG_SCHEMA.properties.darkModeScript.default).toBe(false);
    expect(CONFIG_SCHEMA.properties.scalar.default).toBe(1.618);
    expect(CONFIG_SCHEMA.properties.contrastTarget.default).toBe(7);
    expect(CONFIG_SCHEMA.properties.radius.default).toBe("0.625rem");
    expect(CONFIG_SCHEMA.properties.prefix.default).toBe("color");
    expect(CONFIG_SCHEMA.properties.fontSize.default).toBe(1);
    expect(CONFIG_SCHEMA.properties.gradients.default).toBe(true);
    expect(CONFIG_SCHEMA.properties.spacing.default).toBe(true);
    expect(CONFIG_SCHEMA.properties.noise.default).toBe(true);
    expect(CONFIG_SCHEMA.properties.shadcn.default).toBe(true);
    expect(CONFIG_SCHEMA.properties.utilities.default).toBe(true);
  });

  it("has correct contrastTarget constraints", () => {
    const contrastProp = CONFIG_SCHEMA.properties.contrastTarget;
    expect(contrastProp.minimum).toBe(3);
    expect(contrastProp.maximum).toBe(21);
  });

  it("disallows additional properties", () => {
    expect(CONFIG_SCHEMA.additionalProperties).toBe(false);
  });
});

describe("generateSchemaFile", () => {
  it("returns valid JSON string", () => {
    const schemaString = generateSchemaFile();
    const parsed = JSON.parse(schemaString);
    expect(parsed.$schema).toBe("http://json-schema.org/draft-07/schema#");
  });

  it("returns formatted JSON with indentation", () => {
    const schemaString = generateSchemaFile();
    expect(schemaString).toContain("\n");
    expect(schemaString).toContain("  ");
  });
});
