import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::question.question",
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
    const questions = await strapi
      .documents("api::question.question")
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
        },
      });

    return {
      data: questions,
    };
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

    if (courseIds.length === 0) {
      return {
        data: [],
      };
    }

    const questions = await strapi
      .documents("api::question.question")
      .findMany({
        filters: {
          quiz: {
            course: {
              id: {
                $in: courseIds,
              },
            },
          },
        },
        populate: {
          quiz: true,
        },
      });

    return {
      data: questions,
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

  const documentId = ctx.params.documentId;

  if (!documentId) {
    return ctx.badRequest(
      "Question documentId is required"
    );
  }

  const question = await strapi
    .documents("api::question.question")
    .findOne({
      documentId,
      populate: {
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

  if (!question) {
    return ctx.notFound("Question not found");
  }

  if (!question.quiz) {
    return ctx.badRequest(
      "Question is not associated with a quiz"
    );
  }

  if (!question.quiz.course) {
    return ctx.badRequest(
      "Question's quiz is not associated with a course"
    );
  }

  if (roleName === "Instructor") {
    if (
      question.quiz.course.instructor?.id !== user.id
    ) {
      return ctx.forbidden(
        "You can only view questions from your own quizzes"
      );
    }

    return {
      data: question,
    };
  }

  if (roleName === "Student") {
    const enrollment = await strapi.db
      .query("api::enrollment.enrollment")
      .findOne({
        where: {
          student: user.id,
          course: question.quiz.course.id,
        },
      });

    if (!enrollment) {
      return ctx.forbidden(
        "You are not enrolled in this course"
      );
    }

    return {
      data: question,
    };
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
        return ctx.forbidden(
          "You are not allowed to create questions"
        );
      }

      const data = {
        ...(ctx.request.body?.data || {}),
      };

      if (!data.question) {
        return ctx.badRequest("Question is required");
      }

      if (!data.quiz) {
        return ctx.badRequest("Quiz is required");
      }

      /*
       * Instructor can create a question only
       * inside their own quiz.
       */
      if (roleName === "Instructor") {
        const quiz = await strapi
          .documents("api::quiz.quiz")
          .findOne({
            documentId: data.quiz,
            populate: {
              course: {
                populate: {
                  instructor: true,
                },
              },
            },
          });

        if (!quiz) {
          return ctx.notFound("Quiz not found");
        }

        if (quiz.course?.instructor?.id !== user.id) {
          return ctx.forbidden(
            "You can only create questions for your own quizzes"
          );
        }
      }

      try {
        const question = await strapi
          .documents("api::question.question")
          .create({
            data,
            status: "published",
          });

        return {
          data: question,
        };
      } catch (error) {
        strapi.log.error("CREATE QUESTION ERROR", error);

        return ctx.internalServerError(
          "Failed to create question"
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

      const question = await strapi
        .documents("api::question.question")
        .findOne({
          documentId: ctx.params.documentId,
          populate: {
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

      if (!question) {
        return ctx.notFound("Question not found");
      }

      if (
        question.quiz?.course?.instructor?.id !== user.id
      ) {
        return ctx.forbidden(
          "You can only update questions from your own quizzes"
        );
      }

      const data = {
        ...(ctx.request.body?.data || {}),
      };

      /*
       * If quiz is changed, verify ownership
       * of the new quiz as well.
       */
      if (data.quiz) {
        const quiz = await strapi
          .documents("api::quiz.quiz")
          .findOne({
            documentId: data.quiz,
            populate: {
              course: {
                populate: {
                  instructor: true,
                },
              },
            },
          });

        if (!quiz) {
          return ctx.notFound("Quiz not found");
        }

        if (quiz.course?.instructor?.id !== user.id) {
          return ctx.forbidden(
            "You can only move questions to your own quizzes"
          );
        }
      }

      try {
        const updatedQuestion = await strapi
          .documents("api::question.question")
          .update({
            documentId: question.documentId,
            data,
          });

        return {
          data: updatedQuestion,
        };
      } catch (error) {
        strapi.log.error("UPDATE QUESTION ERROR", error);

        return ctx.internalServerError(
          "Failed to update question"
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

      const question = await strapi
        .documents("api::question.question")
        .findOne({
          documentId: ctx.params.documentId,
          populate: {
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

      if (!question) {
        return ctx.notFound("Question not found");
      }

      if (
        question.quiz?.course?.instructor?.id !== user.id
      ) {
        return ctx.forbidden(
          "You can only delete questions from your own quizzes"
        );
      }

      try {
        await strapi
          .documents("api::question.question")
          .delete({
            documentId: question.documentId,
          });

        return {
          data: null,
        };
      } catch (error) {
        strapi.log.error("DELETE QUESTION ERROR", error);

        return ctx.internalServerError(
          "Failed to delete question"
        );
      }
    },
  })
);