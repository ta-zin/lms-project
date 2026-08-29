import { factories } from "@strapi/strapi";

const PROGRESS_UID = "api::lesson-progress.lesson-progress";
const USER_UID = "plugin::users-permissions.user";
const LESSON_UID = "api::lesson.lesson";
const COURSE_UID = "api::course.course";
const ENROLLMENT_UID = "api::enrollment.enrollment";

export default factories.createCoreController(
  PROGRESS_UID,
  ({ strapi }) => ({

    /**
     * Get the current user's role from Users & Permissions.
     */
    async getCurrentUser(ctx: any) {
      const user = ctx.state.user;

      if (!user) {
        return null;
      }

      const currentUser = await strapi.db
        .query(USER_UID)
        .findOne({
          where: {
            id: user.id,
          },
          populate: {
            role: true,
          },
        });

      return currentUser;
    },

    /**
     * POST /api/lesson-progresses
     *
     * Student marks a lesson as completed.
     *
     * Rules:
     * - Must be logged in
     * - Must be Student
     * - Lesson must exist
     * - Lesson must belong to a course
     * - Student must be enrolled in that course
     * - Student is always taken from JWT
     * - Duplicate progress is not created
     */
    async create(ctx) {
      try {
        const user = ctx.state.user;

        if (!user) {
          return ctx.unauthorized(
            "Authentication required"
          );
        }

        const currentUser =
          await this.getCurrentUser(ctx);

        if (!currentUser) {
          return ctx.unauthorized(
            "User not found"
          );
        }

        const roleName =
          currentUser.role?.name;

        if (roleName !== "Student") {
          return ctx.forbidden(
            "Only students can mark lessons as complete"
          );
        }

        const requestData =
          ctx.request.body?.data ?? {};

        /**
         * IMPORTANT:
         * The client sends the lesson documentId.
         */
        const lessonDocumentId =
          requestData.lesson;

        if (!lessonDocumentId) {
          return ctx.badRequest(
            "Lesson documentId is required"
          );
        }

        /**
         * Never trust:
         *
         * requestData.student
         *
         * Student comes from JWT.
         */

        /**
         * Find lesson using Strapi 5 Document Service.
         */
        const lesson = await strapi
          .documents(LESSON_UID)
          .findOne({
            documentId: lessonDocumentId,

            populate: {
              course: true,
            },
          });

        if (!lesson) {
          return ctx.notFound(
            "Lesson not found"
          );
        }

        if (!lesson.course) {
          return ctx.badRequest(
            "Lesson is not associated with a course"
          );
        }

        /**
         * Check enrollment.
         *
         * Here we use the internal database query
         * because Enrollment is a relational DB record.
         */
        const enrollment = await strapi.db
          .query(ENROLLMENT_UID)
          .findOne({
            where: {
              student: user.id,
              course: lesson.course.id,
            },
          });

        if (!enrollment) {
          return ctx.forbidden(
            "You are not enrolled in this course"
          );
        }

        /**
         * Check whether a progress record already exists.
         *
         * We use database IDs here:
         *
         * student -> user.id
         * lesson  -> lesson.id
         */
        const existingProgress =
          await strapi.db
            .query(PROGRESS_UID)
            .findOne({
              where: {
                student: user.id,
                lesson: lesson.id,
              },
            });

        /**
         * If progress already exists,
         * do not create another record.
         */
        if (existingProgress) {
          const updatedProgress =
            await strapi.db
              .query(PROGRESS_UID)
              .update({
                where: {
                  id: existingProgress.id,
                },

                data: {
                  completed: true,
                },

                populate: {
                  student: true,
                  lesson: {
                    populate: {
                      course: true,
                    },
                  },
                },
              });

          return {
            data: updatedProgress,

            meta: {
              message:
                "Lesson progress already existed and was marked complete",
            },
          };
        }

        /**
         * Create new progress.
         *
         * IMPORTANT:
         * Do NOT use:
         *
         * student: { connect: [...] }
         * lesson: { connect: [...] }
         *
         * We are using the internal DB query here.
         */
        const progress =
          await strapi.db
            .query(PROGRESS_UID)
            .create({
              data: {
                student: user.id,
                lesson: lesson.id,
                completed: true,
              },

              populate: {
                student: true,
                lesson: {
                  populate: {
                    course: true,
                  },
                },
              },
            });

        return {
          data: progress,
        };

      } catch (error: any) {
        strapi.log.error(
          "CREATE LESSON PROGRESS ERROR",
          error
        );

        return ctx.internalServerError(
          "Failed to create lesson progress"
        );
      }
    },

    /**
     * GET /api/lesson-progresses
     *
     * Admin:
     *   All progress
     *
     * Content Manager:
     *   All progress
     *
     * Instructor:
     *   Progress of own courses only
     *
     * Student:
     *   Own progress only
     */
    async find(ctx) {
      try {
        const user = ctx.state.user;

        if (!user) {
          return ctx.unauthorized(
            "Authentication required"
          );
        }

        const currentUser =
          await this.getCurrentUser(ctx);

        if (!currentUser) {
          return ctx.unauthorized(
            "User not found"
          );
        }

        const roleName =
          currentUser.role?.name;

        /**
         * --------------------------------------
         * ADMIN / CONTENT MANAGER
         * --------------------------------------
         */
        if (
          roleName === "Admin" ||
          roleName === "Content Manager"
        ) {
          const progress =
            await strapi.db
              .query(PROGRESS_UID)
              .findMany({
                populate: {
                  student: true,
                  lesson: {
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

          return {
            data: progress,
          };
        }

        /**
         * --------------------------------------
         * STUDENT
         * --------------------------------------
         */
        if (roleName === "Student") {
          const progress =
            await strapi.db
              .query(PROGRESS_UID)
              .findMany({
                where: {
                  student: user.id,
                },

                populate: {
                  lesson: {
                    populate: {
                      course: true,
                    },
                  },
                },
              });

          return {
            data: progress,
          };
        }

        /**
         * --------------------------------------
         * INSTRUCTOR
         * --------------------------------------
         */
        if (roleName === "Instructor") {
          const progress =
            await strapi.db
              .query(PROGRESS_UID)
              .findMany({
                populate: {
                  student: true,

                  lesson: {
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

          /**
           * Only keep progress belonging
           * to courses owned by this instructor.
           */
          const ownCourseProgress =
            progress.filter(
              (item: any) =>
                item.lesson?.course?.instructor?.id ===
                user.id
            );

          return {
            data: ownCourseProgress,
          };
        }

        return ctx.forbidden(
          "You are not allowed to view lesson progress"
        );

      } catch (error: any) {
        strapi.log.error(
          "FIND LESSON PROGRESS ERROR",
          error
        );

        return ctx.internalServerError(
          "Failed to fetch lesson progress"
        );
      }
    },

    /**
     * GET /api/lesson-progresses/:documentId
     *
     * Admin:
     *   Any progress
     *
     * Content Manager:
     *   Any progress
     *
     * Instructor:
     *   Only progress from own course
     *
     * Student:
     *   Only own progress
     */
    async findOne(ctx) {
      try {
        const user = ctx.state.user;

        if (!user) {
          return ctx.unauthorized(
            "Authentication required"
          );
        }

        const currentUser =
          await this.getCurrentUser(ctx);

        if (!currentUser) {
          return ctx.unauthorized(
            "User not found"
          );
        }

        const roleName =
          currentUser.role?.name;

        const documentId =
          ctx.params.documentId;

        if (!documentId) {
          return ctx.badRequest(
            "Lesson progress documentId is required"
          );
        }

        /**
         * Strapi 5 Document Service.
         */
        const progress =
          await strapi
            .documents(PROGRESS_UID)
            .findOne({
              documentId,

              populate: {
                student: true,

                lesson: {
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

        if (!progress) {
          return ctx.notFound(
            "Lesson progress not found"
          );
        }

        /**
         * Admin / Content Manager
         */
        if (
          roleName === "Admin" ||
          roleName === "Content Manager"
        ) {
          return {
            data: progress,
          };
        }

        /**
         * Student
         */
        if (roleName === "Student") {
          if (
            progress.student?.id !==
            user.id
          ) {
            return ctx.forbidden(
              "You can only view your own lesson progress"
            );
          }

          return {
            data: progress,
          };
        }

        /**
         * Instructor
         */
        if (roleName === "Instructor") {
          const instructorId =
            progress.lesson
              ?.course
              ?.instructor
              ?.id;

          if (instructorId !== user.id) {
            return ctx.forbidden(
              "You can only view progress from your own courses"
            );
          }

          return {
            data: progress,
          };
        }

        return ctx.forbidden(
          "You are not allowed to view this lesson progress"
        );

      } catch (error: any) {
        strapi.log.error(
          "FIND ONE LESSON PROGRESS ERROR",
          error
        );

        return ctx.internalServerError(
          "Failed to fetch lesson progress"
        );
      }
    },
async delete(ctx) {
  try {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized(
        "Authentication required"
      );
    }

    const currentUser =
      await this.getCurrentUser(ctx);

    if (!currentUser) {
      return ctx.unauthorized(
        "User not found"
      );
    }

    const roleName =
      currentUser.role?.name;

    if (roleName !== "Student") {
      return ctx.forbidden(
        "Only students can remove lesson progress"
      );
    }

    const documentId =
      ctx.params.documentId;

    if (!documentId) {
      return ctx.badRequest(
        "Lesson progress documentId is required"
      );
    }

    const progress =
      await strapi
        .documents(PROGRESS_UID)
        .findOne({
          documentId,
          populate: {
            student: true,
            lesson: {
              populate: {
                course: true,
              },
            },
          },
        });

    if (!progress) {
      return ctx.notFound(
        "Lesson progress not found"
      );
    }

    if (
      progress.student?.id !== user.id
    ) {
      return ctx.forbidden(
        "You can only remove your own lesson progress"
      );
    }

    await strapi
      .documents(PROGRESS_UID)
      .delete({
        documentId,
      });

    return {
      data: null,
    };
  } catch (error: any) {
    strapi.log.error(
      "DELETE LESSON PROGRESS ERROR",
      error
    );

    return ctx.internalServerError(
      "Failed to remove lesson progress"
    );
  }
},
    /**
     * GET
     * /api/lesson-progresses/course/:courseDocumentId
     *
     * Student:
     *   Own progress after enrollment check
     *
     * Instructor:
     *   All students' progress
     *   from own course
     *
     * Admin / Content Manager:
     *   All students' progress
     *   from requested course
     */
    async getCourseProgress(ctx) {
      try {
        const user = ctx.state.user;

        if (!user) {
          return ctx.unauthorized(
            "Authentication required"
          );
        }

        const currentUser =
          await this.getCurrentUser(ctx);

        if (!currentUser) {
          return ctx.unauthorized(
            "User not found"
          );
        }

        const roleName =
          currentUser.role?.name;

        const courseDocumentId =
          ctx.params.courseDocumentId;

        if (!courseDocumentId) {
          return ctx.badRequest(
            "Course documentId is required"
          );
        }

        /**
         * Get course by documentId.
         */
        const course =
          await strapi
            .documents(COURSE_UID)
            .findOne({
              documentId: courseDocumentId,

              populate: {
                instructor: true,
              },
            });

        if (!course) {
          return ctx.notFound(
            "Course not found"
          );
        }

        /**
         * Get all lessons belonging
         * to this course.
         */
        const lessons =
          await strapi
            .documents(LESSON_UID)
            .findMany({
              filters: {
                course: {
                  documentId: {
                    $eq: courseDocumentId,
                  },
                },
              },
            });

        const totalLessons =
          lessons.length;

        /**
         * --------------------------------------
         * STUDENT
         * --------------------------------------
         */
        if (roleName === "Student") {
          /**
           * Verify enrollment.
           */
          const enrollment =
            await strapi.db
              .query(ENROLLMENT_UID)
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

          /**
           * Get only current student's
           * progress.
           */
          const studentProgress =
            await strapi.db
              .query(PROGRESS_UID)
              .findMany({
                where: {
                  student: user.id,
                },

                populate: {
                  lesson: {
                    populate: {
                      course: true,
                    },
                  },
                },
              });

          /**
           * Keep only progress
           * from requested course.
           */
          const courseProgress =
            studentProgress.filter(
              (item: any) =>
                item.lesson?.course?.id ===
                course.id
            );

          const completedLessons =
            courseProgress.filter(
              (item: any) =>
                item.completed === true
            ).length;

          const percentage =
            totalLessons > 0
              ? Math.round(
                  (completedLessons /
                    totalLessons) *
                    100
                )
              : 0;

          return {
            data: {
              course,
              totalLessons,
              completedLessons,
              percentage,
              progress: courseProgress,
            },
          };
        }

        /**
         * --------------------------------------
         * INSTRUCTOR
         * --------------------------------------
         */
        if (roleName === "Instructor") {
          const instructorId =
            course.instructor?.id;

          if (
            instructorId !== user.id
          ) {
            return ctx.forbidden(
              "You can only view progress of your own courses"
            );
          }
        }

        /**
         * --------------------------------------
         * ADMIN / CONTENT MANAGER / INSTRUCTOR
         * --------------------------------------
         */
        if (
          roleName === "Admin" ||
          roleName === "Content Manager" ||
          roleName === "Instructor"
        ) {
          /**
           * Get all progress records.
           */
          const allProgress =
            await strapi.db
              .query(PROGRESS_UID)
              .findMany({
                populate: {
                  student: true,

                  lesson: {
                    populate: {
                      course: true,
                    },
                  },
                },
              });

          /**
           * Keep only progress from
           * requested course.
           */
          const courseProgress =
            allProgress.filter(
              (item: any) =>
                item.lesson?.course?.id ===
                course.id
            );

          /**
           * Group progress by student.
           */
          const studentMap =
            new Map<number, any>();

          for (
            const item of courseProgress
          ) {
            const student =
              item.student;

            if (!student) {
              continue;
            }

            if (
              !studentMap.has(student.id)
            ) {
              studentMap.set(
                student.id,
                {
                  student,
                  completedLessons: 0,
                  progress: [],
                }
              );
            }

            const studentData =
              studentMap.get(student.id);

            studentData.progress.push(item);

            if (
              item.completed === true
            ) {
              studentData.completedLessons += 1;
            }
          }

          /**
           * Build final student statistics.
           */
          const students =
            Array.from(
              studentMap.values()
            ).map(
              (studentData) => ({
                student:
                  studentData.student,

                totalLessons,

                completedLessons:
                  studentData.completedLessons,

                percentage:
                  totalLessons > 0
                    ? Math.round(
                        (studentData.completedLessons /
                          totalLessons) *
                          100
                      )
                    : 0,

                progress:
                  studentData.progress,
              })
            );

          return {
            data: {
              course,
              totalLessons,
              students,
            },
          };
        }

        return ctx.forbidden(
          "You are not allowed to view course progress"
        );

      } catch (error: any) {
        strapi.log.error(
          "GET COURSE PROGRESS ERROR",
          error
        );

        return ctx.internalServerError(
          "Failed to calculate course progress"
        );
      }
    },

  })
);