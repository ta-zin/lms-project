export default {
  routes: [
    {
      method: "GET",
      path: "/quizzes",
      handler: "quiz.find",
      config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/quizzes/:documentId",
      handler: "quiz.findOne",
      config: {
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/quizzes",
      handler: "quiz.create",
      config: {
        policies: [],
      },
    },
    {
      method: "PUT",
      path: "/quizzes/:documentId",
      handler: "quiz.update",
      config: {
        policies: [],
      },
    },
    {
      method: "DELETE",
      path: "/quizzes/:documentId",
      handler: "quiz.delete",
      config: {
        policies: [],
      },
    },
  ],
};