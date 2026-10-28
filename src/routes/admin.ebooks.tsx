import { adminHead } from "@/lib/page-head";
import { createFileRoute } from "@tanstack/react-router";
import { CollectionManager } from "@/components/admin/CollectionManager";

export const Route = createFileRoute("/admin/ebooks")({
  head: () => adminHead("E-books", "Manage Chozen e-books and downloadable resources."),
  component: () => (
    <CollectionManager
      table="ebooks"
      title="E-books & resources"
      singular="E-book"
      imageField="cover_image"
      subtitleField="price_label"
      fields={[
        { name: "title", label: "Title", type: "text", required: true, max: 140 },
        { name: "description", label: "Description", type: "textarea", max: 3000 },
        { name: "cover_image", label: "Cover image", type: "image" },
        { name: "category", label: "Category", type: "text", max: 60 },
        { name: "resource_url", label: "External link", type: "url", placeholder: "https://" },
        { name: "download_file", label: "Downloadable file (PDF/EPUB)", type: "file" },
        {
          name: "price_label",
          label: "Price label (optional)",
          type: "text",
          max: 40,
          placeholder: "e.g. ₦5,000 or Free",
        },
      ]}
    />
  ),
});
