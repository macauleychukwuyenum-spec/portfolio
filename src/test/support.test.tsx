import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SupportSection } from "@/components/site/SupportSection";

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));
vi.mock("@tanstack/react-router", () => ({ useNavigate: () => navigate }));
afterEach(() => {
  cleanup();
  navigate.mockClear();
});

describe("Support amount selection", () => {
  it.each([2000, 5000, 10000, 20000])("passes the selected ₦%i to the transfer page", (amount) => {
    render(<SupportSection brand="Chozen" heading="Support" text="" amounts={[]} />);
    const formatted = `₦${amount.toLocaleString("en-NG")}`;
    fireEvent.click(screen.getByRole("button", { name: formatted }));
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "supporter@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: `Support with ${formatted}` }));
    expect(navigate).toHaveBeenCalledWith({
      to: "/support",
      search: { amount, email: "supporter@example.com", name: undefined },
    });
  });
});
