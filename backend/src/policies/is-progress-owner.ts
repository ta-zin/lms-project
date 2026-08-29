export default async (policyContext: any) => {
  const user = policyContext.state.user;

  if (!user) {
    return false;
  }

  const strapi = policyContext.strapi;

  const role = await strapi
    .query("plugin::users-permissions.user")
    .findOne({
      where: { id: user.id },
      populate: ["role"],
    });

  if (!role) {
    return false;
  }

  const roleName = role.role?.name;

  return (
    roleName === "Student" ||
    roleName === "Instructor" ||
    roleName === "Admin" ||
    roleName === "Content Manager"
  );
};