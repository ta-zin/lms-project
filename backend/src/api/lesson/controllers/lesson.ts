import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::lesson.lesson",
  ({ strapi }) => ({
    async find(ctx) {
  const user = ctx.state.user;

  if (!user) {
    return ctx.unauthorized("Authentication required");
  }

  const role = await strapi
    .query("plugin::users-permissions.user")
    .findOne({
      where: { id: user.id },
      populate: ["role"],
    });

  const roleName = role?.role?.name;

  if (
    roleName === "Admin" ||
    roleName === "Content Manager"
  ) {
    return await super.find(ctx);
  }

  if (roleName === "Instructor") {
    ctx.query = {
      ...ctx.query,
      filters: {
        ...(ctx.query.filters || {}),
        course: {
          instructor: {
            id: {
              $eq: user.id,
            },
          },
        },
      },
    };

    return await super.find(ctx);
  }

  if (roleName === "Student") {
    const enrollments = await strapi.db
      .query("api::enrollment.enrollment")
      .findMany({
        where: {
          student: user.id,
        },
      });

    const courseIds = enrollments.map(
      (enrollment: any) => enrollment.course
    );

    ctx.query = {
      ...ctx.query,
      filters: {
        ...(ctx.query.filters || {}),
        course: {
          id: {
            $in: courseIds,
          },
        },
      },
    };

    return await super.find(ctx);
  }

  return ctx.forbidden();
},

async findOne(ctx) {
  const user = ctx.state.user;

  if (!user) {
    return ctx.unauthorized("Authentication required");
  }

  const role = await strapi
    .query("plugin::users-permissions.user")
    .findOne({
      where: { id: user.id },
      populate: ["role"],
    });

  const roleName = role?.role?.name;

  if (
    roleName === "Admin" ||
    roleName === "Content Manager"
  ) {
    return await super.findOne(ctx);
  }

  const lesson = await strapi
    .documents("api::lesson.lesson")
    .findOne({
      documentId: ctx.params.documentId,
      populate: {
        course: {
          populate: {
            instructor: true,
          },
        },
      },
    });

  if (!lesson) {
    return ctx.notFound("Lesson not found");
  }

  if (roleName === "Instructor") {
    if (lesson.course?.instructor?.id !== user.id) {
      return ctx.forbidden(
        "You can only view lessons from your own courses"
      );
    }

    return { data: lesson };
  }

  if (roleName === "Student") {
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

    return { data: lesson };
  }

  return ctx.forbidden();
},
    async create(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      const role = await strapi
        .query("plugin::users-permissions.user")
        .findOne({
          where: { id: user.id },
          populate: ["role"],
        });

      const roleName = role?.role?.name;

      if (
        roleName !== "Admin" &&
        roleName !== "Content Manager" &&
        roleName !== "Instructor"
      ) {
        return ctx.forbidden();
      }

      const data = { ...(ctx.request.body?.data || {}) };

      if (!data.title) {
        return ctx.badRequest("Title is required");
      }

      if (!data.course) {
        return ctx.badRequest("Course is required");
      }

      if (roleName === "Instructor") {
        const course = await strapi
          .documents("api::course.course")
          .findOne({
            documentId: data.course,
            populate: {
              instructor: true,
            },
          });

        if (!course) {
          return ctx.notFound("Course not found");
        }

        if (course.instructor?.id !== user.id) {
          return ctx.forbidden(
            "You can only create lessons for your own courses"
          );
        }
      }

      try {
        const lesson = await strapi
          .documents("api::lesson.lesson")
          .create({
            data,
            status: "published",
          });

        return { data: lesson };
      } catch (error) {
        strapi.log.error("CREATE LESSON ERROR", error);

        return ctx.internalServerError(
          "Failed to create lesson"
        );
      }
    },

    async update(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      const role = await strapi
        .query("plugin::users-permissions.user")
        .findOne({
          where: { id: user.id },
          populate: ["role"],
        });

      const roleName = role?.role?.name;

      if (
        roleName === "Admin" ||
        roleName === "Content Manager"
      ) {
        return await super.update(ctx);
      }

      if (roleName !== "Instructor") {
        return ctx.forbidden();
      }

      const lesson = await strapi
        .documents("api::lesson.lesson")
        .findOne({
          documentId: ctx.params.documentId,
          populate: {
            course: {
              populate: {
                instructor: true,
              },
            },
          },
        });

      if (!lesson) {
        return ctx.notFound("Lesson not found");
      }

      if (lesson.course?.instructor?.id !== user.id) {
        return ctx.forbidden(
          "You can only update lessons from your own courses"
        );
      }

      const data = { ...(ctx.request.body?.data || {}) };

      if (data.course) {
        const course = await strapi
          .documents("api::course.course")
          .findOne({
            documentId: data.course,
            populate: {
              instructor: true,
            },
          });

        if (!course) {
          return ctx.notFound("Course not found");
        }

        if (course.instructor?.id !== user.id) {
          return ctx.forbidden(
            "You can only move lessons to your own courses"
          );
        }
      }

      try {
        const updatedLesson = await strapi
          .documents("api::lesson.lesson")
          .update({
            documentId: lesson.documentId,
            data,
          });

        return { data: updatedLesson };
      } catch (error) {
        strapi.log.error("UPDATE LESSON ERROR", error);

        return ctx.internalServerError(
          "Failed to update lesson"
        );
      }
    },

    async delete(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      const role = await strapi
        .query("plugin::users-permissions.user")
        .findOne({
          where: { id: user.id },
          populate: ["role"],
        });

      const roleName = role?.role?.name;

      if (
        roleName === "Admin" ||
        roleName === "Content Manager"
      ) {
        return await super.delete(ctx);
      }

      if (roleName !== "Instructor") {
        return ctx.forbidden();
      }

      const lesson = await strapi
        .documents("api::lesson.lesson")
        .findOne({
          documentId: ctx.params.documentId,
          populate: {
            course: {
              populate: {
                instructor: true,
              },
            },
          },
        });

      if (!lesson) {
        return ctx.notFound("Lesson not found");
      }

      if (lesson.course?.instructor?.id !== user.id) {
        return ctx.forbidden(
          "You can only delete lessons from your own courses"
        );
      }

      try {
        await strapi
          .documents("api::lesson.lesson")
          .delete({
            documentId: lesson.documentId,
          });

        return { data: null };
      } catch (error) {
        strapi.log.error("DELETE LESSON ERROR", error);

        return ctx.internalServerError(
          "Failed to delete lesson"
        );
      }
    },
  })
);