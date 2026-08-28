import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::lesson-progress.lesson-progress",
  ({ strapi }) => ({
    async create(ctx) {
      const user = ctx.state.user;

      if (!user) return ctx.unauthorized();

      if (user.role?.name !== "Student") {
        return ctx.forbidden("Only students can track progress");
      }

      const lessonId = ctx.request.body?.data?.lesson;

      if (!lessonId) {
        return ctx.badRequest("Lesson is required");
      }

      const lesson: any = await strapi.entityService.findOne(
        "api::lesson.lesson",
        lessonId,
        {
          populate: ["course"],
        }
      );

      if (!lesson) {
        return ctx.notFound("Lesson not found");
      }

      const enrollment = await strapi.db
        .query("api::enrollment.enrollment")
        .findOne({
          where: {
            student: user.id,
            course: lesson.course?.id,
          },
        });

      if (!enrollment) {
        return ctx.forbidden("You are not enrolled in this course");
      }

      const existing = await strapi.db
        .query("api::lesson-progress.lesson-progress")
        .findOne({
          where: {
            student: user.id,
            lesson: lessonId,
          },
        });

      if (existing) {
        return ctx.badRequest("Progress already exists");
      }

      const progress = await strapi.db
        .query("api::lesson-progress.lesson-progress")
        .create({
          data: {
            student: user.id,
            lesson: lessonId,
            completed: true,
          },
        });

      return ctx.created(progress);
    },

    async update(ctx) {
      const user = ctx.state.user;

      if (!user) return ctx.unauthorized();

      if (user.role?.name !== "Student") {
        return ctx.forbidden();
      }

      const { id } = ctx.params;

      const progress: any = await strapi.db
        .query("api::lesson-progress.lesson-progress")
        .findOne({
          where: { id },
          populate: ["student"],
        });

      if (!progress) return ctx.notFound();

      if (progress.student?.id !== user.id) {
        return ctx.forbidden("You can only update your own progress");
      }

      ctx.request.body.data.student = user.id;

      return await super.update(ctx);
    },
    async getCourseProgress(ctx) {
  const user = ctx.state.user;

  if (!user) return ctx.unauthorized();

  if (user.role?.name !== "Student") {
    return ctx.forbidden();
  }

  const { courseId } = ctx.params;

  if (!courseId) {
    return ctx.badRequest("Course ID is required");
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
    return ctx.forbidden("You are not enrolled in this course");
  }

  const lessons = await strapi.db
    .query("api::lesson.lesson")
    .findMany({
      where: {
        course: courseId,
      },
    });

  const completed = await strapi.db
    .query("api::lesson-progress.lesson-progress")
    .findMany({
      where: {
        student: user.id,
        completed: true,
        lesson: {
          course: courseId,
        },
      },
    });

  const totalLessons = lessons.length;
  const completedLessons = completed.length;

  const percentage =
    totalLessons === 0
      ? 0
      : Math.round((completedLessons / totalLessons) * 100);

  return {
    totalLessons,
    completedLessons,
    percentage,
  };
},
  })
);