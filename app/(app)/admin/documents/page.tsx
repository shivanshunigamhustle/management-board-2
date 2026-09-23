import { DocumentLibraryView } from "@/components/document-library-view";

export default async function AdminDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return <DocumentLibraryView role="ADMIN" query={q} />;
}
