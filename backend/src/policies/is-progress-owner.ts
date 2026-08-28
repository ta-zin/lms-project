export default async (policyContext: any) => {
  const user = policyContext.state.user;

  if (!user) return false;

  if (user.role?.type === "admin") return true;

  if (user.role?.name !== "Student") return false;

  const { id } = policyContext.params;

  if (!id) return false;

  const progress: any = await strapi.entityService.findOne(
    "api::lesson-progress.lesson-progress",
    id,
    {
      populate: ["student"],
    }
  );

  return progress?.student?.id === user.id;
};