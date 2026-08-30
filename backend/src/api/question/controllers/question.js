"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController("api::question.question", function (_a) {
    var strapi = _a.strapi;
    return ({
        find: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, role, roleName, questions, enrollments, courseIds, questions, studentQuestions;
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
                            if (!(roleName === "Instructor")) return [3 /*break*/, 5];
                            return [4 /*yield*/, strapi
                                    .documents("api::question.question")
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
                                    },
                                })];
                        case 4:
                            questions = _b.sent();
                            return [2 /*return*/, {
                                    data: questions,
                                }];
                        case 5:
                            if (!(roleName === "Student")) return [3 /*break*/, 8];
                            return [4 /*yield*/, strapi.db
                                    .query("api::enrollment.enrollment")
                                    .findMany({
                                    where: {
                                        student: user.id,
                                    },
                                })];
                        case 6:
                            enrollments = _b.sent();
                            courseIds = enrollments.map(function (enrollment) { return enrollment.course; });
                            if (courseIds.length === 0) {
                                return [2 /*return*/, {
                                        data: [],
                                    }];
                            }
                            return [4 /*yield*/, strapi
                                    .documents("api::question.question")
                                    .findMany({
                                    filters: {
                                        quiz: {
                                            course: {
                                                id: {
                                                    $in: courseIds,
                                                },
                                            },
                                        },
                                    },
                                    populate: {
                                        quiz: true,
                                    },
                                })];
                        case 7:
                            questions = _b.sent();
                            studentQuestions = questions.map(function (question) {
                                var correctAnswer = question.correctAnswer, safeQuestion = __rest(question, ["correctAnswer"]);
                                return safeQuestion;
                            });
                            return [2 /*return*/, {
                                    data: studentQuestions,
                                }];
                        case 8: return [2 /*return*/, ctx.forbidden()];
                    }
                });
            });
        },
        findOne: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, role, roleName, documentId, question, enrollment, correctAnswer, safeQuestion;
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
                            documentId = ctx.params.documentId;
                            if (!documentId) {
                                return [2 /*return*/, ctx.badRequest("Question documentId is required")];
                            }
                            return [4 /*yield*/, strapi
                                    .documents("api::question.question")
                                    .findOne({
                                    documentId: documentId,
                                    populate: {
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
                            question = _c.sent();
                            if (!question) {
                                return [2 /*return*/, ctx.notFound("Question not found")];
                            }
                            if (!question.quiz) {
                                return [2 /*return*/, ctx.badRequest("Question is not associated with a quiz")];
                            }
                            if (!question.quiz.course) {
                                return [2 /*return*/, ctx.badRequest("Question's quiz is not associated with a course")];
                            }
                            if (roleName === "Instructor") {
                                if (((_b = question.quiz.course.instructor) === null || _b === void 0 ? void 0 : _b.id) !== user.id) {
                                    return [2 /*return*/, ctx.forbidden("You can only view questions from your own quizzes")];
                                }
                                return [2 /*return*/, {
                                        data: question,
                                    }];
                            }
                            if (!(roleName === "Student")) return [3 /*break*/, 6];
                            return [4 /*yield*/, strapi.db
                                    .query("api::enrollment.enrollment")
                                    .findOne({
                                    where: {
                                        student: user.id,
                                        course: question.quiz.course.id,
                                    },
                                })];
                        case 5:
                            enrollment = _c.sent();
                            if (!enrollment) {
                                return [2 /*return*/, ctx.forbidden("You are not enrolled in this course")];
                            }
                            correctAnswer = question.correctAnswer, safeQuestion = __rest(question, ["correctAnswer"]);
                            return [2 /*return*/, {
                                    data: safeQuestion,
                                }];
                        case 6: return [2 /*return*/, ctx.forbidden()];
                    }
                });
            });
        },
        create: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, role, roleName, data, quiz, question, error_1;
                var _a, _b, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
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
                            role = _e.sent();
                            roleName = (_a = role === null || role === void 0 ? void 0 : role.role) === null || _a === void 0 ? void 0 : _a.name;
                            if (roleName !== "Admin" &&
                                roleName !== "Content Manager" &&
                                roleName !== "Instructor") {
                                return [2 /*return*/, ctx.forbidden("You are not allowed to create questions")];
                            }
                            data = __assign({}, (((_b = ctx.request.body) === null || _b === void 0 ? void 0 : _b.data) || {}));
                            if (!data.question) {
                                return [2 /*return*/, ctx.badRequest("Question is required")];
                            }
                            if (!data.quiz) {
                                return [2 /*return*/, ctx.badRequest("Quiz is required")];
                            }
                            if (!(roleName === "Instructor")) return [3 /*break*/, 3];
                            return [4 /*yield*/, strapi
                                    .documents("api::quiz.quiz")
                                    .findOne({
                                    documentId: data.quiz,
                                    populate: {
                                        course: {
                                            populate: {
                                                instructor: true,
                                            },
                                        },
                                    },
                                })];
                        case 2:
                            quiz = _e.sent();
                            if (!quiz) {
                                return [2 /*return*/, ctx.notFound("Quiz not found")];
                            }
                            if (((_d = (_c = quiz.course) === null || _c === void 0 ? void 0 : _c.instructor) === null || _d === void 0 ? void 0 : _d.id) !== user.id) {
                                return [2 /*return*/, ctx.forbidden("You can only create questions for your own quizzes")];
                            }
                            _e.label = 3;
                        case 3:
                            _e.trys.push([3, 5, , 6]);
                            return [4 /*yield*/, strapi
                                    .documents("api::question.question")
                                    .create({
                                    data: data,
                                    status: "published",
                                })];
                        case 4:
                            question = _e.sent();
                            return [2 /*return*/, {
                                    data: question,
                                }];
                        case 5:
                            error_1 = _e.sent();
                            strapi.log.error("CREATE QUESTION ERROR", error_1);
                            return [2 /*return*/, ctx.internalServerError("Failed to create question")];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        },
        update: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, role, roleName, question, data, quiz, updatedQuestion, error_2;
                var _a, _b, _c, _d, _e, _f, _g;
                return __generator(this, function (_h) {
                    switch (_h.label) {
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
                            role = _h.sent();
                            roleName = (_a = role === null || role === void 0 ? void 0 : role.role) === null || _a === void 0 ? void 0 : _a.name;
                            if (!(roleName === "Admin" ||
                                roleName === "Content Manager")) return [3 /*break*/, 3];
                            return [4 /*yield*/, _super.update.call(this, ctx)];
                        case 2: return [2 /*return*/, _h.sent()];
                        case 3:
                            if (roleName !== "Instructor") {
                                return [2 /*return*/, ctx.forbidden()];
                            }
                            return [4 /*yield*/, strapi
                                    .documents("api::question.question")
                                    .findOne({
                                    documentId: ctx.params.documentId,
                                    populate: {
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
                            question = _h.sent();
                            if (!question) {
                                return [2 /*return*/, ctx.notFound("Question not found")];
                            }
                            if (((_d = (_c = (_b = question.quiz) === null || _b === void 0 ? void 0 : _b.course) === null || _c === void 0 ? void 0 : _c.instructor) === null || _d === void 0 ? void 0 : _d.id) !== user.id) {
                                return [2 /*return*/, ctx.forbidden("You can only update questions from your own quizzes")];
                            }
                            data = __assign({}, (((_e = ctx.request.body) === null || _e === void 0 ? void 0 : _e.data) || {}));
                            if (!data.quiz) return [3 /*break*/, 6];
                            return [4 /*yield*/, strapi
                                    .documents("api::quiz.quiz")
                                    .findOne({
                                    documentId: data.quiz,
                                    populate: {
                                        course: {
                                            populate: {
                                                instructor: true,
                                            },
                                        },
                                    },
                                })];
                        case 5:
                            quiz = _h.sent();
                            if (!quiz) {
                                return [2 /*return*/, ctx.notFound("Quiz not found")];
                            }
                            if (((_g = (_f = quiz.course) === null || _f === void 0 ? void 0 : _f.instructor) === null || _g === void 0 ? void 0 : _g.id) !== user.id) {
                                return [2 /*return*/, ctx.forbidden("You can only move questions to your own quizzes")];
                            }
                            _h.label = 6;
                        case 6:
                            _h.trys.push([6, 8, , 9]);
                            return [4 /*yield*/, strapi
                                    .documents("api::question.question")
                                    .update({
                                    documentId: question.documentId,
                                    data: data,
                                })];
                        case 7:
                            updatedQuestion = _h.sent();
                            return [2 /*return*/, {
                                    data: updatedQuestion,
                                }];
                        case 8:
                            error_2 = _h.sent();
                            strapi.log.error("UPDATE QUESTION ERROR", error_2);
                            return [2 /*return*/, ctx.internalServerError("Failed to update question")];
                        case 9: return [2 /*return*/];
                    }
                });
            });
        },
        delete: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, role, roleName, question, error_3;
                var _a, _b, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
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
                            role = _e.sent();
                            roleName = (_a = role === null || role === void 0 ? void 0 : role.role) === null || _a === void 0 ? void 0 : _a.name;
                            if (!(roleName === "Admin" ||
                                roleName === "Content Manager")) return [3 /*break*/, 3];
                            return [4 /*yield*/, _super.delete.call(this, ctx)];
                        case 2: return [2 /*return*/, _e.sent()];
                        case 3:
                            if (roleName !== "Instructor") {
                                return [2 /*return*/, ctx.forbidden()];
                            }
                            return [4 /*yield*/, strapi
                                    .documents("api::question.question")
                                    .findOne({
                                    documentId: ctx.params.documentId,
                                    populate: {
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
                            question = _e.sent();
                            if (!question) {
                                return [2 /*return*/, ctx.notFound("Question not found")];
                            }
                            if (((_d = (_c = (_b = question.quiz) === null || _b === void 0 ? void 0 : _b.course) === null || _c === void 0 ? void 0 : _c.instructor) === null || _d === void 0 ? void 0 : _d.id) !== user.id) {
                                return [2 /*return*/, ctx.forbidden("You can only delete questions from your own quizzes")];
                            }
                            _e.label = 5;
                        case 5:
                            _e.trys.push([5, 7, , 8]);
                            return [4 /*yield*/, strapi
                                    .documents("api::question.question")
                                    .delete({
                                    documentId: question.documentId,
                                })];
                        case 6:
                            _e.sent();
                            return [2 /*return*/, {
                                    data: null,
                                }];
                        case 7:
                            error_3 = _e.sent();
                            strapi.log.error("DELETE QUESTION ERROR", error_3);
                            return [2 /*return*/, ctx.internalServerError("Failed to delete question")];
                        case 8: return [2 /*return*/];
                    }
                });
            });
        },
    });
});
