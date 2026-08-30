import StudentQuizClient from "@/components/quizzes/StudentQuizClient";

interface QuizPageProps {
  params: Promise<{
    documentId: string;
  }>;
}

export default async function QuizPage({
  params,
}: QuizPageProps) {
  const { documentId } = await params;

  return (
    <StudentQuizClient
      documentId={documentId}
    />
  );
}