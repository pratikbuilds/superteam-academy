import { env } from "./env.js";

export type ExecuteLanguage = "rust" | "typescript";

export type ExecuteResult = {
  output: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
};

type PistonExecution = {
  stdout?: string;
  stderr?: string;
  output?: string;
  code?: number;
  signal?: string;
  message?: string;
};

type PistonExecuteResponse = {
  run?: PistonExecution;
  compile?: PistonExecution;
};

export class CodeExecutionError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, status: number, message?: string) {
    super(message ?? code);
    this.code = code;
    this.status = status;
  }
}

function toPistonLanguage(language: ExecuteLanguage): string {
  return language === "typescript" ? "typescript" : "rust";
}

function toFileName(language: ExecuteLanguage): string {
  return language === "typescript" ? "main.ts" : "main.rs";
}

function normalizeText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value;
}

function mergeOutputs(execution: PistonExecution | undefined): string {
  if (!execution) return "";
  const output = normalizeText(execution.output);
  const stdout = normalizeText(execution.stdout);
  const stderr = normalizeText(execution.stderr);
  return output || [stdout, stderr].filter(Boolean).join("\n");
}

function toExecuteResult(payload: PistonExecuteResponse): ExecuteResult {
  const compile = payload.compile;
  const run = payload.run;
  const compileFailed = typeof compile?.code === "number" && compile.code !== 0;
  if (compileFailed) {
    const output = mergeOutputs(compile);
    return {
      output,
      stderr: normalizeText(compile?.stderr),
      exitCode: compile?.code ?? null,
      timedOut: normalizeText(compile?.signal).toLowerCase() === "sigterm",
    };
  }

  const output = mergeOutputs(run);
  return {
    output,
    stderr: normalizeText(run?.stderr),
    exitCode: typeof run?.code === "number" ? run.code : null,
    timedOut: normalizeText(run?.signal).toLowerCase() === "sigterm",
  };
}

export async function executeCode(params: {
  code: string;
  language: ExecuteLanguage;
  stdin: string;
}): Promise<ExecuteResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9_000);

  try {
    const response = await fetch(env.PISTON_EXECUTE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language: toPistonLanguage(params.language),
        version: "*",
        files: [
          {
            name: toFileName(params.language),
            content: params.code,
          },
        ],
        stdin: params.stdin,
        compile_timeout: 7_000,
        run_timeout: 5_000,
        compile_memory_limit: 512_000,
        run_memory_limit: 512_000,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new CodeExecutionError(
        "CODE_EXECUTION_UPSTREAM_ERROR",
        502,
        `Piston API error (${response.status})`
      );
    }

    const payload = (await response.json()) as PistonExecuteResponse;
    return toExecuteResult(payload);
  } catch (error) {
    if (error instanceof CodeExecutionError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new CodeExecutionError(
        "CODE_EXECUTION_TIMEOUT",
        504,
        "Code execution timed out"
      );
    }
    throw new CodeExecutionError(
      "CODE_EXECUTION_FAILED",
      502,
      error instanceof Error ? error.message : String(error)
    );
  } finally {
    clearTimeout(timeout);
  }
}
