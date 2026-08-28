export default async (policyContext: any) => {
  const user = policyContext.state.user;

  if (!user) {
    return false;
  }

  if (user.role?.type === "admin") {
    return true;
  }

  const { id } = policyContext.params;

  if (!id) {
    return false;
  }

  const course: any = await strapi.entityService.findOne(
    "api::course.course",
    id,
    {
      populate: ["instructor"],
    }
  );

  return course?.instructor?.id === user.id;
};