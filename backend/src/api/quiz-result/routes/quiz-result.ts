export default {
  routes: [
    {
      method: "GET",
      path: "/quiz-results",
      handler: "quiz-result.find",
      config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/quiz-results/:documentId",
      handler: "quiz-result.findOne",
      config: {
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/quiz-results",
      handler: "quiz-result.create",
      config: {
        policies: [],
      },
    },
  ],
};