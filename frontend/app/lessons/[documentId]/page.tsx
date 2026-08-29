import LessonDetailsClient from "@/components/lessons/LessonDetailsClient";

interface LessonPageProps {
  params: Promise<{
    documentId: string;
  }>;
}

export default async function LessonPage({
  params,
}: LessonPageProps) {
  const { documentId } = await params;

  return (
    <LessonDetailsClient
      documentId={documentId}
    />
  );
}