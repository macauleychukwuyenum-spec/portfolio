import { adminHead } from "@/lib/page-head";
import { createFileRoute } from "@tanstack/react-router";
import { CollectionManager } from "@/components/admin/CollectionManager";

export const Route = createFileRoute("/admin/classes")({
  head: () => adminHead("Classes", "Manage Chozen classes and learning materials."),
  component: () => (
    <CollectionManager
      table="classes"
      title="Classes"
      singular="Class"
      imageField="thumbnail"
      subtitleField="category"
      fields={[
        { name: "title", label: "Title", type: "text", required: true, max: 140 },
        { name: "description", label: "Description", type: "textarea", max: 3000 },
        { name: "thumbnail", label: "Thumbnail", type: "image" },
        { name: "category", label: "Category", type: "text", max: 60 },
        {
          name: "resource_url",
          label: "Resource link",
          type: "url",
          placeholder: "https://youtube.com/…",
        },
        { name: "download_file", label: "Downloadable material", type: "file" },
      ]}
    />
  ),
});
