/**
 * quiz router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::quiz.quiz', {
  config: {
    update: {
      policies: ['global::is-quiz-course-owner'],
    },
    delete: {
      policies: ['global::is-quiz-course-owner'],
    },
  },
});