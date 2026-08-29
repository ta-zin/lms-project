import CourseDetailsClient from "@/components/courses/CourseDetailsClient";

interface CourseDetailsPageProps {
  params: Promise<{
    documentId: string;
  }>;
}

export default async function CourseDetailsPage(
  props: CourseDetailsPageProps
) {
  const params = await props.params;

  return (
    <CourseDetailsClient
      documentId={params.documentId}
    />
  );
}