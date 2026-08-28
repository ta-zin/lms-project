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

  const question: any = await strapi.entityService.findOne(
    "api::question.question",
    id,
    {
      populate: {
        quiz: {
          populate: {
            course: {
              populate: ["instructor"],
            },
          },
        },
      },
    }
  );

  return question?.quiz?.course?.instructor?.id === user.id;
};