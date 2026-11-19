// Tests for src/app/(private)/layout.tsx
//
// PrivateLayout is an async server component, so the tests call it like a
// normal async function, then render what it returns.
// - auth() from @/auth is mocked, so each test picks the session
// - redirect() from next/navigation is mocked to throw, like the real one,
//   so code after redirect() never runs

import { render, screen } from "@testing-library/react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import PrivateLayout from "@/app/(private)/layout";

jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

// the real auth() type has several overloads; the tests only need a mock fn
const mockAuth = auth as unknown as jest.Mock;
const mockRedirect = redirect as unknown as jest.Mock;

// ---------- helpers ----------

/** a logged-in session with the given role */
function session(role = "USER") {
  return {
    user: {
      id: "usr_123",
      email: "jane@example.com",
      first_name: "Jane",
      last_name: "Doe",
      name: "Jane Doe",
      role,
    },
    expires: "2026-12-31T00:00:00.000Z",
  };
}

beforeEach(() => {
  mockAuth.mockReset();
  mockRedirect.mockReset();

  // the real redirect() throws a NEXT_REDIRECT error to stop rendering
  mockRedirect.mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  });
});

// ---------- tests ----------

describe("PrivateLayout", () => {
  describe("logged in", () => {
    it.each(["USER", "DIRECTOR", "ADMIN"])(
      "renders the page for a %s",
      async (role) => {
        mockAuth.mockResolvedValue(session(role));

        render(await PrivateLayout({ children: <p>Private page</p> }));

        expect(screen.getByText("Private page")).toBeInTheDocument();
        expect(mockRedirect).not.toHaveBeenCalled();
      }
    );

    it("checks the session once", async () => {
      mockAuth.mockResolvedValue(session());

      await PrivateLayout({ children: <p>Private page</p> });

      expect(mockAuth).toHaveBeenCalledTimes(1);
    });

    it("adds no extra HTML around the page", async () => {
      mockAuth.mockResolvedValue(session());

      const { container } = render(
        await PrivateLayout({ children: <p>Private page</p> })
      );

      expect(container.innerHTML).toBe("<p>Private page</p>");
    });

    it("renders more than one child", async () => {
      mockAuth.mockResolvedValue(session());

      render(
        await PrivateLayout({
          children: (
            <>
              <h1>Title</h1>
              <p>Body</p>
            </>
          ),
        })
      );

      expect(screen.getByRole("heading", { name: "Title" })).toBeInTheDocument();
      expect(screen.getByText("Body")).toBeInTheDocument();
    });

    it("does not check the role (that is done in middleware and dataEntry)", async () => {
      // a user object with no role still counts as logged in here
      mockAuth.mockResolvedValue({ user: { id: "usr_123" } });

      render(await PrivateLayout({ children: <p>Private page</p> }));

      expect(screen.getByText("Private page")).toBeInTheDocument();
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe("not logged in", () => {
    it("redirects to /login when there is no session", async () => {
      mockAuth.mockResolvedValue(null);

      await expect(
        PrivateLayout({ children: <p>Private page</p> })
      ).rejects.toThrow("NEXT_REDIRECT:/login");

      expect(mockRedirect).toHaveBeenCalledTimes(1);
      expect(mockRedirect).toHaveBeenCalledWith("/login");
    });

    it("redirects to /login when the session has no user", async () => {
      mockAuth.mockResolvedValue({ expires: "2026-12-31T00:00:00.000Z" });

      await expect(
        PrivateLayout({ children: <p>Private page</p> })
      ).rejects.toThrow("NEXT_REDIRECT:/login");

      expect(mockRedirect).toHaveBeenCalledWith("/login");
    });

    it("redirects to /login when the session user is null", async () => {
      mockAuth.mockResolvedValue({ user: null });

      await expect(
        PrivateLayout({ children: <p>Private page</p> })
      ).rejects.toThrow("NEXT_REDIRECT:/login");
    });

    it("never renders the page", async () => {
      mockAuth.mockResolvedValue(null);

      await PrivateLayout({ children: <p>Private page</p> }).catch(() => {
        // the redirect error is expected
      });

      expect(screen.queryByText("Private page")).not.toBeInTheDocument();
    });
  });

  describe("errors", () => {
    it("lets an error from auth() pass through without redirecting", async () => {
      mockAuth.mockRejectedValue(new Error("session error"));

      await expect(
        PrivateLayout({ children: <p>Private page</p> })
      ).rejects.toThrow("session error");

      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });
});