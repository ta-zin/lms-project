export default {
  routes: [
    {
      method: "GET",
      path: "/lessons",
      handler: "lesson.find",
      config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/lessons/:id",
      handler: "lesson.findOne",
      config: {
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/lessons",
      handler: "lesson.create",
      config: {
        policies: ["global::is-instructor-course-owner-from-body"],
      },
    },
    {
      method: "PUT",
      path: "/lessons/:id",
      handler: "lesson.update",
      config: {
        policies: ["global::is-instructor-course-owner"],
      },
    },
    {
      method: "DELETE",
      path: "/lessons/:id",
      handler: "lesson.delete",
      config: {
        policies: ["global::is-instructor-course-owner"],
      },
    },
  ],
};