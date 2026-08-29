import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::lesson-progress.lesson-progress",
  ({ strapi }) => ({
    /**
     * CREATE LESSON PROGRESS
     *
     * Student only.
     * Student comes from JWT.
     * Lesson comes from request body.
     * Student must be enrolled in lesson's course.
     */
    async create(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      const currentUser = await strapi
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            id: user.id,
          },
          populate: ["role"],
        });

      const roleName = currentUser?.role?.name;

      if (roleName !== "Student") {
        return ctx.forbidden(
          "Only students can create lesson progress"
        );
      }

      const data = {
        ...(ctx.request.body?.data || {}),
      };

      if (!data.lesson) {
        return ctx.badRequest("Lesson is required");
      }

      /**
       * Strapi 5 Document Service
       * Find lesson by documentId.
       */
      const lesson = await strapi
        .documents("api::lesson.lesson")
        .findOne({
          documentId: data.lesson,
          populate: {
            course: true,
          },
        });

      if (!lesson) {
        return ctx.notFound("Lesson not found");
      }

      if (!lesson.course) {
        return ctx.badRequest(
          "Lesson is not associated with a course"
        );
      }

      /**
       * Check whether the current student
       * is enrolled in this lesson's course.
       */
      const enrollment = await strapi.db
        .query("api::enrollment.enrollment")
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
       * Never trust student from request body.
       * Always use authenticated user.
       */
      const progressData = {
        ...data,
        student: user.id,
        lesson: lesson.documentId,
      };

      try {
        const progress = await strapi
          .documents(
            "api::lesson-progress.lesson-progress"
          )
          .create({
            data: progressData,
            status: "published",
          });

        return {
          data: progress,
        };
      } catch (error) {
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
     * FIND ALL LESSON PROGRESS
     *
     * Student:
     *   Only own progress.
     *
     * Admin / Content Manager:
     *   Full access.
     */
    async find(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      const currentUser = await strapi
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            id: user.id,
          },
          populate: ["role"],
        });

      const roleName = currentUser?.role?.name;

      /**
       * Admin and Content Manager
       * can use the normal core find.
       */
      if (
        roleName === "Admin" ||
        roleName === "Content Manager"
      ) {
        return await super.find(ctx);
      }

      /**
       * Only Student can access
       * their own progress through this endpoint.
       */
      if (roleName !== "Student") {
        return ctx.forbidden();
      }

      /**
       * Use database query internally.
       *
       * This is NOT the public API filters query,
       * so we are not depending on:
       *
       * ?filters[student][id][$eq]=...
       *
       * Student is always taken from JWT.
       */
      const progress = await strapi.db
        .query("api::lesson-progress.lesson-progress")
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
    },

    /**
     * FIND ONE LESSON PROGRESS
     *
     * Student can only see own progress.
     */
    async findOne(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      const currentUser = await strapi
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            id: user.id,
          },
          populate: ["role"],
        });

      const roleName = currentUser?.role?.name;

      /**
       * Admin and Content Manager
       * can access the normal core controller.
       */
      if (
        roleName === "Admin" ||
        roleName === "Content Manager"
      ) {
        return await super.findOne(ctx);
      }

      if (roleName !== "Student") {
        return ctx.forbidden();
      }

      /**
       * Strapi 5 custom route parameter.
       */
      const documentId =
        ctx.params.documentId || ctx.params.id;

      if (!documentId) {
        return ctx.badRequest(
          "Lesson progress documentId is required"
        );
      }

      /**
       * Strapi 5 Document Service.
       */
      const progress = await strapi
        .documents(
          "api::lesson-progress.lesson-progress"
        )
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

      if (!progress.student) {
        return ctx.badRequest(
          "Lesson progress has no student"
        );
      }

      /**
       * Ownership check.
       */
      if (progress.student.id !== user.id) {
        return ctx.forbidden(
          "You can only view your own lesson progress"
        );
      }

      return {
        data: progress,
      };
    },

    /**
     * GET COURSE PROGRESS
     *
     * GET:
     * /api/lesson-progresses/course/:courseDocumentId
     *
     * Student must be enrolled in the course.
     *
     * Returns:
     * - totalLessons
     * - completedLessons
     * - percentage
     * - progress
     */
    async getCourseProgress(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Authentication required");
      }

      const currentUser = await strapi
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            id: user.id,
          },
          populate: ["role"],
        });

      const roleName = currentUser?.role?.name;

      if (roleName !== "Student") {
        return ctx.forbidden(
          "Only students can view course progress"
        );
      }

      /**
       * IMPORTANT:
       * This is Course documentId.
       */
      const courseDocumentId =
        ctx.params.courseDocumentId ||
        ctx.params.courseId;

      if (!courseDocumentId) {
        return ctx.badRequest(
          "Course documentId is required"
        );
      }

      /**
       * Strapi 5 Document Service.
       */
      const course = await strapi
        .documents("api::course.course")
        .findOne({
          documentId: courseDocumentId,
        });

      if (!course) {
        return ctx.notFound("Course not found");
      }

      /**
       * Check enrollment.
       */
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

      /**
       * Get all lessons of this course.
       *
       * Strapi 5 Document Service.
       */
      const lessons = await strapi
        .documents("api::lesson.lesson")
        .findMany({
          filters: {
            course: {
              documentId: courseDocumentId,
            },
          },
        });

      /**
       * Get current student's progress.
       *
       * We populate lesson -> course so that
       * we can safely identify progress belonging
       * to this particular course.
       */
      const allProgress = await strapi.db
        .query("api::lesson-progress.lesson-progress")
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
       * Only progress belonging to
       * the requested course.
       */
      const courseProgress = allProgress.filter(
        (item: any) =>
          item.lesson?.course?.id === course.id
      );

      /**
       * Count completed lessons.
       */
      const completedLessons = courseProgress.filter(
        (item: any) => item.completed === true
      ).length;

      const totalLessons = lessons.length;

      /**
       * Calculate completion percentage.
       */
      const percentage =
        totalLessons > 0
          ? Math.round(
              (completedLessons / totalLessons) * 100
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
    },
  })
);