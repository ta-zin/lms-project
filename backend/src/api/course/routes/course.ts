export default {
  routes: [
    {
      method: "GET",
      path: "/courses",
      handler: "course.find",
      config: {
        policies: [],
      },
    },

    {
      method: "GET",
      path: "/courses/:documentId",
      handler: "course.findOne",
      config: {
        policies: [],
      },
    },

    {
      method: "POST",
      path: "/courses",
      handler: "course.create",
      config: {
        policies: [],
      },
    },

    {
      method: "PUT",
      path: "/courses/:documentId",
      handler: "course.update",
      config: {
        policies: [],
      },
    },

    {
      method: "DELETE",
      path: "/courses/:documentId",
      handler: "course.delete",
      config: {
        policies: [],
      },
    },
  ],
};