
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

  const { documentId } = policyContext.params;

  if (!documentId) return false;

  const quiz: any = await strapi
    .documents("api::quiz.quiz")
    .findOne({
      documentId,
      populate: {
        course: {
          populate: {
            instructor: true,
          },
        },
      },
    });

  return (
    quiz?.course?.instructor?.documentId ===
    user.documentId
  );
};