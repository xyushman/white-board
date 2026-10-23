import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { boardToData, getBoard } from "@/lib/boards";
import { WhiteboardWorkspace } from "@/components/whiteboard/workspace";

export default async function BoardPage({
  params,
}: PageProps<"/board/[id]">) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let data;
  try {
    const board = await getBoard(userId, id);
    if (!board || board.deletedAt) notFound();
    data = boardToData(board);
  } catch {
    notFound();
  }

  return <WhiteboardWorkspace board={data} />;
}
