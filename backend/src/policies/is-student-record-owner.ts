
export default async (policyContext: any) => {
  const user = policyContext.state.user;

  if (!user) return false;

  if (user.role?.type === "admin") return true;

  if (user.role?.name !== "Student") return false;

  const { documentId } = policyContext.params;

  if (!documentId) return false;

  const apiName = policyContext.state.route.info.apiName;

  const record: any = await strapi
    .documents(apiName)
    .findOne({
      documentId,
      populate: {
        student: true,
      },
    });

  return (
    record?.student?.documentId === user.documentId
  );
};