import { notFound } from "next/navigation";
import { getBoardByShareToken } from "@/lib/boards";
import { SharedWhiteboard } from "@/components/whiteboard/shared-whiteboard";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function SharePage({ params }: PageProps) {
  const { token } = await params;

  let row;
  try {
    row = await getBoardByShareToken(token);
  } catch {
    notFound();
  }
  if (!row || row.deletedAt) notFound();

  return (
    <SharedWhiteboard
      board={{
        id: row.id,
        title: row.title,
        elements: (row.elements ?? []) as unknown[],
        appState: (row.appState ?? {}) as Record<string, unknown>,
        files: (row.files ?? {}) as Record<string, unknown>,
      }}
    />
  );
}