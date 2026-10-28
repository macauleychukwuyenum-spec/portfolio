import { adminHead } from "@/lib/page-head";
import { createFileRoute } from "@tanstack/react-router";
import { CollectionManager } from "@/components/admin/CollectionManager";
import { ICON_NAMES } from "@/components/site/icons";

export const Route = createFileRoute("/admin/about")({
  head: () => adminHead("About blocks", "Manage published about content on the Chozen portfolio."),
  component: () => (
    <CollectionManager
      table="about_blocks"
      title="About blocks"
      singular="Block"
      subtitleField="icon"
      fields={[
        {
          name: "title",
          label: "Heading",
          type: "text",
          required: true,
          max: 100,
          placeholder: "e.g. Background, Goals",
        },
        { name: "body", label: "Text", type: "textarea", max: 4000 },
        { name: "icon", label: "Icon", type: "select", options: ICON_NAMES },
      ]}
    />
  ),
});
