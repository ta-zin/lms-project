import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::quiz-result.quiz-result",
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

      if (roleName !== "Student") {
        return ctx.forbidden(
          "Only students can submit quiz results"
        );
      }

      const data = {
        ...(ctx.request.body?.data || {}),
      };

      if (!data.quiz) {
        return ctx.badRequest("Quiz is required");
      }

      const quiz = await strapi
        .documents("api::quiz.quiz")
        .findOne({
          documentId: data.quiz,
          populate: {
            course: true,
          },
        });

      if (!quiz) {
        return ctx.notFound("Quiz not found");
      }

      if (!quiz.course) {
        return ctx.badRequest(
          "Quiz is not associated with a course"
        );
      }

      const enrollment = await strapi.db
        .query("api::enrollment.enrollment")
        .findOne({
          where: {
            student: user.id,
            course: quiz.course.id,
          },
        });

      if (!enrollment) {
        return ctx.forbidden(
          "You are not enrolled in this course"
        );
      }

      /*
       * Student identity comes from JWT.
       * Never trust student from request body.
       */
      const resultData = {
        ...data,
        student: user.id,
        quiz: quiz.documentId,
      };

      try {
        const result = await strapi
          .documents("api::quiz-result.quiz-result")
          .create({
            data: resultData,
            status: "published",
          });

        return {
          data: result,
        };
      } catch (error) {
        strapi.log.error(
          "CREATE QUIZ RESULT ERROR",
          error
        );

        return ctx.internalServerError(
          "Failed to create quiz result"
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

      if (roleName === "Student") {
        const results = await strapi
          .documents("api::quiz-result.quiz-result")
          .findMany({
            filters: {
              student: {
                id: {
                  $eq: user.id,
                },
              },
            },
            populate: {
              quiz: true,
              student: true,
            },
          });

        return {
          data: results,
        };
      }

      if (roleName === "Instructor") {
        const results = await strapi
          .documents("api::quiz-result.quiz-result")
          .findMany({
            filters: {
              quiz: {
                course: {
                  instructor: {
                    id: {
                      $eq: user.id,
                    },
                  },
                },
              },
            },
            populate: {
              quiz: {
                populate: {
                  course: true,
                },
              },
              student: true,
            },
          });

        return {
          data: results,
        };
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

  const documentId =
    ctx.params.documentId || ctx.params.id;

  if (!documentId) {
    return ctx.badRequest(
      "Quiz result documentId is required"
    );
  }

  const result = await strapi
    .documents("api::quiz-result.quiz-result")
    .findOne({
      documentId,
      populate: {
        student: true,
        quiz: {
          populate: {
            course: {
              populate: {
                instructor: true,
              },
            },
          },
        },
      },
    });

  if (!result) {
    return ctx.notFound("Quiz result not found");
  }

  if (!result.student) {
    return ctx.badRequest(
      "Quiz result has no student"
    );
  }

  if (!result.quiz) {
    return ctx.badRequest(
      "Quiz result has no quiz"
    );
  }

  if (!result.quiz.course) {
    return ctx.badRequest(
      "Quiz has no associated course"
    );
  }

  if (roleName === "Student") {
    if (result.student.id !== user.id) {
      return ctx.forbidden(
        "You can only view your own quiz result"
      );
    }

    return {
      data: result,
    };
  }

  if (roleName === "Instructor") {
    if (
      result.quiz.course.instructor?.id !== user.id
    ) {
      return ctx.forbidden(
        "You can only view results from your own courses"
      );
    }

    return {
      data: result,
    };
  }

  return ctx.forbidden();
},
  })
);