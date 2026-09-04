import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::quiz.quiz",
  ({ strapi }) => ({
async find(ctx) {
  const user = ctx.state.user;

  if (!user) {
    return ctx.unauthorized(
      "Authentication required"
    );
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
    const quizzes = await strapi
      .documents("api::quiz.quiz")
      .findMany({
        filters: {
          course: {
            instructor: {
              id: {
                $eq: user.id,
              },
            },
          },
        },
        populate: {
          course: {
            populate: {
              instructor: true,
            },
          },
        },
      });

    return {
      data: quizzes,
    };
  }

  if (roleName === "Student") {
    const enrollments =
      await strapi.db
        .query(
          "api::enrollment.enrollment"
        )
        .findMany({
          where: {
            student: user.id,
          },
        });

    const courseIds =
      enrollments
        .map(
          (enrollment: any) =>
            enrollment.course
        )
        .filter(
          (id: any) =>
            id !== null &&
            id !== undefined
        );

    if (courseIds.length === 0) {
      return {
        data: [],
      };
    }

    const allQuizzes =
      await strapi
        .documents("api::quiz.quiz")
        .findMany({
          status: "published",
          populate: {
            course: true,
          },
        });

    const studentQuizzes =
      allQuizzes.filter(
        (quiz: any) =>
          quiz.course &&
          courseIds.includes(
            quiz.course.id
          )
      );

    return {
      data: studentQuizzes,
    };
  }

  return ctx.forbidden();
},

    async findOne(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized(
          "Authentication required"
        );
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
          "Quiz documentId is required"
        );
      }

      const quiz = await strapi
        .documents("api::quiz.quiz")
        .findOne({
          documentId,
          populate: {
            course: {
              populate: {
                instructor: true,
              },
            },
          },
        });

      if (!quiz) {
        return ctx.notFound(
          "Quiz not found"
        );
      }

      const course = quiz.course;

      if (!course) {
        return ctx.badRequest(
          "Quiz is not associated with a course"
        );
      }

      if (roleName === "Instructor") {
        if (
          course.instructor?.id !== user.id
        ) {
          return ctx.forbidden(
            "You can only view quizzes from your own courses"
          );
        }

        return {
          data: quiz,
        };
      }

      if (roleName === "Student") {
        const enrollment =
          await strapi.db
            .query(
              "api::enrollment.enrollment"
            )
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

        return {
          data: quiz,
        };
      }

      return ctx.forbidden();
    },

    async create(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized(
          "Authentication required"
        );
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
          "You are not allowed to create quizzes"
        );
      }

      const data = {
        ...(ctx.request.body?.data || {}),
      };

      if (!data.title) {
        return ctx.badRequest(
          "Quiz title is required"
        );
      }

      if (!data.course) {
        return ctx.badRequest(
          "Course is required"
        );
      }

      /*
       * Instructor can create a quiz only
       * inside their own course.
       */
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
          return ctx.notFound(
            "Course not found"
          );
        }

        if (
          course.instructor?.id !== user.id
        ) {
          return ctx.forbidden(
            "You can only create quizzes for your own courses"
          );
        }
      }

      try {
        const quiz = await strapi
          .documents("api::quiz.quiz")
          .create({
            data,
            status: "published",
          });

        return { data: quiz };
      } catch (error) {
        strapi.log.error(
          "CREATE QUIZ ERROR",
          error
        );

        return ctx.internalServerError(
          "Failed to create quiz"
        );
      }
    },

async update(ctx) {
  const user = ctx.state.user;

  if (!user) {
    return ctx.unauthorized(
      "Authentication required"
    );
  }

  const role = await strapi
    .query("plugin::users-permissions.user")
    .findOne({
      where: {
        id: user.id,
      },
      populate: ["role"],
    });

  const roleName = role?.role?.name;

  if (
    roleName !== "Admin" &&
    roleName !== "Content Manager" &&
    roleName !== "Instructor"
  ) {
    return ctx.forbidden(
      "You are not allowed to update quizzes"
    );
  }

  const documentId =
    ctx.params.documentId;

  if (!documentId) {
    return ctx.badRequest(
      "Quiz documentId is required"
    );
  }

  const data = {
    ...(ctx.request.body?.data || {}),
  };

  if (!data.title) {
    return ctx.badRequest(
      "Quiz title is required"
    );
  }

  if (!data.course) {
    return ctx.badRequest(
      "Course is required"
    );
  }

  try {
    /*
     * Find the existing quiz.
     */
    const quiz = await strapi
      .documents("api::quiz.quiz")
      .findOne({
        documentId,
        populate: {
          course: {
            populate: {
              instructor: true,
            },
          },
        },
      });

    if (!quiz) {
      return ctx.notFound(
        "Quiz not found"
      );
    }

    /*
     * Instructor:
     * only their own course quizzes.
     */
    if (roleName === "Instructor") {
      if (
        quiz.course?.instructor?.id !==
        user.id
      ) {
        return ctx.forbidden(
          "You can only update quizzes from your own courses"
        );
      }

      /*
       * If instructor changes the course,
       * the new course must also belong
       * to that instructor.
       */
      const newCourse = await strapi
        .documents("api::course.course")
        .findOne({
          documentId: data.course,
          populate: {
            instructor: true,
          },
        });

      if (!newCourse) {
        return ctx.notFound(
          "Course not found"
        );
      }

      if (
        newCourse.instructor?.id !==
        user.id
      ) {
        return ctx.forbidden(
          "You can only move quizzes to your own courses"
        );
      }
    }

    /*
     * Admin / Content Manager:
     * can update any quiz and move it
     * to any course.
     */
    if (
      roleName === "Admin" ||
      roleName === "Content Manager"
    ) {
      const newCourse = await strapi
        .documents("api::course.course")
        .findOne({
          documentId: data.course,
        });

      if (!newCourse) {
        return ctx.notFound(
          "Course not found"
        );
      }
    }

    /*
     * Strapi 5 Document Service update.
     */
    const updatedQuiz = await strapi
      .documents("api::quiz.quiz")
      .update({
        documentId,
        data: {
          title: data.title,
          course: data.course,
        },
      });

    /*
     * Publish the updated document because
     * Quiz uses draftAndPublish.
     */
    await strapi
      .documents("api::quiz.quiz")
      .publish({
        documentId,
      });

    const finalQuiz = await strapi
      .documents("api::quiz.quiz")
      .findOne({
        documentId,
        populate: {
          course: true,
        },
      });

    return {
      data: finalQuiz,
    };
  } catch (error) {
    strapi.log.error(
      "UPDATE QUIZ ERROR",
      error
    );

    return ctx.internalServerError(
      "Failed to update quiz"
    );
  }
},

    async delete(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized(
          "Authentication required"
        );
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

      const quiz = await strapi
        .documents("api::quiz.quiz")
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

      if (!quiz) {
        return ctx.notFound(
          "Quiz not found"
        );
      }

      if (
        quiz.course?.instructor?.id !==
        user.id
      ) {
        return ctx.forbidden(
          "You can only delete quizzes from your own courses"
        );
      }

      try {
        await strapi
          .documents("api::quiz.quiz")
          .delete({
            documentId: quiz.documentId,
          });

        return {
          data: null,
        };
      } catch (error) {
        strapi.log.error(
          "DELETE QUIZ ERROR",
          error
        );

        return ctx.internalServerError(
          "Failed to delete quiz"
        );
      }
    },
  })
);