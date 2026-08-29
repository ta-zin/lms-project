
export default async (policyContext: any) => {
  const user = policyContext.state.user;

  if (!user) {
    return false;
  }

  if (user.role?.type === "admin") {
    return true;
  }

  const { documentId } = policyContext.params;

  if (!documentId) {
    return false;
  }

  const course: any = await strapi
    .documents("api::course.course")
    .findOne({
      documentId,
      populate: {
        instructor: true,
      },
    });

  return course?.instructor?.documentId === user.documentId;
};