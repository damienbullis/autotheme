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

  it("harmony property accepts any string (built-in or custom)", () => {
    const harmonyProp = CONFIG_SCHEMA.properties.harmony;
    expect(harmonyProp.type).toBe("string");
    expect(harmonyProp.default).toBe("analogous");
    expect(harmonyProp.description).toContain("complementary");
    expect(harmonyProp.description).toContain("custom");
  });

  it("has harmonies property for custom harmony definitions", () => {
    const harmoniesProp = CONFIG_SCHEMA.properties.harmonies;
    expect(harmoniesProp).toBeDefined();
    expect(harmoniesProp.type).toBe("object");
    expect(harmoniesProp.additionalProperties).toBeDefined();
    expect(harmoniesProp.additionalProperties.properties.offsets).toBeDefined();
  });

  it("has preset property with enum of preset names", () => {
    const presetProp = CONFIG_SCHEMA.properties.preset;
    expect(presetProp).toBeDefined();
    expect(presetProp.type).toBe("string");
    expect(presetProp.enum).toContain("ocean");
    expect(presetProp.enum).toContain("sunset");
    expect(presetProp.enum).toContain("forest");
  });

  it("has correct nested default values", () => {
    expect(CONFIG_SCHEMA.properties.harmony.default).toBe("analogous");
    expect(CONFIG_SCHEMA.properties.palette.properties.prefix.default).toBe("color");
    expect(CONFIG_SCHEMA.properties.palette.properties.contrastTarget.default).toBe(7);
    expect(CONFIG_SCHEMA.properties.typography.properties.base.default).toBe(1);
    expect(CONFIG_SCHEMA.properties.typography.properties.ratio.default).toBe(1.618);
    expect(CONFIG_SCHEMA.properties.spacing.properties.enabled.default).toBe(false);
    expect(CONFIG_SCHEMA.properties.gradients.default).toBe(false);
    expect(CONFIG_SCHEMA.properties.noise.default).toBe(false);
    expect(CONFIG_SCHEMA.properties.utilities.default).toBe(false);
    expect(CONFIG_SCHEMA.properties.shadcn.properties.enabled.default).toBe(false);
    expect(CONFIG_SCHEMA.properties.shadcn.properties.radius.default).toBe("0.625rem");
    expect(CONFIG_SCHEMA.properties.output.properties.path.default).toBe("./src/autotheme.css");
    expect(CONFIG_SCHEMA.properties.output.properties.preview.default).toBe(false);
    expect(CONFIG_SCHEMA.properties.output.properties.tailwind.default).toBe(false);
    expect(CONFIG_SCHEMA.properties.output.properties.darkModeScript.default).toBe(false);
  });

  it("has swing property with correct defaults", () => {
    const swingProp = CONFIG_SCHEMA.properties.swing;
    expect(swingProp).toBeDefined();
    expect(swingProp.type).toBe("number");
    expect(swingProp.default).toBe(1);
    expect(swingProp.exclusiveMinimum).toBe(0);
  });

  it("has swingStrategy property with correct defaults", () => {
    const strategyProp = CONFIG_SCHEMA.properties.swingStrategy;
    expect(strategyProp).toBeDefined();
    expect(strategyProp.type).toBe("string");
    expect(strategyProp.default).toBe("linear");
    expect(strategyProp.enum).toContain("linear");
    expect(strategyProp.enum).toContain("exponential");
    expect(strategyProp.enum).toContain("alternating");
  });

  it("has correct contrastTarget constraints", () => {
    const contrastProp = CONFIG_SCHEMA.properties.palette.properties.contrastTarget;
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
