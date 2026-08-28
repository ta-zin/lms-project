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

  const { id } = policyContext.params;
  if (!id) return false;

  const quiz: any = await strapi.entityService.findOne(
    "api::quiz.quiz",
    id,
    {
      populate: {
        course: {
          populate: ["instructor"],
        },
      },
    }
  );

  return quiz?.course?.instructor?.id === user.id;
};