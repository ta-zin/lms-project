import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::course.course",
  ({ strapi }) => ({
    async create(ctx) {
      const user = ctx.state.user;

      if (!user) return ctx.unauthorized();

      if (
        user.role?.type !== "admin" &&
        user.role?.name !== "Content Manager" &&
        user.role?.name !== "Instructor"
      ) {
        return ctx.forbidden();
      }

      const data = ctx.request.body?.data;

      if (!data?.instructor) {
        return ctx.badRequest("Instructor is required");
      }

      if (
        user.role?.name === "Instructor" &&
        Number(data.instructor) !== Number(user.id)
      ) {
        return ctx.forbidden("You can only create courses for yourself");
      }

      return await super.create(ctx);
    },
    async update(ctx) {
  const user = ctx.state.user;

  if (!user) return ctx.unauthorized();

  const data = ctx.request.body?.data;

  if (
    user.role?.name === "Instructor" &&
    data?.instructor &&
    Number(data.instructor) !== Number(user.id)
  ) {
    return ctx.forbidden("You cannot change the course instructor");
  }

  return await super.update(ctx);
},
    async delete(ctx) {
  const user = ctx.state.user;

  if (!user) return ctx.unauthorized();

  if (
    user.role?.type === "admin" ||
    user.role?.name === "Content Manager"
  ) {
    return await super.delete(ctx);
  }

  if (user.role?.name !== "Instructor") {
    return ctx.forbidden();
  }

  const { id } = ctx.params;

  const course: any = await strapi.entityService.findOne(
    "api::course.course",
    id,
    {
      populate: ["instructor"],
    }
  );

  if (!course) return ctx.notFound();

  if (course.instructor?.id !== user.id) {
    return ctx.forbidden("You can only delete your own course");
  }

  return await super.delete(ctx);
},
  })
);