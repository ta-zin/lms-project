
export default async (policyContext: any) => {
  const user = policyContext.state.user;

  if (!user) return false;

  if (user.role?.type === "admin") return true;

  if (user.role?.name !== "Student") return false;

  const { courseId } = policyContext.params;

  if (!courseId) return false;

  const enrollment = await strapi
    .documents("api::enrollment.enrollment")
    .findFirst({
      filters: {
        student: {
          documentId: user.documentId,
        },
        course: {
          documentId: courseId,
        },
      },
    });

  return !!enrollment;
};