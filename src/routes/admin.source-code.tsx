import { adminHead } from "@/lib/page-head";
import { createFileRoute } from "@tanstack/react-router";
import { CollectionManager } from "@/components/admin/CollectionManager";

export const Route = createFileRoute("/admin/source-code")({
  head: () => adminHead("Source code", "Manage Chozen code repositories and downloads."),
  component: () => (
    <CollectionManager
      table="source_code"
      title="Source code"
      singular="Entry"
      imageField="cover_image"
      subtitleField="category"
      fields={[
        { name: "title", label: "Title", type: "text", required: true, max: 140 },
        { name: "description", label: "Description", type: "textarea", max: 3000 },
        { name: "cover_image", label: "Cover image", type: "image" },
        { name: "category", label: "Category", type: "text", max: 60 },
        {
          name: "repo_url",
          label: "Repository link",
          type: "url",
          placeholder: "https://github.com/…",
        },
        { name: "demo_url", label: "Demo link", type: "url", placeholder: "https://" },
        { name: "download_file", label: "Downloadable code (ZIP)", type: "file" },
        {
          name: "price_label",
          label: "Price label (optional)",
          type: "text",
          max: 40,
          help: "Just a label — no checkout is built.",
        },
      ]}
    />
  ),
});
