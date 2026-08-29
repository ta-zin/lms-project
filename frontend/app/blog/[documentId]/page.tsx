import BlogPostClient from "@/components/blog/BlogPostClient";

interface BlogPostPageProps {
  params: Promise<{
    documentId: string;
  }>;
}

export default async function BlogPostPage({
  params,
}: BlogPostPageProps) {
  const { documentId } = await params;

  return (
    <BlogPostClient
      documentId={documentId}
    />
  );
}