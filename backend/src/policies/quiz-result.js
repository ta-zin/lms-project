"use strict";
/**
 * quiz-result router
 */
Object.defineProperty(exports, "__esModule", { value: true });
var strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreRouter("api::quiz-result.quiz-result", {
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
});
