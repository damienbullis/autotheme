import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { log } from "../../src/cli/logger";

describe("logger", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe("log.info", () => {
    it("logs info message with blue prefix", () => {
      log.info("test message");
      expect(consoleSpy).toHaveBeenCalledOnce();
      const call = consoleSpy.mock.calls[0]?.[0];
      expect(call).toContain("test message");
      expect(call).toContain("\x1b[34m"); // blue
    });
  });

  describe("log.success", () => {
    it("logs success message with green prefix", () => {
      log.success("success message");
      expect(consoleSpy).toHaveBeenCalledOnce();
      const call = consoleSpy.mock.calls[0]?.[0];
      expect(call).toContain("success message");
      expect(call).toContain("\x1b[32m"); // green
    });
  });

  describe("log.warn", () => {
    it("logs warning message with yellow prefix", () => {
      log.warn("warning message");
      expect(consoleSpy).toHaveBeenCalledOnce();
      const call = consoleSpy.mock.calls[0]?.[0];
      expect(call).toContain("warning message");
      expect(call).toContain("\x1b[33m"); // yellow
    });
  });

  describe("log.error", () => {
    it("logs error message with red prefix to stderr", () => {
      log.error("error message");
      expect(consoleErrorSpy).toHaveBeenCalledOnce();
      const call = consoleErrorSpy.mock.calls[0]?.[0];
      expect(call).toContain("error message");
      expect(call).toContain("\x1b[31m"); // red
    });
  });

  describe("log.dim", () => {
    it("logs dim message", () => {
      log.dim("dim message");
      expect(consoleSpy).toHaveBeenCalledOnce();
      const call = consoleSpy.mock.calls[0]?.[0];
      expect(call).toContain("dim message");
      expect(call).toContain("\x1b[2m"); // dim
    });
  });
});
