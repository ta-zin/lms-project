export default {
  routes: [
    {
      method: "GET",
    path: "/lesson-progresses/course/:courseId",
    handler: "lesson-progress.getCourseProgress",
    config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/lesson-progresses/:id",
      handler: "lesson-progress.findOne",
      config: {
        policies: ["global::is-progress-owner"],
      },
    },
    {
      method: "POST",
      path: "/lesson-progresses",
      handler: "lesson-progress.create",
      config: {
        policies: ["global::is-student-enrollment"],
      },
    },
    {
      method: "PUT",
      path: "/lesson-progresses/:id",
      handler: "lesson-progress.update",
      config: {
        policies: ["global::is-progress-owner"],
      },
    },
  ],
};