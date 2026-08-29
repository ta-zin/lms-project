export default {
  routes: [
    {
      method: "GET",
      path: "/questions",
      handler: "question.find",
      config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/questions/:documentId",
      handler: "question.findOne",
      config: {
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/questions",
      handler: "question.create",
      config: {
        policies: [],
      },
    },
    {
      method: "PUT",
      path: "/questions/:documentId",
      handler: "question.update",
      config: {
        policies: [],
      },
    },
    {
      method: "DELETE",
      path: "/questions/:documentId",
      handler: "question.delete",
      config: {
        policies: [],
      },
    },
  ],
};