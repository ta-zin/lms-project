import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::enrollment.enrollment",
  ({ strapi }) => ({
    async create(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized();
      }

      const userWithRole = await strapi
        .query("plugin::users-permissions.user")
        .findOne({
          where: { id: user.id },
          populate: ["role"],
        });

      if (userWithRole?.role?.name !== "Student") {
        return ctx.forbidden("Only students can enroll");
      }

      const courseId = ctx.request.body?.data?.course;

      if (!courseId) {
        return ctx.badRequest("Course is required");
      }

      const course = await strapi.db
        .query("api::course.course")
        .findOne({
          where: { id: courseId },
        });

      if (!course) {
        return ctx.notFound("Course not found");
      }

      const existing = await strapi.db
        .query("api::enrollment.enrollment")
        .findOne({
          where: {
            student: user.id,
            course: courseId,
          },
        });

      if (existing) {
        return ctx.badRequest("Already enrolled");
      }

      const enrollment = await strapi.db
        .query("api::enrollment.enrollment")
        .create({
          data: {
            student: user.id,
            course: courseId,
          },
        });

      return ctx.created(enrollment);
    },

    async find(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized();
      }

      const userWithRole = await strapi
        .query("plugin::users-permissions.user")
        .findOne({
          where: { id: user.id },
          populate: ["role"],
        });

      if (userWithRole?.role?.type === "admin") {
        return await super.find(ctx);
      }

      if (userWithRole?.role?.name !== "Student") {
        return ctx.forbidden();
      }

      ctx.query = {
        ...ctx.query,
        filters: {
          ...(ctx.query.filters || {}),
          student: {
            id: {
              $eq: user.id,
            },
          },
        },
      };

      return await super.find(ctx);
    },

    async findOne(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized();
      }

      const userWithRole = await strapi
        .query("plugin::users-permissions.user")
        .findOne({
          where: { id: user.id },
          populate: ["role"],
        });

      if (userWithRole?.role?.type === "admin") {
        return await super.findOne(ctx);
      }

      if (userWithRole?.role?.name !== "Student") {
        return ctx.forbidden();
      }

      const { id } = ctx.params;

      const enrollment = await strapi.db
        .query("api::enrollment.enrollment")
        .findOne({
          where: { id },
          populate: {
            student: true,
          },
        });

      if (!enrollment) {
        return ctx.notFound();
      }

      if (enrollment.student?.id !== user.id) {
        return ctx.forbidden(
          "You can only view your own enrollment"
        );
      }

      return await super.findOne(ctx);
    },
  })
);