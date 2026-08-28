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

  const courseId = policyContext.request.body?.data?.course;

  if (!courseId) return false;

  const course: any = await strapi.entityService.findOne(
    "api::course.course",
    courseId,
    {
      populate: ["instructor"],
    }
  );

  return course?.instructor?.id === user.id;
};