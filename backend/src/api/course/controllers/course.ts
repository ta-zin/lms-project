import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::course.course",
  ({ strapi }) => ({
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
        return ctx.forbidden("You are not allowed to create courses");
      }

      const data = { ...(ctx.request.body?.data || {}) };

      if (!data.title) {
        return ctx.badRequest("Title is required");
      }

      if (!data.description) {
        return ctx.badRequest("Description is required");
      }

      if (roleName === "Instructor") {
        data.instructor = user.id;
      }

      if (!data.instructor) {
        return ctx.badRequest("Instructor is required");
      }

      const instructor = await strapi
        .query("plugin::users-permissions.user")
        .findOne({
          where: { id: data.instructor },
        });

      if (!instructor) {
        return ctx.badRequest("Invalid instructor");
      }

      try {
        const course = await strapi
          .documents("api::course.course")
          .create({
            data,
            status: "published",
          });

        return { data: course };
      } catch (error) {
        strapi.log.error("CREATE COURSE ERROR", error);

        return ctx.internalServerError(
          "Failed to create course"
        );
      }
    },
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
        instructor: {
          id: {
            $eq: user.id,
          },
        },
      },
    };

    return await super.find(ctx);
  }

  if (roleName === "Student") {
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

  const course = await strapi
    .documents("api::course.course")
    .findOne({
      documentId: ctx.params.documentId,
      populate: {
        instructor: true,
      },
    });

  if (!course) {
    return ctx.notFound("Course not found");
  }

  if (
    roleName === "Instructor" &&
    course.instructor?.id !== user.id
  ) {
    return ctx.forbidden(
      "You can only view your own courses"
    );
  }

  if (roleName === "Student") {
    const enrollment = await strapi.db
      .query("api::enrollment.enrollment")
      .findOne({
        where: {
          student: user.id,
          course: course.id,
        },
      });

    if (!enrollment) {
      return ctx.forbidden(
        "You are not enrolled in this course"
      );
    }
  }

  return { data: course };
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

      const course = await strapi
        .documents("api::course.course")
        .findOne({
          documentId: ctx.params.documentId || ctx.params.id,
          populate: {
            instructor: true,
          },
        });

      if (!course) {
        return ctx.notFound("Course not found");
      }

      if (course.instructor?.id !== user.id) {
        return ctx.forbidden(
          "You can only update your own course"
        );
      }

      const data = {
        ...(ctx.request.body?.data || {}),
        instructor: user.id,
      };

      try {
        const updatedCourse = await strapi
          .documents("api::course.course")
          .update({
            documentId: course.documentId,
            data,
          });

        return { data: updatedCourse };
      } catch (error) {
        strapi.log.error("UPDATE COURSE ERROR", error);

        return ctx.internalServerError(
          "Failed to update course"
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

      const course = await strapi
        .documents("api::course.course")
        .findOne({
          documentId: ctx.params.documentId || ctx.params.id,
          populate: {
            instructor: true,
          },
        });

      if (!course) {
        return ctx.notFound("Course not found");
      }

      if (course.instructor?.id !== user.id) {
        return ctx.forbidden(
          "You can only delete your own course"
        );
      }

      try {
        await strapi
          .documents("api::course.course")
          .delete({
            documentId: course.documentId,
          });

        return { data: null };
      } catch (error) {
        strapi.log.error("DELETE COURSE ERROR", error);

        return ctx.internalServerError(
          "Failed to delete course"
        );
      }
    },
  })
);