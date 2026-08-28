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
      path: "/courses/:id",
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
      path: "/courses/:id",
      handler: "course.update",
      config: {
        policies: ["global::is-owner"],
      },
    },
    {
      method: "DELETE",
      path: "/courses/:id",
      handler: "course.delete",
      config: {
        policies: ["global::is-owner"],
      },
    },
  ],
};