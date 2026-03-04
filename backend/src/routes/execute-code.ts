import { Hono } from "hono";
import { executeCode } from "../execute-code.js";
import { handleRouteError } from "../lib/errors.js";
import { parseJsonBody } from "../lib/parse.js";
import { executeCodeRequestSchema } from "../schemas/requests.js";

export const executeCodeRoutes = new Hono();

executeCodeRoutes.post("/execute-code", async (c) => {
  const body = await parseJsonBody(c);
  const parsed = executeCodeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ ok: false, error: "MALFORMED_REQUEST" }, 400);
  }
  try {
    const { code, language, testCases } = parsed.data;
    const results: Array<{
      input: string;
      expected: string;
      actual: string;
      label: string;
      passed: boolean;
      timedOut: boolean;
      exitCode: number | null;
    }> = [];

    for (const testCase of testCases) {
      const run = await executeCode({
        code,
        language,
        stdin: testCase.input,
      });
      const expected = testCase.expectedOutput.trim();
      const actual = run.output.trim();
      const passed = actual === expected;
      results.push({
        input: testCase.input,
        expected,
        actual,
        label: testCase.label,
        passed,
        timedOut: run.timedOut,
        exitCode: run.exitCode,
      });
    }

    return c.json({
      ok: true,
      passed: results.every((r) => r.passed),
      results,
    });
  } catch (error) {
    return handleRouteError(c, error, "UNEXPECTED_EXECUTE_CODE_ERROR", 500);
  }
});
