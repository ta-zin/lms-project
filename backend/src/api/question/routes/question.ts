/**
 * question router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::question.question', {
  config: {
    update: {
      policies: ['global::is-question-quiz-owner'],
    },
    delete: {
      policies: ['global::is-question-quiz-owner'],
    },
  },
});