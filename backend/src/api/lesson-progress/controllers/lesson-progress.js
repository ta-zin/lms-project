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
var PROGRESS_UID = "api::lesson-progress.lesson-progress";
var USER_UID = "plugin::users-permissions.user";
var LESSON_UID = "api::lesson.lesson";
var COURSE_UID = "api::course.course";
var ENROLLMENT_UID = "api::enrollment.enrollment";
exports.default = strapi_1.factories.createCoreController(PROGRESS_UID, function (_a) {
    var strapi = _a.strapi;
    return ({
        /**
         * Get the current user's role from Users & Permissions.
         */
        getCurrentUser: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, currentUser;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            user = ctx.state.user;
                            if (!user) {
                                return [2 /*return*/, null];
                            }
                            return [4 /*yield*/, strapi.db
                                    .query(USER_UID)
                                    .findOne({
                                    where: {
                                        id: user.id,
                                    },
                                    populate: {
                                        role: true,
                                    },
                                })];
                        case 1:
                            currentUser = _a.sent();
                            return [2 /*return*/, currentUser];
                    }
                });
            });
        },
        /**
         * POST /api/lesson-progresses
         *
         * Student marks a lesson as completed.
         *
         * Rules:
         * - Must be logged in
         * - Must be Student
         * - Lesson must exist
         * - Lesson must belong to a course
         * - Student must be enrolled in that course
         * - Student is always taken from JWT
         * - Duplicate progress is not created
         */
        create: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, currentUser, roleName, requestData, lessonDocumentId, lesson, enrollment, existingProgress, updatedProgress, progress, error_1;
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            _d.trys.push([0, 8, , 9]);
                            user = ctx.state.user;
                            if (!user) {
                                return [2 /*return*/, ctx.unauthorized("Authentication required")];
                            }
                            return [4 /*yield*/, this.getCurrentUser(ctx)];
                        case 1:
                            currentUser = _d.sent();
                            if (!currentUser) {
                                return [2 /*return*/, ctx.unauthorized("User not found")];
                            }
                            roleName = (_a = currentUser.role) === null || _a === void 0 ? void 0 : _a.name;
                            if (roleName !== "Student") {
                                return [2 /*return*/, ctx.forbidden("Only students can mark lessons as complete")];
                            }
                            requestData = (_c = (_b = ctx.request.body) === null || _b === void 0 ? void 0 : _b.data) !== null && _c !== void 0 ? _c : {};
                            lessonDocumentId = requestData.lesson;
                            if (!lessonDocumentId) {
                                return [2 /*return*/, ctx.badRequest("Lesson documentId is required")];
                            }
                            return [4 /*yield*/, strapi
                                    .documents(LESSON_UID)
                                    .findOne({
                                    documentId: lessonDocumentId,
                                    populate: {
                                        course: true,
                                    },
                                })];
                        case 2:
                            lesson = _d.sent();
                            if (!lesson) {
                                return [2 /*return*/, ctx.notFound("Lesson not found")];
                            }
                            if (!lesson.course) {
                                return [2 /*return*/, ctx.badRequest("Lesson is not associated with a course")];
                            }
                            return [4 /*yield*/, strapi.db
                                    .query(ENROLLMENT_UID)
                                    .findOne({
                                    where: {
                                        student: user.id,
                                        course: lesson.course.id,
                                    },
                                })];
                        case 3:
                            enrollment = _d.sent();
                            if (!enrollment) {
                                return [2 /*return*/, ctx.forbidden("You are not enrolled in this course")];
                            }
                            return [4 /*yield*/, strapi.db
                                    .query(PROGRESS_UID)
                                    .findOne({
                                    where: {
                                        student: user.id,
                                        lesson: lesson.id,
                                    },
                                })];
                        case 4:
                            existingProgress = _d.sent();
                            if (!existingProgress) return [3 /*break*/, 6];
                            return [4 /*yield*/, strapi.db
                                    .query(PROGRESS_UID)
                                    .update({
                                    where: {
                                        id: existingProgress.id,
                                    },
                                    data: {
                                        completed: true,
                                    },
                                    populate: {
                                        student: true,
                                        lesson: {
                                            populate: {
                                                course: true,
                                            },
                                        },
                                    },
                                })];
                        case 5:
                            updatedProgress = _d.sent();
                            return [2 /*return*/, {
                                    data: updatedProgress,
                                    meta: {
                                        message: "Lesson progress already existed and was marked complete",
                                    },
                                }];
                        case 6: return [4 /*yield*/, strapi.db
                                .query(PROGRESS_UID)
                                .create({
                                data: {
                                    student: user.id,
                                    lesson: lesson.id,
                                    completed: true,
                                },
                                populate: {
                                    student: true,
                                    lesson: {
                                        populate: {
                                            course: true,
                                        },
                                    },
                                },
                            })];
                        case 7:
                            progress = _d.sent();
                            return [2 /*return*/, {
                                    data: progress,
                                }];
                        case 8:
                            error_1 = _d.sent();
                            strapi.log.error("CREATE LESSON PROGRESS ERROR", error_1);
                            return [2 /*return*/, ctx.internalServerError("Failed to create lesson progress")];
                        case 9: return [2 /*return*/];
                    }
                });
            });
        },
        /**
         * GET /api/lesson-progresses
         *
         * Admin:
         *   All progress
         *
         * Content Manager:
         *   All progress
         *
         * Instructor:
         *   Progress of own courses only
         *
         * Student:
         *   Own progress only
         */
        find: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user_1, currentUser, roleName, progress, progress, progress, ownCourseProgress, error_2;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 8, , 9]);
                            user_1 = ctx.state.user;
                            if (!user_1) {
                                return [2 /*return*/, ctx.unauthorized("Authentication required")];
                            }
                            return [4 /*yield*/, this.getCurrentUser(ctx)];
                        case 1:
                            currentUser = _b.sent();
                            if (!currentUser) {
                                return [2 /*return*/, ctx.unauthorized("User not found")];
                            }
                            roleName = (_a = currentUser.role) === null || _a === void 0 ? void 0 : _a.name;
                            if (!(roleName === "Admin" ||
                                roleName === "Content Manager")) return [3 /*break*/, 3];
                            return [4 /*yield*/, strapi.db
                                    .query(PROGRESS_UID)
                                    .findMany({
                                    populate: {
                                        student: true,
                                        lesson: {
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
                        case 2:
                            progress = _b.sent();
                            return [2 /*return*/, {
                                    data: progress,
                                }];
                        case 3:
                            if (!(roleName === "Student")) return [3 /*break*/, 5];
                            return [4 /*yield*/, strapi.db
                                    .query(PROGRESS_UID)
                                    .findMany({
                                    where: {
                                        student: user_1.id,
                                    },
                                    populate: {
                                        lesson: {
                                            populate: {
                                                course: true,
                                            },
                                        },
                                    },
                                })];
                        case 4:
                            progress = _b.sent();
                            return [2 /*return*/, {
                                    data: progress,
                                }];
                        case 5:
                            if (!(roleName === "Instructor")) return [3 /*break*/, 7];
                            return [4 /*yield*/, strapi.db
                                    .query(PROGRESS_UID)
                                    .findMany({
                                    populate: {
                                        student: true,
                                        lesson: {
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
                        case 6:
                            progress = _b.sent();
                            ownCourseProgress = progress.filter(function (item) {
                                var _a, _b, _c;
                                return ((_c = (_b = (_a = item.lesson) === null || _a === void 0 ? void 0 : _a.course) === null || _b === void 0 ? void 0 : _b.instructor) === null || _c === void 0 ? void 0 : _c.id) ===
                                    user_1.id;
                            });
                            return [2 /*return*/, {
                                    data: ownCourseProgress,
                                }];
                        case 7: return [2 /*return*/, ctx.forbidden("You are not allowed to view lesson progress")];
                        case 8:
                            error_2 = _b.sent();
                            strapi.log.error("FIND LESSON PROGRESS ERROR", error_2);
                            return [2 /*return*/, ctx.internalServerError("Failed to fetch lesson progress")];
                        case 9: return [2 /*return*/];
                    }
                });
            });
        },
        /**
         * GET /api/lesson-progresses/:documentId
         *
         * Admin:
         *   Any progress
         *
         * Content Manager:
         *   Any progress
         *
         * Instructor:
         *   Only progress from own course
         *
         * Student:
         *   Only own progress
         */
        findOne: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, currentUser, roleName, documentId, progress, instructorId, error_3;
                var _a, _b, _c, _d, _e;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            _f.trys.push([0, 3, , 4]);
                            user = ctx.state.user;
                            if (!user) {
                                return [2 /*return*/, ctx.unauthorized("Authentication required")];
                            }
                            return [4 /*yield*/, this.getCurrentUser(ctx)];
                        case 1:
                            currentUser = _f.sent();
                            if (!currentUser) {
                                return [2 /*return*/, ctx.unauthorized("User not found")];
                            }
                            roleName = (_a = currentUser.role) === null || _a === void 0 ? void 0 : _a.name;
                            documentId = ctx.params.documentId;
                            if (!documentId) {
                                return [2 /*return*/, ctx.badRequest("Lesson progress documentId is required")];
                            }
                            return [4 /*yield*/, strapi
                                    .documents(PROGRESS_UID)
                                    .findOne({
                                    documentId: documentId,
                                    populate: {
                                        student: true,
                                        lesson: {
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
                        case 2:
                            progress = _f.sent();
                            if (!progress) {
                                return [2 /*return*/, ctx.notFound("Lesson progress not found")];
                            }
                            /**
                             * Admin / Content Manager
                             */
                            if (roleName === "Admin" ||
                                roleName === "Content Manager") {
                                return [2 /*return*/, {
                                        data: progress,
                                    }];
                            }
                            /**
                             * Student
                             */
                            if (roleName === "Student") {
                                if (((_b = progress.student) === null || _b === void 0 ? void 0 : _b.id) !==
                                    user.id) {
                                    return [2 /*return*/, ctx.forbidden("You can only view your own lesson progress")];
                                }
                                return [2 /*return*/, {
                                        data: progress,
                                    }];
                            }
                            /**
                             * Instructor
                             */
                            if (roleName === "Instructor") {
                                instructorId = (_e = (_d = (_c = progress.lesson) === null || _c === void 0 ? void 0 : _c.course) === null || _d === void 0 ? void 0 : _d.instructor) === null || _e === void 0 ? void 0 : _e.id;
                                if (instructorId !== user.id) {
                                    return [2 /*return*/, ctx.forbidden("You can only view progress from your own courses")];
                                }
                                return [2 /*return*/, {
                                        data: progress,
                                    }];
                            }
                            return [2 /*return*/, ctx.forbidden("You are not allowed to view this lesson progress")];
                        case 3:
                            error_3 = _f.sent();
                            strapi.log.error("FIND ONE LESSON PROGRESS ERROR", error_3);
                            return [2 /*return*/, ctx.internalServerError("Failed to fetch lesson progress")];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        },
        delete: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, currentUser, roleName, documentId, progress, error_4;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 4, , 5]);
                            user = ctx.state.user;
                            if (!user) {
                                return [2 /*return*/, ctx.unauthorized("Authentication required")];
                            }
                            return [4 /*yield*/, this.getCurrentUser(ctx)];
                        case 1:
                            currentUser = _c.sent();
                            if (!currentUser) {
                                return [2 /*return*/, ctx.unauthorized("User not found")];
                            }
                            roleName = (_a = currentUser.role) === null || _a === void 0 ? void 0 : _a.name;
                            if (roleName !== "Student") {
                                return [2 /*return*/, ctx.forbidden("Only students can remove lesson progress")];
                            }
                            documentId = ctx.params.documentId;
                            if (!documentId) {
                                return [2 /*return*/, ctx.badRequest("Lesson progress documentId is required")];
                            }
                            return [4 /*yield*/, strapi
                                    .documents(PROGRESS_UID)
                                    .findOne({
                                    documentId: documentId,
                                    populate: {
                                        student: true,
                                        lesson: {
                                            populate: {
                                                course: true,
                                            },
                                        },
                                    },
                                })];
                        case 2:
                            progress = _c.sent();
                            if (!progress) {
                                return [2 /*return*/, ctx.notFound("Lesson progress not found")];
                            }
                            if (((_b = progress.student) === null || _b === void 0 ? void 0 : _b.id) !== user.id) {
                                return [2 /*return*/, ctx.forbidden("You can only remove your own lesson progress")];
                            }
                            return [4 /*yield*/, strapi
                                    .documents(PROGRESS_UID)
                                    .delete({
                                    documentId: documentId,
                                })];
                        case 3:
                            _c.sent();
                            return [2 /*return*/, {
                                    data: null,
                                }];
                        case 4:
                            error_4 = _c.sent();
                            strapi.log.error("DELETE LESSON PROGRESS ERROR", error_4);
                            return [2 /*return*/, ctx.internalServerError("Failed to remove lesson progress")];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        },
        /**
         * GET
         * /api/lesson-progresses/course/:courseDocumentId
         *
         * Student:
         *   Own progress after enrollment check
         *
         * Instructor:
         *   All students' progress
         *   from own course
         *
         * Admin / Content Manager:
         *   All students' progress
         *   from requested course
         */
        getCourseProgress: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, currentUser, roleName, courseDocumentId, course_1, lessons, totalLessons_1, enrollment, studentProgress, courseProgress, completedLessons, percentage, instructorId, allProgress, courseProgress, studentMap, _i, courseProgress_1, item, student, studentData, students, error_5;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 9, , 10]);
                            user = ctx.state.user;
                            if (!user) {
                                return [2 /*return*/, ctx.unauthorized("Authentication required")];
                            }
                            return [4 /*yield*/, this.getCurrentUser(ctx)];
                        case 1:
                            currentUser = _c.sent();
                            if (!currentUser) {
                                return [2 /*return*/, ctx.unauthorized("User not found")];
                            }
                            roleName = (_a = currentUser.role) === null || _a === void 0 ? void 0 : _a.name;
                            courseDocumentId = ctx.params.courseDocumentId;
                            if (!courseDocumentId) {
                                return [2 /*return*/, ctx.badRequest("Course documentId is required")];
                            }
                            return [4 /*yield*/, strapi
                                    .documents(COURSE_UID)
                                    .findOne({
                                    documentId: courseDocumentId,
                                    populate: {
                                        instructor: true,
                                    },
                                })];
                        case 2:
                            course_1 = _c.sent();
                            if (!course_1) {
                                return [2 /*return*/, ctx.notFound("Course not found")];
                            }
                            return [4 /*yield*/, strapi
                                    .documents(LESSON_UID)
                                    .findMany({
                                    filters: {
                                        course: {
                                            documentId: {
                                                $eq: courseDocumentId,
                                            },
                                        },
                                    },
                                })];
                        case 3:
                            lessons = _c.sent();
                            totalLessons_1 = lessons.length;
                            if (!(roleName === "Student")) return [3 /*break*/, 6];
                            return [4 /*yield*/, strapi.db
                                    .query(ENROLLMENT_UID)
                                    .findOne({
                                    where: {
                                        student: user.id,
                                        course: course_1.id,
                                    },
                                })];
                        case 4:
                            enrollment = _c.sent();
                            if (!enrollment) {
                                return [2 /*return*/, ctx.forbidden("You are not enrolled in this course")];
                            }
                            return [4 /*yield*/, strapi.db
                                    .query(PROGRESS_UID)
                                    .findMany({
                                    where: {
                                        student: user.id,
                                    },
                                    populate: {
                                        lesson: {
                                            populate: {
                                                course: true,
                                            },
                                        },
                                    },
                                })];
                        case 5:
                            studentProgress = _c.sent();
                            courseProgress = studentProgress.filter(function (item) {
                                var _a, _b;
                                return ((_b = (_a = item.lesson) === null || _a === void 0 ? void 0 : _a.course) === null || _b === void 0 ? void 0 : _b.id) ===
                                    course_1.id;
                            });
                            completedLessons = courseProgress.filter(function (item) {
                                return item.completed === true;
                            }).length;
                            percentage = totalLessons_1 > 0
                                ? Math.round((completedLessons /
                                    totalLessons_1) *
                                    100)
                                : 0;
                            return [2 /*return*/, {
                                    data: {
                                        course: course_1,
                                        totalLessons: totalLessons_1,
                                        completedLessons: completedLessons,
                                        percentage: percentage,
                                        progress: courseProgress,
                                    },
                                }];
                        case 6:
                            /**
                             * --------------------------------------
                             * INSTRUCTOR
                             * --------------------------------------
                             */
                            if (roleName === "Instructor") {
                                instructorId = (_b = course_1.instructor) === null || _b === void 0 ? void 0 : _b.id;
                                if (instructorId !== user.id) {
                                    return [2 /*return*/, ctx.forbidden("You can only view progress of your own courses")];
                                }
                            }
                            if (!(roleName === "Admin" ||
                                roleName === "Content Manager" ||
                                roleName === "Instructor")) return [3 /*break*/, 8];
                            return [4 /*yield*/, strapi.db
                                    .query(PROGRESS_UID)
                                    .findMany({
                                    populate: {
                                        student: true,
                                        lesson: {
                                            populate: {
                                                course: true,
                                            },
                                        },
                                    },
                                })];
                        case 7:
                            allProgress = _c.sent();
                            courseProgress = allProgress.filter(function (item) {
                                var _a, _b;
                                return ((_b = (_a = item.lesson) === null || _a === void 0 ? void 0 : _a.course) === null || _b === void 0 ? void 0 : _b.id) ===
                                    course_1.id;
                            });
                            studentMap = new Map();
                            for (_i = 0, courseProgress_1 = courseProgress; _i < courseProgress_1.length; _i++) {
                                item = courseProgress_1[_i];
                                student = item.student;
                                if (!student) {
                                    continue;
                                }
                                if (!studentMap.has(student.id)) {
                                    studentMap.set(student.id, {
                                        student: student,
                                        completedLessons: 0,
                                        progress: [],
                                    });
                                }
                                studentData = studentMap.get(student.id);
                                studentData.progress.push(item);
                                if (item.completed === true) {
                                    studentData.completedLessons += 1;
                                }
                            }
                            students = Array.from(studentMap.values()).map(function (studentData) { return ({
                                student: studentData.student,
                                totalLessons: totalLessons_1,
                                completedLessons: studentData.completedLessons,
                                percentage: totalLessons_1 > 0
                                    ? Math.round((studentData.completedLessons /
                                        totalLessons_1) *
                                        100)
                                    : 0,
                                progress: studentData.progress,
                            }); });
                            return [2 /*return*/, {
                                    data: {
                                        course: course_1,
                                        totalLessons: totalLessons_1,
                                        students: students,
                                    },
                                }];
                        case 8: return [2 /*return*/, ctx.forbidden("You are not allowed to view course progress")];
                        case 9:
                            error_5 = _c.sent();
                            strapi.log.error("GET COURSE PROGRESS ERROR", error_5);
                            return [2 /*return*/, ctx.internalServerError("Failed to calculate course progress")];
                        case 10: return [2 /*return*/];
                    }
                });
            });
        },
    });
});
