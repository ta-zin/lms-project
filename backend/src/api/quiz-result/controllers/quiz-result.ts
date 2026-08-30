import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::quiz-result.quiz-result",
  ({ strapi }) => ({
    async submit(ctx) {
  const user = ctx.state.user;

  if (!user) {
    return ctx.unauthorized(
      "Authentication required"
    );
  }

  const role = await strapi
    .query(
      "plugin::users-permissions.user"
    )
    .findOne({
      where: {
        id: user.id,
      },
      populate: ["role"],
    });

  const roleName =
    role?.role?.name;

  if (roleName !== "Student") {
    return ctx.forbidden(
      "Only students can submit quizzes"
    );
  }

  const data =
    ctx.request.body?.data ?? {};

  const quizDocumentId =
    data.quiz;

  const answers =
    Array.isArray(data.answers)
      ? data.answers
      : [];

  if (!quizDocumentId) {
    return ctx.badRequest(
      "Quiz is required"
    );
  }

  if (answers.length === 0) {
    return ctx.badRequest(
      "Answers are required"
    );
  }

  try {
    /*
     * Get the quiz and its course.
     */
    const quiz =
      await strapi
        .documents("api::quiz.quiz")
        .findOne({
          documentId:
            quizDocumentId,
          populate: {
            course: true,
          },
        });

    if (!quiz) {
      return ctx.notFound(
        "Quiz not found"
      );
    }

    if (!quiz.course) {
      return ctx.badRequest(
        "Quiz is not associated with a course"
      );
    }

    /*
     * Verify that this student is enrolled
     * in the quiz's course.
     */
    const enrollment =
      await strapi.db
        .query(
          "api::enrollment.enrollment"
        )
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
     * Get the authoritative questions
     * including correctAnswer.
     *
     * This data NEVER comes from the client.
     */
    const questions =
      await strapi
        .documents("api::question.question")
        .findMany({
          filters: {
            quiz: {
              documentId: {
                $eq: quizDocumentId,
              },
            },
          },
        });

    if (questions.length === 0) {
      return ctx.badRequest(
        "This quiz has no questions"
      );
    }

    /*
     * Normalize submitted answers into a Map.
     */
    const submittedAnswers =
      new Map<string, string>();

    for (const answer of answers) {
      if (
        !answer ||
        typeof answer !== "object"
      ) {
        continue;
      }

      if (
        typeof answer.question !==
          "string" ||
        typeof answer.answer !==
          "string"
      ) {
        continue;
      }

      submittedAnswers.set(
        answer.question,
        answer.answer
          .trim()
          .toUpperCase()
      );
    }

    /*
     * Every quiz question must have an answer.
     */
    if (
      submittedAnswers.size !==
      questions.length
    ) {
      return ctx.badRequest(
        "Please answer every question before submitting"
      );
    }

    let score = 0;

    const details =
      questions.map((question: any) => {
        const selectedAnswer =
          submittedAnswers.get(
            question.documentId
          );

        const correct =
          selectedAnswer ===
          String(
            question.correctAnswer
          )
            .trim()
            .toUpperCase();

        if (correct) {
          score += 1;
        }

        return {
          questionId:
            question.documentId,
          question:
            question.question,
          selectedAnswer,
          correctAnswer:
            question.correctAnswer,
          isCorrect: correct,
        };
      });

    const totalQuestions =
      questions.length;

    const percentage =
      Math.round(
        (score /
          totalQuestions) *
          100
      );

    /*
     * Important:
     *
     * Never accept student or score
     * from the request body.
     *
     * Student comes from JWT.
     * Score comes from the calculation above.
     */
    const result =
      await strapi
        .documents(
          "api::quiz-result.quiz-result"
        )
        .create({
          data: {
            quiz:
              quiz.documentId,
            student: user.id,
            score,
          },
          status: "published",
        });

    return {
      data: {
        result,
        score,
        totalQuestions,
        percentage,
        correctAnswers:
          score,
        incorrectAnswers:
          totalQuestions - score,
        details,
      },
    };
  } catch (error: any) {
    strapi.log.error(
      "SUBMIT QUIZ ERROR",
      error
    );

    return ctx.internalServerError(
      "Failed to submit quiz"
    );
  }
},
async create(ctx) {
  const user = ctx.state.user;

  if (!user) {
    return ctx.unauthorized(
      "Authentication required"
    );
  }

  const role = await strapi
    .query(
      "plugin::users-permissions.user"
    )
    .findOne({
      where: {
        id: user.id,
      },
      populate: ["role"],
    });

  const roleName =
    role?.role?.name;

  if (roleName !== "Student") {
    return ctx.forbidden(
      "Only students can submit quiz results"
    );
  }

  const data =
    ctx.request.body?.data ?? {};

  if (!data.quiz) {
    return ctx.badRequest(
      "Quiz is required"
    );
  }

  if (
    data.score === undefined ||
    data.score === null
  ) {
    return ctx.badRequest(
      "Score is required"
    );
  }

  const score = Number(data.score);

  if (!Number.isInteger(score) || score < 0) {
    return ctx.badRequest(
      "Score must be a valid non-negative integer"
    );
  }

  const quiz =
    await strapi
      .documents("api::quiz.quiz")
      .findOne({
        documentId: data.quiz,
        populate: {
          course: true,
        },
      });

  if (!quiz) {
    return ctx.notFound(
      "Quiz not found"
    );
  }

  if (!quiz.course) {
    return ctx.badRequest(
      "Quiz is not associated with a course"
    );
  }

  const enrollment =
    await strapi.db
      .query(
        "api::enrollment.enrollment"
      )
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

  try {
    const result =
      await strapi.db
        .query(
          "api::quiz-result.quiz-result"
        )
        .create({
          data: {
            student: user.id,
            quiz: quiz.id,
            score,
          },
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