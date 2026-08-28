export default async (policyContext: any) => {
  const user = policyContext.state.user;

  if (!user) return false;

  if (user.role?.type === "admin") return true;

  if (user.role?.name !== "Student") return false;

  const { id } = policyContext.params;
  if (!id) return false;

  const apiName = policyContext.state.route.info.apiName;

  const record: any = await strapi.entityService.findOne(
    apiName,
    id,
    {
      populate: ["student"],
    }
  );

  return record?.student?.id === user.id;
};