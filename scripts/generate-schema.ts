import { generateSchemaFile } from "../src/config/schema";
import { writeFileSync } from "fs";
import { resolve } from "path";

const schema = generateSchemaFile();
const outPath = resolve(import.meta.dirname, "..", "schema.json");
writeFileSync(outPath, schema + "\n");
console.log(`Schema written to ${outPath}`);
