
export default async (policyContext: any) => {
  const user = policyContext.state.user;

  if (!user) return false;

  if (user.role?.type === "admin") return true;

  if (user.role?.name !== "Student") return false;

  const { documentId } = policyContext.params;

  if (!documentId) return false;

  const result: any = await strapi
    .documents("api::quiz-result.quiz-result")
    .findOne({
      documentId,
      populate: {
        student: true,
      },
    });

  return (
    result?.student?.documentId === user.documentId
  );
};