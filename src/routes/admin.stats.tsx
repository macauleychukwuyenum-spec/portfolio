import { adminHead } from "@/lib/page-head";
import { createFileRoute } from "@tanstack/react-router";
import { CollectionManager } from "@/components/admin/CollectionManager";
import { ICON_NAMES } from "@/components/site/icons";

export const Route = createFileRoute("/admin/stats")({
  head: () =>
    adminHead("Skills and statistics", "Manage owner-supplied Chozen skills and statistics."),
  component: () => (
    <CollectionManager
      table="stats"
      title="Skills & stats"
      singular="Card"
      subtitleField="kind"
      fields={[
        {
          name: "label",
          label: "Label",
          type: "text",
          required: true,
          max: 80,
          placeholder: "e.g. Python or Projects shipped",
        },
        {
          name: "kind",
          label: "Type",
          type: "select",
          options: ["stat", "skill"],
          help: "Stats show as number cards in About; skills show in the strip under the intro.",
        },
        {
          name: "value",
          label: "Figure (stats only)",
          type: "text",
          max: 20,
          placeholder: "e.g. 12+",
        },
        { name: "description", label: "Short description", type: "text", max: 160 },
        { name: "icon", label: "Icon", type: "select", options: ICON_NAMES },
      ]}
    />
  ),
});
