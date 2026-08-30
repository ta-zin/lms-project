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
Object.defineProperty(exports, "__esModule", { value: true });
var strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController("api::lesson.lesson", function (_a) {
    var strapi = _a.strapi;
    return ({
        find: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, role, roleName, enrollments, courseIds;
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
                            ctx.query = __assign(__assign({}, ctx.query), { filters: __assign(__assign({}, (ctx.query.filters || {})), { course: {
                                        instructor: {
                                            id: {
                                                $eq: user.id,
                                            },
                                        },
                                    } }) });
                            return [4 /*yield*/, _super.find.call(this, ctx)];
                        case 4: return [2 /*return*/, _b.sent()];
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
                            ctx.query = __assign(__assign({}, ctx.query), { filters: __assign(__assign({}, (ctx.query.filters || {})), { course: {
                                        id: {
                                            $in: courseIds,
                                        },
                                    } }) });
                            return [4 /*yield*/, _super.find.call(this, ctx)];
                        case 7: return [2 /*return*/, _b.sent()];
                        case 8: return [2 /*return*/, ctx.forbidden()];
                    }
                });
            });
        },
        findOne: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, role, roleName, lesson, enrollment;
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
                            return [4 /*yield*/, _super.findOne.call(this, ctx)];
                        case 2: return [2 /*return*/, _e.sent()];
                        case 3: return [4 /*yield*/, strapi
                                .documents("api::lesson.lesson")
                                .findOne({
                                documentId: ctx.params.documentId,
                                populate: {
                                    course: {
                                        populate: {
                                            instructor: true,
                                        },
                                    },
                                },
                            })];
                        case 4:
                            lesson = _e.sent();
                            if (!lesson) {
                                return [2 /*return*/, ctx.notFound("Lesson not found")];
                            }
                            if (roleName === "Instructor") {
                                if (((_c = (_b = lesson.course) === null || _b === void 0 ? void 0 : _b.instructor) === null || _c === void 0 ? void 0 : _c.id) !== user.id) {
                                    return [2 /*return*/, ctx.forbidden("You can only view lessons from your own courses")];
                                }
                                return [2 /*return*/, { data: lesson }];
                            }
                            if (!(roleName === "Student")) return [3 /*break*/, 6];
                            return [4 /*yield*/, strapi.db
                                    .query("api::enrollment.enrollment")
                                    .findOne({
                                    where: {
                                        student: user.id,
                                        course: (_d = lesson.course) === null || _d === void 0 ? void 0 : _d.id,
                                    },
                                })];
                        case 5:
                            enrollment = _e.sent();
                            if (!enrollment) {
                                return [2 /*return*/, ctx.forbidden("You are not enrolled in this course")];
                            }
                            return [2 /*return*/, { data: lesson }];
                        case 6: return [2 /*return*/, ctx.forbidden()];
                    }
                });
            });
        },
        create: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, role, roleName, data, course, lesson, error_1;
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
                                    where: { id: user.id },
                                    populate: ["role"],
                                })];
                        case 1:
                            role = _d.sent();
                            roleName = (_a = role === null || role === void 0 ? void 0 : role.role) === null || _a === void 0 ? void 0 : _a.name;
                            if (roleName !== "Admin" &&
                                roleName !== "Content Manager" &&
                                roleName !== "Instructor") {
                                return [2 /*return*/, ctx.forbidden()];
                            }
                            data = __assign({}, (((_b = ctx.request.body) === null || _b === void 0 ? void 0 : _b.data) || {}));
                            if (!data.title) {
                                return [2 /*return*/, ctx.badRequest("Title is required")];
                            }
                            if (!data.course) {
                                return [2 /*return*/, ctx.badRequest("Course is required")];
                            }
                            if (!(roleName === "Instructor")) return [3 /*break*/, 3];
                            return [4 /*yield*/, strapi
                                    .documents("api::course.course")
                                    .findOne({
                                    documentId: data.course,
                                    populate: {
                                        instructor: true,
                                    },
                                })];
                        case 2:
                            course = _d.sent();
                            if (!course) {
                                return [2 /*return*/, ctx.notFound("Course not found")];
                            }
                            if (((_c = course.instructor) === null || _c === void 0 ? void 0 : _c.id) !== user.id) {
                                return [2 /*return*/, ctx.forbidden("You can only create lessons for your own courses")];
                            }
                            _d.label = 3;
                        case 3:
                            _d.trys.push([3, 5, , 6]);
                            return [4 /*yield*/, strapi
                                    .documents("api::lesson.lesson")
                                    .create({
                                    data: data,
                                    status: "published",
                                })];
                        case 4:
                            lesson = _d.sent();
                            return [2 /*return*/, { data: lesson }];
                        case 5:
                            error_1 = _d.sent();
                            strapi.log.error("CREATE LESSON ERROR", error_1);
                            return [2 /*return*/, ctx.internalServerError("Failed to create lesson")];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        },
        update: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, role, roleName, documentId, data_1, updatedLesson, error_2, lesson, data, course, updatedLesson, error_3;
                var _a, _b, _c, _d, _e, _f;
                return __generator(this, function (_g) {
                    switch (_g.label) {
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
                            role = _g.sent();
                            roleName = (_a = role === null || role === void 0 ? void 0 : role.role) === null || _a === void 0 ? void 0 : _a.name;
                            if (!(roleName === "Admin" ||
                                roleName === "Content Manager")) return [3 /*break*/, 6];
                            documentId = ctx.params.documentId;
                            data_1 = __assign({}, (((_b = ctx.request.body) === null || _b === void 0 ? void 0 : _b.data) || {}));
                            if (!data_1.title) {
                                return [2 /*return*/, ctx.badRequest("Title is required")];
                            }
                            _g.label = 2;
                        case 2:
                            _g.trys.push([2, 5, , 6]);
                            return [4 /*yield*/, strapi
                                    .documents("api::lesson.lesson")
                                    .update({
                                    documentId: documentId,
                                    data: data_1,
                                })];
                        case 3:
                            _g.sent();
                            return [4 /*yield*/, strapi
                                    .documents("api::lesson.lesson")
                                    .publish({
                                    documentId: documentId,
                                })];
                        case 4:
                            updatedLesson = _g.sent();
                            return [2 /*return*/, {
                                    data: updatedLesson,
                                }];
                        case 5:
                            error_2 = _g.sent();
                            strapi.log.error("ADMIN UPDATE LESSON ERROR", error_2);
                            return [2 /*return*/, ctx.internalServerError("Failed to update lesson")];
                        case 6:
                            /*
                             * INSTRUCTOR
                             * can update only lessons from own courses.
                             */
                            if (roleName !== "Instructor") {
                                return [2 /*return*/, ctx.forbidden()];
                            }
                            return [4 /*yield*/, strapi
                                    .documents("api::lesson.lesson")
                                    .findOne({
                                    documentId: ctx.params.documentId,
                                    populate: {
                                        course: {
                                            populate: {
                                                instructor: true,
                                            },
                                        },
                                    },
                                })];
                        case 7:
                            lesson = _g.sent();
                            if (!lesson) {
                                return [2 /*return*/, ctx.notFound("Lesson not found")];
                            }
                            if (((_d = (_c = lesson.course) === null || _c === void 0 ? void 0 : _c.instructor) === null || _d === void 0 ? void 0 : _d.id) !==
                                user.id) {
                                return [2 /*return*/, ctx.forbidden("You can only update lessons from your own courses")];
                            }
                            data = __assign({}, (((_e = ctx.request.body) === null || _e === void 0 ? void 0 : _e.data) || {}));
                            if (!data.course) return [3 /*break*/, 9];
                            return [4 /*yield*/, strapi
                                    .documents("api::course.course")
                                    .findOne({
                                    documentId: data.course,
                                    populate: {
                                        instructor: true,
                                    },
                                })];
                        case 8:
                            course = _g.sent();
                            if (!course) {
                                return [2 /*return*/, ctx.notFound("Course not found")];
                            }
                            if (((_f = course.instructor) === null || _f === void 0 ? void 0 : _f.id) !== user.id) {
                                return [2 /*return*/, ctx.forbidden("You can only move lessons to your own courses")];
                            }
                            _g.label = 9;
                        case 9:
                            _g.trys.push([9, 12, , 13]);
                            return [4 /*yield*/, strapi
                                    .documents("api::lesson.lesson")
                                    .update({
                                    documentId: lesson.documentId,
                                    data: data,
                                })];
                        case 10:
                            _g.sent();
                            return [4 /*yield*/, strapi
                                    .documents("api::lesson.lesson")
                                    .publish({
                                    documentId: lesson.documentId,
                                })];
                        case 11:
                            updatedLesson = _g.sent();
                            return [2 /*return*/, {
                                    data: updatedLesson,
                                }];
                        case 12:
                            error_3 = _g.sent();
                            strapi.log.error("UPDATE LESSON ERROR", error_3);
                            return [2 /*return*/, ctx.internalServerError("Failed to update lesson")];
                        case 13: return [2 /*return*/];
                    }
                });
            });
        },
        delete: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, role, roleName, lesson, error_4;
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
                                    where: { id: user.id },
                                    populate: ["role"],
                                })];
                        case 1:
                            role = _d.sent();
                            roleName = (_a = role === null || role === void 0 ? void 0 : role.role) === null || _a === void 0 ? void 0 : _a.name;
                            if (!(roleName === "Admin" ||
                                roleName === "Content Manager")) return [3 /*break*/, 3];
                            return [4 /*yield*/, _super.delete.call(this, ctx)];
                        case 2: return [2 /*return*/, _d.sent()];
                        case 3:
                            if (roleName !== "Instructor") {
                                return [2 /*return*/, ctx.forbidden()];
                            }
                            return [4 /*yield*/, strapi
                                    .documents("api::lesson.lesson")
                                    .findOne({
                                    documentId: ctx.params.documentId,
                                    populate: {
                                        course: {
                                            populate: {
                                                instructor: true,
                                            },
                                        },
                                    },
                                })];
                        case 4:
                            lesson = _d.sent();
                            if (!lesson) {
                                return [2 /*return*/, ctx.notFound("Lesson not found")];
                            }
                            if (((_c = (_b = lesson.course) === null || _b === void 0 ? void 0 : _b.instructor) === null || _c === void 0 ? void 0 : _c.id) !== user.id) {
                                return [2 /*return*/, ctx.forbidden("You can only delete lessons from your own courses")];
                            }
                            _d.label = 5;
                        case 5:
                            _d.trys.push([5, 7, , 8]);
                            return [4 /*yield*/, strapi
                                    .documents("api::lesson.lesson")
                                    .delete({
                                    documentId: lesson.documentId,
                                })];
                        case 6:
                            _d.sent();
                            return [2 /*return*/, { data: null }];
                        case 7:
                            error_4 = _d.sent();
                            strapi.log.error("DELETE LESSON ERROR", error_4);
                            return [2 /*return*/, ctx.internalServerError("Failed to delete lesson")];
                        case 8: return [2 /*return*/];
                    }
                });
            });
        },
    });
});
