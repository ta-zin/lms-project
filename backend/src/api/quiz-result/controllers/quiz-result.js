"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController("api::quiz-result.quiz-result", function (_a) {
    var strapi = _a.strapi;
    return ({
        submit: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, role, roleName, data, quizDocumentId, answers, quiz, enrollment, questions, submittedAnswers_1, _i, answers_1, answer, score_1, details, totalQuestions, percentage, result, error_1;
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            user = ctx.state.user;
                            if (!user) {
                                return [2 /*return*/, ctx.unauthorized("Authentication required")];
                            }
                            return [4 /*yield*/, strapi
                                    .query("plugin::users-permissions.user")
                                    .findOne({
                                    where: {
                                        id: user.id,
                                    },
                                    populate: ["role"],
                                })];
                        case 1:
                            role = _d.sent();
                            roleName = (_a = role === null || role === void 0 ? void 0 : role.role) === null || _a === void 0 ? void 0 : _a.name;
                            if (roleName !== "Student") {
                                return [2 /*return*/, ctx.forbidden("Only students can submit quizzes")];
                            }
                            data = (_c = (_b = ctx.request.body) === null || _b === void 0 ? void 0 : _b.data) !== null && _c !== void 0 ? _c : {};
                            quizDocumentId = data.quiz;
                            answers = Array.isArray(data.answers)
                                ? data.answers
                                : [];
                            if (!quizDocumentId) {
                                return [2 /*return*/, ctx.badRequest("Quiz is required")];
                            }
                            if (answers.length === 0) {
                                return [2 /*return*/, ctx.badRequest("Answers are required")];
                            }
                            _d.label = 2;
                        case 2:
                            _d.trys.push([2, 7, , 8]);
                            return [4 /*yield*/, strapi
                                    .documents("api::quiz.quiz")
                                    .findOne({
                                    documentId: quizDocumentId,
                                    populate: {
                                        course: true,
                                    },
                                })];
                        case 3:
                            quiz = _d.sent();
                            if (!quiz) {
                                return [2 /*return*/, ctx.notFound("Quiz not found")];
                            }
                            if (!quiz.course) {
                                return [2 /*return*/, ctx.badRequest("Quiz is not associated with a course")];
                            }
                            return [4 /*yield*/, strapi.db
                                    .query("api::enrollment.enrollment")
                                    .findOne({
                                    where: {
                                        student: user.id,
                                        course: quiz.course.id,
                                    },
                                })];
                        case 4:
                            enrollment = _d.sent();
                            if (!enrollment) {
                                return [2 /*return*/, ctx.forbidden("You are not enrolled in this course")];
                            }
                            return [4 /*yield*/, strapi
                                    .documents("api::question.question")
                                    .findMany({
                                    filters: {
                                        quiz: {
                                            documentId: {
                                                $eq: quizDocumentId,
                                            },
                                        },
                                    },
                                })];
                        case 5:
                            questions = _d.sent();
                            if (questions.length === 0) {
                                return [2 /*return*/, ctx.badRequest("This quiz has no questions")];
                            }
                            submittedAnswers_1 = new Map();
                            for (_i = 0, answers_1 = answers; _i < answers_1.length; _i++) {
                                answer = answers_1[_i];
                                if (!answer ||
                                    typeof answer !== "object") {
                                    continue;
                                }
                                if (typeof answer.question !==
                                    "string" ||
                                    typeof answer.answer !==
                                        "string") {
                                    continue;
                                }
                                submittedAnswers_1.set(answer.question, answer.answer
                                    .trim()
                                    .toUpperCase());
                            }
                            /*
                             * Every quiz question must have an answer.
                             */
                            if (submittedAnswers_1.size !==
                                questions.length) {
                                return [2 /*return*/, ctx.badRequest("Please answer every question before submitting")];
                            }
                            score_1 = 0;
                            details = questions.map(function (question) {
                                var selectedAnswer = submittedAnswers_1.get(question.documentId);
                                var correct = selectedAnswer ===
                                    String(question.correctAnswer)
                                        .trim()
                                        .toUpperCase();
                                if (correct) {
                                    score_1 += 1;
                                }
                                return {
                                    questionId: question.documentId,
                                    question: question.question,
                                    selectedAnswer: selectedAnswer,
                                    correctAnswer: question.correctAnswer,
                                    isCorrect: correct,
                                };
                            });
                            totalQuestions = questions.length;
                            percentage = Math.round((score_1 /
                                totalQuestions) *
                                100);
                            return [4 /*yield*/, strapi
                                    .documents("api::quiz-result.quiz-result")
                                    .create({
                                    data: {
                                        quiz: quiz.documentId,
                                        student: user.id,
                                        score: score_1,
                                    },
                                    status: "published",
                                })];
                        case 6:
                            result = _d.sent();
                            return [2 /*return*/, {
                                    data: {
                                        result: result,
                                        score: score_1,
                                        totalQuestions: totalQuestions,
                                        percentage: percentage,
                                        correctAnswers: score_1,
                                        incorrectAnswers: totalQuestions - score_1,
                                        details: details,
                                    },
                                }];
                        case 7:
                            error_1 = _d.sent();
                            strapi.log.error("SUBMIT QUIZ ERROR", error_1);
                            return [2 /*return*/, ctx.internalServerError("Failed to submit quiz")];
                        case 8: return [2 /*return*/];
                    }
                });
            });
        },
        create: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, role, roleName, data, score, quiz, enrollment, result, error_2;
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            user = ctx.state.user;
                            if (!user) {
                                return [2 /*return*/, ctx.unauthorized("Authentication required")];
                            }
                            return [4 /*yield*/, strapi
                                    .query("plugin::users-permissions.user")
                                    .findOne({
                                    where: {
                                        id: user.id,
                                    },
                                    populate: ["role"],
                                })];
                        case 1:
                            role = _d.sent();
                            roleName = (_a = role === null || role === void 0 ? void 0 : role.role) === null || _a === void 0 ? void 0 : _a.name;
                            if (roleName !== "Student") {
                                return [2 /*return*/, ctx.forbidden("Only students can submit quiz results")];
                            }
                            data = (_c = (_b = ctx.request.body) === null || _b === void 0 ? void 0 : _b.data) !== null && _c !== void 0 ? _c : {};
                            if (!data.quiz) {
                                return [2 /*return*/, ctx.badRequest("Quiz is required")];
                            }
                            if (data.score === undefined ||
                                data.score === null) {
                                return [2 /*return*/, ctx.badRequest("Score is required")];
                            }
                            score = Number(data.score);
                            if (!Number.isInteger(score) || score < 0) {
                                return [2 /*return*/, ctx.badRequest("Score must be a valid non-negative integer")];
                            }
                            return [4 /*yield*/, strapi
                                    .documents("api::quiz.quiz")
                                    .findOne({
                                    documentId: data.quiz,
                                    populate: {
                                        course: true,
                                    },
                                })];
                        case 2:
                            quiz = _d.sent();
                            if (!quiz) {
                                return [2 /*return*/, ctx.notFound("Quiz not found")];
                            }
                            if (!quiz.course) {
                                return [2 /*return*/, ctx.badRequest("Quiz is not associated with a course")];
                            }
                            return [4 /*yield*/, strapi.db
                                    .query("api::enrollment.enrollment")
                                    .findOne({
                                    where: {
                                        student: user.id,
                                        course: quiz.course.id,
                                    },
                                })];
                        case 3:
                            enrollment = _d.sent();
                            if (!enrollment) {
                                return [2 /*return*/, ctx.forbidden("You are not enrolled in this course")];
                            }
                            _d.label = 4;
                        case 4:
                            _d.trys.push([4, 6, , 7]);
                            return [4 /*yield*/, strapi.db
                                    .query("api::quiz-result.quiz-result")
                                    .create({
                                    data: {
                                        student: user.id,
                                        quiz: quiz.id,
                                        score: score,
                                    },
                                })];
                        case 5:
                            result = _d.sent();
                            return [2 /*return*/, {
                                    data: result,
                                }];
                        case 6:
                            error_2 = _d.sent();
                            strapi.log.error("CREATE QUIZ RESULT ERROR", error_2);
                            return [2 /*return*/, ctx.internalServerError("Failed to create quiz result")];
                        case 7: return [2 /*return*/];
                    }
                });
            });
        },
        find: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, role, roleName, results, results;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            user = ctx.state.user;
                            if (!user) {
                                return [2 /*return*/, ctx.unauthorized("Authentication required")];
                            }
                            return [4 /*yield*/, strapi
                                    .query("plugin::users-permissions.user")
                                    .findOne({
                                    where: { id: user.id },
                                    populate: ["role"],
                                })];
                        case 1:
                            role = _b.sent();
                            roleName = (_a = role === null || role === void 0 ? void 0 : role.role) === null || _a === void 0 ? void 0 : _a.name;
                            if (!(roleName === "Admin" ||
                                roleName === "Content Manager")) return [3 /*break*/, 3];
                            return [4 /*yield*/, _super.find.call(this, ctx)];
                        case 2: return [2 /*return*/, _b.sent()];
                        case 3:
                            if (!(roleName === "Student")) return [3 /*break*/, 5];
                            return [4 /*yield*/, strapi
                                    .documents("api::quiz-result.quiz-result")
                                    .findMany({
                                    filters: {
                                        student: {
                                            id: {
                                                $eq: user.id,
                                            },
                                        },
                                    },
                                    populate: {
                                        quiz: true,
                                        student: true,
                                    },
                                })];
                        case 4:
                            results = _b.sent();
                            return [2 /*return*/, {
                                    data: results,
                                }];
                        case 5:
                            if (!(roleName === "Instructor")) return [3 /*break*/, 7];
                            return [4 /*yield*/, strapi
                                    .documents("api::quiz-result.quiz-result")
                                    .findMany({
                                    filters: {
                                        quiz: {
                                            course: {
                                                instructor: {
                                                    id: {
                                                        $eq: user.id,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                    populate: {
                                        quiz: {
                                            populate: {
                                                course: true,
                                            },
                                        },
                                        student: true,
                                    },
                                })];
                        case 6:
                            results = _b.sent();
                            return [2 /*return*/, {
                                    data: results,
                                }];
                        case 7: return [2 /*return*/, ctx.forbidden()];
                    }
                });
            });
        },
        findOne: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, role, roleName, documentId, result;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            user = ctx.state.user;
                            if (!user) {
                                return [2 /*return*/, ctx.unauthorized("Authentication required")];
                            }
                            return [4 /*yield*/, strapi
                                    .query("plugin::users-permissions.user")
                                    .findOne({
                                    where: { id: user.id },
                                    populate: ["role"],
                                })];
                        case 1:
                            role = _c.sent();
                            roleName = (_a = role === null || role === void 0 ? void 0 : role.role) === null || _a === void 0 ? void 0 : _a.name;
                            if (!(roleName === "Admin" ||
                                roleName === "Content Manager")) return [3 /*break*/, 3];
                            return [4 /*yield*/, _super.findOne.call(this, ctx)];
                        case 2: return [2 /*return*/, _c.sent()];
                        case 3:
                            documentId = ctx.params.documentId || ctx.params.id;
                            if (!documentId) {
                                return [2 /*return*/, ctx.badRequest("Quiz result documentId is required")];
                            }
                            return [4 /*yield*/, strapi
                                    .documents("api::quiz-result.quiz-result")
                                    .findOne({
                                    documentId: documentId,
                                    populate: {
                                        student: true,
                                        quiz: {
                                            populate: {
                                                course: {
                                                    populate: {
                                                        instructor: true,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                })];
                        case 4:
                            result = _c.sent();
                            if (!result) {
                                return [2 /*return*/, ctx.notFound("Quiz result not found")];
                            }
                            if (!result.student) {
                                return [2 /*return*/, ctx.badRequest("Quiz result has no student")];
                            }
                            if (!result.quiz) {
                                return [2 /*return*/, ctx.badRequest("Quiz result has no quiz")];
                            }
                            if (!result.quiz.course) {
                                return [2 /*return*/, ctx.badRequest("Quiz has no associated course")];
                            }
                            if (roleName === "Student") {
                                if (result.student.id !== user.id) {
                                    return [2 /*return*/, ctx.forbidden("You can only view your own quiz result")];
                                }
                                return [2 /*return*/, {
                                        data: result,
                                    }];
                            }
                            if (roleName === "Instructor") {
                                if (((_b = result.quiz.course.instructor) === null || _b === void 0 ? void 0 : _b.id) !== user.id) {
                                    return [2 /*return*/, ctx.forbidden("You can only view results from your own courses")];
                                }
                                return [2 /*return*/, {
                                        data: result,
                                    }];
                            }
                            return [2 /*return*/, ctx.forbidden()];
                    }
                });
            });
        },
    });
});
