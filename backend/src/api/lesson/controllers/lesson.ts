import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::lesson.lesson",
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

      const courseId = ctx.request.body?.data?.course;

      if (!courseId) {
        return ctx.badRequest("Course is required");
      }

      if (user.role?.name === "Instructor") {
        const course: any = await strapi.entityService.findOne(
          "api::course.course",
          courseId,
          {
            populate: ["instructor"],
          }
        );

        if (!course) return ctx.notFound("Course not found");

        if (course.instructor?.id !== user.id) {
          return ctx.forbidden(
            "You can only create lessons for your own courses"
          );
        }
      }

      return await super.create(ctx);
    },

    async update(ctx) {
      const user = ctx.state.user;

      if (!user) return ctx.unauthorized();

      if (
        user.role?.type === "admin" ||
        user.role?.name === "Content Manager"
      ) {
        return await super.update(ctx);
      }

      if (user.role?.name !== "Instructor") {
        return ctx.forbidden();
      }

      const { id } = ctx.params;

      const lesson: any = await strapi.entityService.findOne(
        "api::lesson.lesson",
        id,
        {
          populate: {
            course: {
              populate: ["instructor"],
            },
          },
        }
      );

      if (!lesson) return ctx.notFound("Lesson not found");

      if (lesson.course?.instructor?.id !== user.id) {
        return ctx.forbidden(
          "You can only update your own course lessons"
        );
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

      const lesson: any = await strapi.entityService.findOne(
        "api::lesson.lesson",
        id,
        {
          populate: {
            course: {
              populate: ["instructor"],
            },
          },
        }
      );

      if (!lesson) return ctx.notFound("Lesson not found");

      if (lesson.course?.instructor?.id !== user.id) {
        return ctx.forbidden(
          "You can only delete your own course lessons"
        );
      }

      return await super.delete(ctx);
    },

    async find(ctx) {
      const user = ctx.state.user;

      if (!user) return ctx.unauthorized();

      if (
        user.role?.type === "admin" ||
        user.role?.name === "Content Manager" ||
        user.role?.name === "Instructor"
      ) {
        return await super.find(ctx);
      }

      if (user.role?.name !== "Student") {
        return ctx.forbidden();
      }

      const courseId = (ctx.query as any)?.filters?.course?.id;
      if (!courseId) {
        return ctx.badRequest("Course filter is required");
      }

      const enrollment = await strapi.db
        .query("api::enrollment.enrollment")
        .findOne({
          where: {
            student: user.id,
            course: courseId,
          },
        });

      if (!enrollment) {
        return ctx.forbidden(
          "You are not enrolled in this course"
        );
      }

      return await super.find(ctx);
    },

    async findOne(ctx) {
      const user = ctx.state.user;

      if (!user) return ctx.unauthorized();

      if (
        user.role?.type === "admin" ||
        user.role?.name === "Content Manager" ||
        user.role?.name === "Instructor"
      ) {
        return await super.findOne(ctx);
      }

      if (user.role?.name !== "Student") {
        return ctx.forbidden();
      }

      const { id } = ctx.params;

      const lesson: any = await strapi.db
        .query("api::lesson.lesson")
        .findOne({
          where: { id },
          populate: ["course"],
        });

      if (!lesson) return ctx.notFound("Lesson not found");

      const enrollment = await strapi.db
        .query("api::enrollment.enrollment")
        .findOne({
          where: {
            student: user.id,
            course: lesson.course?.id,
          },
        });

      if (!enrollment) {
        return ctx.forbidden(
          "You are not enrolled in this course"
        );
      }

      return await super.findOne(ctx);
    },
  })
);