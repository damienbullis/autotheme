import { parseArgs } from "./parser";
import { resolveConfig } from "../config/merge";
import { runInit } from "./init";
import { log } from "./logger";

export async function run(args: string[]): Promise<void> {
  const parsed = parseArgs(args);

  // Handle init command
  if (args[0] === "init") {
    const skipPrompts = args.includes("-y") || args.includes("--yes");
    await runInit(skipPrompts);
    return;
  }

  // Handle help/version (handled by cac, will exit before we get here)
  if (parsed.help || parsed.version) {
    return;
  }

  try {
    // Resolve configuration
    const config = await resolveConfig(parsed);

    if (!config.silent) {
      log.info(`Generating theme with ${config.harmony} harmony...`);
      log.info(`Primary color: ${config.color}`);
    }

    // TODO: Phase 5 - Generate theme
    // const theme = generateTheme(config);
    // await writeOutputs(theme, config);

    if (!config.silent) {
      log.success(`Theme will be generated at ${config.output}`);
      log.dim("(Theme generation will be implemented in Phase 5)");
    }
  } catch (error) {
    log.error(error instanceof Error ? error.message : "Unknown error");
    process.exit(1);
  }
}
