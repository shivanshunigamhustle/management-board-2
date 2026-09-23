import { DocumentLibraryView } from "@/components/document-library-view";

export default async function MemberDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return <DocumentLibraryView role="MEMBER" query={q} />;
}
