
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

  const question: any = await strapi
    .documents("api::question.question")
    .findOne({
      documentId,
      populate: {
        quiz: {
          populate: {
            course: {
              populate: {
                instructor: true,
              },
            },
          },
        },
      },
    });

  return (
    question?.quiz?.course?.instructor?.documentId ===
    user.documentId
  );
};