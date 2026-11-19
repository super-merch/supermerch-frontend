import { afterEach, describe, expect, it, vi } from "vitest";

// Regression coverage for the chatbot making visitors wait ~11s for an error
// when the OpenAI account was out of credit: a 429 "insufficient_quota" (and
// a missing API key) used to be retried 4 times. They can't succeed on retry,
// so they must now fail on the first attempt.

const createMock = vi.fn();
vi.mock("openai", () => ({
  default: class {
    constructor() {
      this.chat = { completions: { create: (...args) => createMock(...args) } };
    }
  },
}));
vi.mock("../tools.js", () => ({ runTool: vi.fn() }));

const ORIGINAL_KEY = process.env.OPENAI_API_KEY;

afterEach(() => {
  createMock.mockReset();
  if (ORIGINAL_KEY === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = ORIGINAL_KEY;
  vi.resetModules();
});

describe("runAgent fails fast on account problems", () => {
  it("does not retry a 429 insufficient_quota", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    createMock.mockRejectedValue(Object.assign(new Error("429 You exceeded your current quota"), {
      status: 429,
      code: "insufficient_quota",
    }));
    const { runAgent } = await import("../agent.js");
    await expect(runAgent({ userMessage: "hi" })).rejects.toMatchObject({ code: "insufficient_quota" });
    expect(createMock).toHaveBeenCalledTimes(1);
  });

  it("does not retry when OPENAI_API_KEY is missing", async () => {
    delete process.env.OPENAI_API_KEY;
    const { runAgent } = await import("../agent.js");
    await expect(runAgent({ userMessage: "hi" })).rejects.toMatchObject({ code: "missing_api_key" });
    expect(createMock).not.toHaveBeenCalled();
  });
});
