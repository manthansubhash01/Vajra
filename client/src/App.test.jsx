import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("./pages/Home", () => ({
  default: () => <div>Home Page</div>,
}));

import App from "./App";

describe("App", () => {
  it("renders home route content", () => {
    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            status: "ok",
            message: "Test Msg",
            timestamp: "now",
          }),
      }),
    );

    render(<App />);
    const linkElement = screen.getByText(/Home Page/i);
    expect(linkElement).toBeInTheDocument();
  });
});
