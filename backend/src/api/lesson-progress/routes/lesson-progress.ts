export default {
  routes: [
    {
      method: "POST",
      path: "/lesson-progresses",
      handler: "lesson-progress.create",
      config: {
        policies: [],
      },
    },

    {
      method: "GET",
      path: "/lesson-progresses/course/:courseDocumentId",
      handler: "lesson-progress.getCourseProgress",
      config: {
        policies: [],
      },
    },
  ],
};