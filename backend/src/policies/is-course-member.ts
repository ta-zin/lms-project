export default async (policyContext: any) => {
  const user = policyContext.state.user;

  if (!user) return false;

  if (user.role?.type === "admin") return true;

  if (user.role?.name !== "Student") return false;

  const { courseId } = policyContext.params;

  if (!courseId) return false;

  const enrollment: any = await strapi.db
    .query("api::enrollment.enrollment")
    .findOne({
      where: {
        student: user.id,
        course: courseId,
      },
    });

  return !!enrollment;
};