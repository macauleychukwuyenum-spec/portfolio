import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it, vi } from "vitest";
import { AuthSessionMissingError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Route as AdminRoute } from "@/routes/admin";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  const checkAdminAccess = AdminRoute.options.beforeLoad as unknown as (options: {
    location: { pathname: string };
  }) => Promise<{ user: unknown; isAdmin: boolean }>;

  it("allows signed-out visitors to open the sign-in surface at /admin", async () => {
    const getUser = vi
      .spyOn(supabase.auth, "getUser")
      .mockResolvedValue({ data: { user: null }, error: new AuthSessionMissingError() });
    try {
      await expect(checkAdminAccess({ location: { pathname: "/admin" } })).resolves.toEqual({
        user: null,
        isAdmin: false,
      });
    } finally {
      getUser.mockRestore();
    }
  });

  it("redirects signed-out private page access to /admin", async () => {
    const getUser = vi
      .spyOn(supabase.auth, "getUser")
      .mockResolvedValue({ data: { user: null }, error: new AuthSessionMissingError() });
    try {
      await expect(
        checkAdminAccess({ location: { pathname: "/admin/projects" } }),
      ).rejects.toMatchObject({ options: { to: "/admin", replace: true } });
    } finally {
      getUser.mockRestore();
    }
  });

  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });
});
