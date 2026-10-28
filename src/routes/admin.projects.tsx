import { adminHead } from "@/lib/page-head";
import { createFileRoute } from "@tanstack/react-router";
import { CollectionManager } from "@/components/admin/CollectionManager";

export const Route = createFileRoute("/admin/projects")({
  head: () => adminHead("Projects", "Manage projects in the Chozen portfolio."),
  component: () => (
    <CollectionManager
      table="projects"
      title="Projects"
      singular="Project"
      imageField="cover_image"
      subtitleField="category"
      slugFrom="title"
      featured
      fields={[
        { name: "title", label: "Title", type: "text", required: true, max: 140 },
        {
          name: "short_description",
          label: "Short description",
          type: "textarea",
          max: 300,
          help: "Shown on the project card.",
        },
        { name: "description", label: "Detailed description", type: "textarea", max: 10000 },
        { name: "cover_image", label: "Cover image", type: "image" },
        { name: "gallery", label: "Additional images", type: "gallery" },
        {
          name: "technologies",
          label: "Technologies",
          type: "tags",
          placeholder: "e.g. Python, React",
        },
        { name: "category", label: "Category", type: "text", max: 60 },
        { name: "live_url", label: "Live demo link", type: "url", placeholder: "https://" },
        { name: "source_url", label: "Source code link", type: "url", placeholder: "https://" },
      ]}
    />
  ),
});
