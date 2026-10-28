import { adminHead } from "@/lib/page-head";
import { createFileRoute } from "@tanstack/react-router";
import { CollectionManager } from "@/components/admin/CollectionManager";
import { SOCIAL_PLATFORMS } from "@/components/site/icons";

export const Route = createFileRoute("/admin/socials")({
  head: () => adminHead("Social links", "Manage social and contact links for Chozen."),
  component: () => (
    <CollectionManager
      table="social_links"
      title="Social links"
      singular="Link"
      subtitleField="platform"
      fields={[
        {
          name: "label",
          label: "Label",
          type: "text",
          required: true,
          max: 60,
          placeholder: "e.g. GitHub",
        },
        { name: "platform", label: "Platform", type: "select", options: SOCIAL_PLATFORMS },
        {
          name: "url",
          label: "Link, email or number",
          type: "text",
          required: true,
          max: 500,
          help: "Full link for most platforms; an email address for Email; a phone number with country code for WhatsApp.",
        },
      ]}
    />
  ),
});
