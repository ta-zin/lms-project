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
      path: "/lessons/:documentId",
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
        policies: [],
      },
    },
    {
      method: "PUT",
      path: "/lessons/:documentId",
      handler: "lesson.update",
      config: {
        policies: [],
      },
    },
    {
      method: "DELETE",
      path: "/lessons/:documentId",
      handler: "lesson.delete",
      config: {
        policies: [],
      },
    },
  ],
};