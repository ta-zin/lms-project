export default {
  routes: [
    {
      method: "GET",
      path: "/lesson-progresses",
      handler: "lesson-progress.find",
      config: {
        policies: ["global::is-student-record-owner"],
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