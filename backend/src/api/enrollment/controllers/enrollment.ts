import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::enrollment.enrollment",
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

      if (role?.role?.name !== "Student") {
        return ctx.forbidden("Only students can enroll");
      }

      const data = {
        ...(ctx.request.body?.data || {}),
      };

      if (!data.course) {
        return ctx.badRequest("Course is required");
      }

      const course = await strapi
        .documents("api::course.course")
        .findOne({
          documentId: data.course,
        });

      if (!course) {
        return ctx.notFound("Course not found");
      }

      const existing = await strapi.db
        .query("api::enrollment.enrollment")
        .findOne({
          where: {
            student: user.id,
            course: course.id,
          },
        });

      if (existing) {
        return ctx.badRequest("Already enrolled");
      }

      try {
        const enrollment = await strapi
          .documents("api::enrollment.enrollment")
          .create({
            data: {
              ...data,
              student: user.id,
              course: course.documentId,
            },
            status: "published",
          });

        return { data: enrollment };
      } catch (error) {
        strapi.log.error("CREATE ENROLLMENT ERROR", error);

        return ctx.internalServerError(
          "Failed to create enrollment"
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

  if (roleName !== "Student") {
    return ctx.forbidden();
  }

  try {
    const enrollments = await strapi
      .documents("api::enrollment.enrollment")
      .findMany({
        filters: {
          student: {
            id: {
              $eq: user.id,
            },
          },
        },
        populate: {
          student: true,
          course: true,
        },
      });

    return {
      data: enrollments,
    };
  } catch (error) {
    strapi.log.error("FIND ENROLLMENTS ERROR", error);

    return ctx.internalServerError(
      "Failed to fetch enrollments"
    );
  }
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

  if (roleName !== "Student") {
    return ctx.forbidden();
  }

  const enrollment = await strapi
    .documents("api::enrollment.enrollment")
    .findOne({
      documentId: ctx.params.documentId,
      populate: {
        student: true,
        course: true,
      },
    });

  if (!enrollment) {
    return ctx.notFound("Enrollment not found");
  }

  if (enrollment.student?.id !== user.id) {
    return ctx.forbidden(
      "You can only view your own enrollment"
    );
  }

  return {
    data: enrollment,
  };
},
  })
);