import CourseDetailsClient from "@/components/courses/CourseDetailsClient";

interface CourseDetailsPageProps {
  params: Promise<{
    documentId: string;
  }>;
}

export default async function CourseDetailsPage({
  params,
}: CourseDetailsPageProps) {
  const { documentId } = await params;

  return (
    <CourseDetailsClient
      documentId={documentId}
    />
  );
}