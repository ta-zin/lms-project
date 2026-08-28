export default {
  routes: [
    {
      method: "GET",
      path: "/enrollments",
      handler: "enrollment.find",
      config: {
        policies: ["global::is-student-record-owner"],
      },
    },
    {
      method: "GET",
      path: "/enrollments/:id",
      handler: "enrollment.findOne",
      config: {
        policies: ["global::is-student-record-owner"],
      },
    },
    {
      method: "POST",
      path: "/enrollments",
      handler: "enrollment.create",
      config: {
        policies: ["global::is-student-enrollment"],
      },
    },
    {
      method: "DELETE",
      path: "/enrollments/:id",
      handler: "enrollment.delete",
      config: {
        policies: ["global::is-student-record-owner"],
      },
    },
  ],
};