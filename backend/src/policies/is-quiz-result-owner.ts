export default async (policyContext: any) => {
  const user = policyContext.state.user;

  if (!user) return false;

  if (user.role?.type === "admin") return true;

  if (user.role?.name !== "Student") return false;

  const { id } = policyContext.params;

  if (!id) return false;

  const result: any = await strapi.entityService.findOne(
    "api::quiz-result.quiz-result",
    id,
    {
      populate: ["student"],
    }
  );

  return result?.student?.id === user.id;
};