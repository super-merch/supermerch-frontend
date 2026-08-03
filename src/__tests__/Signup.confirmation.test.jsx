// @vitest-environment jsdom

import { cleanup, render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { BrowserRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import { toast } from "react-toastify";
import Signup from "../pages/Signup";
import { AppContext } from "../context/AppContext";
import { useAuth } from "../hooks/useAuth";

vi.mock("axios");
vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("../hooks/useAuth");

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

const renderSignup = () =>
  render(
    <BrowserRouter>
      <AppContext.Provider value={{ backendUrl: "http://backend.test" }}>
        <Signup />
      </AppContext.Provider>
    </BrowserRouter>,
  );

const fillAndSubmit = async (email = "jamie@example.com") => {
  fireEvent.change(screen.getByPlaceholderText("Enter your first name"), {
    target: { name: "name", value: "Jamie" },
  });
  fireEvent.change(screen.getByPlaceholderText("example@email.com"), {
    target: { name: "email", value: email },
  });
  fireEvent.change(screen.getByPlaceholderText("Create a password"), {
    target: { name: "password", value: "password123" },
  });
  fireEvent.change(screen.getByPlaceholderText("Confirm your password"), {
    target: { name: "confirmPassword", value: "password123" },
  });
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: /create account/i }));
  await waitFor(() => expect(axios.post).toHaveBeenCalled());
};

describe("Signup confirmation screen", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      loading: false,
      error: "",
      googleError: "",
      loadingGoogle: false,
      setLoading: vi.fn(),
      setError: vi.fn(),
      clearError: vi.fn(),
      googleLogin: vi.fn(),
    });
    axios.post.mockResolvedValue({ data: { success: true } });
    delete window.location;
    window.location = { href: "" };
  });

  it("shows the address the customer actually signed up with, not a blank value", async () => {
    renderSignup();

    await fillAndSubmit("jamie@example.com");

    expect(await screen.findByText(/jamie@example\.com/)).toBeInTheDocument();
    expect(toast.success).toHaveBeenCalled();
  });

  it("does not claim the welcome email has already been sent", async () => {
    renderSignup();

    await fillAndSubmit();

    const confirmation = await screen.findByText(/account has been created/i);
    expect(confirmation.textContent).not.toMatch(/we.ve sent/i);
    expect(confirmation.textContent).toMatch(/on its way/i);
  });

  it("redirects to /login after the confirmation delay", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderSignup();

    await fillAndSubmit();
    await screen.findByText(/account has been created/i);

    expect(window.location.href).toBe("");
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    expect(window.location.href).toBe("/login");
  });

  it("clears the redirect timer on unmount instead of leaking it", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { unmount } = renderSignup();

    await fillAndSubmit();
    await screen.findByText(/account has been created/i);

    unmount();
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    // If the timer weren't cleared, this would still fire post-unmount and
    // attempt a navigation against a torn-down component.
    expect(window.location.href).toBe("");
  });
});
