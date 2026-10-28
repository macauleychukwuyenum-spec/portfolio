import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/chozen")({
  beforeLoad: () => {
    throw redirect({ to: "/admin", replace: true });
  },
  head: () => ({
    meta: [
      { title: "Owner access — Chozen" },
      { name: "description", content: "Owner access for the Chozen portfolio." },
      { property: "og:title", content: "Owner access — Chozen" },
      { property: "og:description", content: "Owner access for the Chozen portfolio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});
