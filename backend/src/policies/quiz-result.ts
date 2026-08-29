/**
 * quiz-result router
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter(
  "api::quiz-result.quiz-result",
  {
    config: {
      findOne: {
        policies: ["global::is-quiz-result-owner"],
      },
      create: {
        policies: ["global::is-student-enrollment"],
      },
      delete: {
        policies: ["global::is-quiz-result-owner"],
      },
    },
  }
);