
export default async (policyContext: any) => {
  const user = policyContext.state.user;

  if (!user) return false;

  if (
    user.role?.type === "admin" ||
    user.role?.name === "Content Manager"
  ) {
    return true;
  }

  if (user.role?.name !== "Instructor") return false;

  const courseDocumentId =
    policyContext.request.body?.data?.course;

  if (!courseDocumentId) return false;

  const course: any = await strapi
    .documents("api::course.course")
    .findOne({
      documentId: courseDocumentId,
      populate: {
        instructor: true,
      },
    });

  return (
    course?.instructor?.documentId === user.documentId
  );
};