import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sendAlertEmailMock = vi.fn();
vi.mock("../email.js", () => ({
  sendAlertEmail: (...args) => sendAlertEmailMock(...args),
}));

const { notifyChatFailure, buildFailureAlert, resetAlertThrottleForTests, ALERT_COOLDOWN_MS } = await import(
  "../alerts.js"
);

const QUOTA_ERR = Object.assign(new Error("429 You exceeded your current quota"), {
  status: 429,
  code: "insufficient_quota",
});

beforeEach(() => {
  resetAlertThrottleForTests();
  sendAlertEmailMock.mockResolvedValue({ sent: true });
});

afterEach(() => {
  sendAlertEmailMock.mockReset();
  vi.useRealTimers();
});

describe("notifyChatFailure", () => {
  it("emails on the first failure and stays quiet during the cooldown", async () => {
    vi.useFakeTimers();
    expect(await notifyChatFailure(QUOTA_ERR, { query: "hi" })).toEqual({ sent: true });
    expect(await notifyChatFailure(QUOTA_ERR, { query: "hi again" })).toEqual({ sent: false, reason: "throttled" });
    expect(sendAlertEmailMock).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(ALERT_COOLDOWN_MS + 1);
    await notifyChatFailure(QUOTA_ERR);
    expect(sendAlertEmailMock).toHaveBeenCalledTimes(2);
  });

  it("never throws when the email itself fails", async () => {
    sendAlertEmailMock.mockRejectedValue(new Error("Resend rejected the email"));
    await expect(notifyChatFailure(QUOTA_ERR)).resolves.toEqual({ sent: false, reason: "error" });
  });
});

describe("buildFailureAlert", () => {
  it("says plainly when the account needs action", () => {
    const { subject, text } = buildFailureAlert(QUOTA_ERR, { query: "pens under $20", sessionId: "abc" });
    expect(subject).toMatch(/needs action/);
    expect(text).toMatch(/out of credit/);
    expect(text).toMatch(/pens under \$20/);
  });

  it("uses a softer subject for ordinary failures", () => {
    expect(buildFailureAlert(Object.assign(new Error("boom"), { status: 503 })).subject).toMatch(/failed to answer/);
  });
});
