"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "@phosphor-icons/react";
import { CodeEditor } from "./code-editor";
import type { ChallengeLesson, TestCase } from "@/lib/data/types";

type TestResult = {
  label: string;
  passed: boolean;
  expected?: string;
  actual?: string;
};

type Props = {
  lesson: ChallengeLesson;
  onAllTestsPass: () => void;
};

function runTypeScriptTests(
  code: string,
  testCases: TestCase[]
): { results: TestResult[]; output: string; error: string | null } {
  const results: TestResult[] = [];
  let output = "";
  let error: string | null = null;

  try {
    const fnMatch = code.match(
      /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*(?::\s*[\w<>,\s\[\]]+)?\s*\{/
    );
    const fnName = fnMatch?.[1] ?? "solution";

    const wrappedCode = `
      ${code}
      if (typeof ${fnName} !== 'function') {
        throw new Error('Expected a function named ${fnName}');
      }
      return ${fnName}();
    `;

    const fn = new Function(wrappedCode);
    const actualRaw = String(fn()).trim();
    const actual = actualRaw.toLowerCase();

    for (const tc of testCases) {
      const expected = tc.expectedOutput.trim().toLowerCase();
      const passed = actual.includes(expected) || expected.includes(actual);
      results.push({
        label: tc.label,
        passed,
        expected: tc.expectedOutput,
        actual: actualRaw,
      });
    }
    output = actualRaw;
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
    for (const tc of testCases) {
      results.push({
        label: tc.label,
        passed: false,
        expected: tc.expectedOutput,
        actual: error,
      });
    }
  }

  return { results, output, error };
}

function getFileName(language: "typescript" | "rust"): string {
  return language === "typescript" ? "solution.ts" : "lib.rs";
}

export function ChallengeEditorPanel({ lesson, onAllTestsPass }: Props) {
  const [code, setCode] = useState(lesson.starterCode);
  const [running, setRunning] = useState(false);

  const canRun = lesson.language === "typescript";

  const handleRun = () => {
    if (lesson.language !== "typescript") return;
    setRunning(true);

    setTimeout(() => {
      const { results } = runTypeScriptTests(code, lesson.testCases);
      setRunning(false);
      if (results.every((x) => x.passed)) {
        onAllTestsPass();
      }
    }, 100);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0d0d0d]">
      {/* Top bar: duration, XP, Run Tests */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-border bg-muted/20 px-4">
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-muted-foreground">
            {lesson.duration}m left
          </span>
          <span className="font-mono text-xs font-medium text-amber-500/90">
            {lesson.xp} XP
          </span>
        </div>
        <Button
          onClick={handleRun}
          disabled={!canRun || running}
          size="sm"
          className="bg-emerald-600 font-medium hover:bg-emerald-500 disabled:opacity-70"
        >
          <Play className="mr-1.5 size-4" weight="fill" />
          {!canRun
            ? "Run on server (coming soon)"
            : running
              ? "Running…"
              : "RUN TESTS"}
        </Button>
      </div>

      {/* File tab */}
      <div className="flex shrink-0 border-b border-border bg-muted/10 px-2">
        <div className="flex items-center gap-1 border-b-2 border-primary px-3 py-2 font-mono text-xs">
          {getFileName(lesson.language)}
        </div>
      </div>

      {/* Code editor - scrollable */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <CodeEditor
          value={code}
          onChange={setCode}
          language={lesson.language}
          className="h-full text-sm"
        />
      </div>
    </div>
  );
}
