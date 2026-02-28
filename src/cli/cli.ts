import { parseArgs } from "./parser";
import { resolveConfig } from "../config/merge";
import { generateSchemaFile } from "../config/schema";
import { generateTheme } from "../core/theme";
import { generateCSS, writeOutputs } from "../generators";
import { runInit } from "./init";
import { log } from "./logger";

export async function run(args: string[]): Promise<void> {
  // Handle init command
  if (args[0] === "init") {
    const skipPrompts = args.includes("-y") || args.includes("--yes");
    await runInit(skipPrompts);
    return;
  }

  // Handle schema command
  if (args[0] === "schema") {
    process.stdout.write(generateSchemaFile() + "\n");
    return;
  }

  const parsed = parseArgs(args);

  // Handle help/version (handled by cac, will exit before we get here)
  if (parsed.help || parsed.version) {
    return;
  }

  try {
    const config = await resolveConfig(parsed);

    if (!config.silent) {
      log.info(`Generating theme with ${config.harmony} harmony...`);
      log.info(`Primary color: ${config.color}`);
    }

    const theme = generateTheme(config);

    // Stdout mode: print CSS and exit
    if (parsed.stdout) {
      const output = generateCSS(theme);
      process.stdout.write(output.content);
      return;
    }

    // File mode: write outputs and print summary
    const outputs = await writeOutputs(theme, config);

    if (!config.silent) {
      log.success(`Generated ${outputs.length} file${outputs.length === 1 ? "" : "s"}:`);
      for (const output of outputs) {
        log.dim(`  ${output.filename}`);
      }
    }
  } catch (error) {
    log.error(error instanceof Error ? error.message : "Unknown error");
    process.exit(1);
  }
}
