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
var USER_UID = "plugin::users-permissions.user";
var ROLE_UID = "plugin::users-permissions.role";
var ALLOWED_ROLES = [
    "Admin",
    "Content Manager",
    "Instructor",
    "Student",
];
exports.default = strapi_1.factories.createCoreController("api::course.course", function (_a) {
    var strapi = _a.strapi;
    return ({
        create: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, role, roleName, data, instructor, course, error_1;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            user = ctx.state.user;
                            if (!user) {
                                return [2 /*return*/, ctx.unauthorized("Authentication required")];
                            }
                            return [4 /*yield*/, strapi
                                    .query(USER_UID)
                                    .findOne({
                                    where: {
                                        id: user.id,
                                    },
                                    populate: ["role"],
                                })];
                        case 1:
                            role = _c.sent();
                            roleName = (_a = role === null || role === void 0 ? void 0 : role.role) === null || _a === void 0 ? void 0 : _a.name;
                            if (roleName !== "Admin" &&
                                roleName !== "Content Manager" &&
                                roleName !== "Instructor") {
                                return [2 /*return*/, ctx.forbidden("You are not allowed to create courses")];
                            }
                            data = __assign({}, (((_b = ctx.request.body) === null || _b === void 0 ? void 0 : _b.data) || {}));
                            if (!data.title) {
                                return [2 /*return*/, ctx.badRequest("Title is required")];
                            }
                            if (!data.description) {
                                return [2 /*return*/, ctx.badRequest("Description is required")];
                            }
                            if (roleName === "Instructor") {
                                data.instructor = user.id;
                            }
                            if (!data.instructor) {
                                return [2 /*return*/, ctx.badRequest("Instructor is required")];
                            }
                            return [4 /*yield*/, strapi
                                    .query(USER_UID)
                                    .findOne({
                                    where: {
                                        id: data.instructor,
                                    },
                                })];
                        case 2:
                            instructor = _c.sent();
                            if (!instructor) {
                                return [2 /*return*/, ctx.badRequest("Invalid instructor")];
                            }
                            _c.label = 3;
                        case 3:
                            _c.trys.push([3, 5, , 6]);
                            return [4 /*yield*/, strapi
                                    .documents("api::course.course")
                                    .create({
                                    data: data,
                                    status: "published",
                                })];
                        case 4:
                            course = _c.sent();
                            return [2 /*return*/, { data: course }];
                        case 5:
                            error_1 = _c.sent();
                            strapi.log.error("CREATE COURSE ERROR", error_1);
                            return [2 /*return*/, ctx.internalServerError("Failed to create course")];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        },
        find: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, role, roleName;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            user = ctx.state.user;
                            if (!user) {
                                return [2 /*return*/, ctx.unauthorized("Authentication required")];
                            }
                            return [4 /*yield*/, strapi
                                    .query(USER_UID)
                                    .findOne({
                                    where: {
                                        id: user.id,
                                    },
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
                            ctx.query = __assign(__assign({}, ctx.query), { filters: __assign(__assign({}, (ctx.query.filters || {})), { instructor: {
                                        id: {
                                            $eq: user.id,
                                        },
                                    } }) });
                            return [4 /*yield*/, _super.find.call(this, ctx)];
                        case 4: return [2 /*return*/, _b.sent()];
                        case 5:
                            if (!(roleName === "Student")) return [3 /*break*/, 7];
                            return [4 /*yield*/, _super.find.call(this, ctx)];
                        case 6: return [2 /*return*/, _b.sent()];
                        case 7: return [2 /*return*/, ctx.forbidden()];
                    }
                });
            });
        },
        findOne: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, role, roleName, course, enrollment;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            user = ctx.state.user;
                            if (!user) {
                                return [2 /*return*/, ctx.unauthorized("Authentication required")];
                            }
                            return [4 /*yield*/, strapi
                                    .query(USER_UID)
                                    .findOne({
                                    where: {
                                        id: user.id,
                                    },
                                    populate: ["role"],
                                })];
                        case 1:
                            role = _c.sent();
                            roleName = (_a = role === null || role === void 0 ? void 0 : role.role) === null || _a === void 0 ? void 0 : _a.name;
                            if (!(roleName === "Admin" ||
                                roleName === "Content Manager")) return [3 /*break*/, 3];
                            return [4 /*yield*/, _super.findOne.call(this, ctx)];
                        case 2: return [2 /*return*/, _c.sent()];
                        case 3: return [4 /*yield*/, strapi
                                .documents("api::course.course")
                                .findOne({
                                documentId: ctx.params.documentId,
                                populate: {
                                    instructor: true,
                                },
                            })];
                        case 4:
                            course = _c.sent();
                            if (!course) {
                                return [2 /*return*/, ctx.notFound("Course not found")];
                            }
                            if (roleName === "Instructor" &&
                                ((_b = course.instructor) === null || _b === void 0 ? void 0 : _b.id) !== user.id) {
                                return [2 /*return*/, ctx.forbidden("You can only view your own courses")];
                            }
                            if (!(roleName === "Student")) return [3 /*break*/, 6];
                            return [4 /*yield*/, strapi.db
                                    .query("api::enrollment.enrollment")
                                    .findOne({
                                    where: {
                                        student: user.id,
                                        course: course.id,
                                    },
                                })];
                        case 5:
                            enrollment = _c.sent();
                            if (!enrollment) {
                                return [2 /*return*/, ctx.forbidden("You are not enrolled in this course")];
                            }
                            _c.label = 6;
                        case 6: return [2 /*return*/, { data: course }];
                    }
                });
            });
        },
        update: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, role, roleName, documentId, data_1, updatedCourse, error_2, course, data, updatedCourse, error_3;
                var _a, _b, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            user = ctx.state.user;
                            if (!user) {
                                return [2 /*return*/, ctx.unauthorized("Authentication required")];
                            }
                            return [4 /*yield*/, strapi
                                    .query(USER_UID)
                                    .findOne({
                                    where: {
                                        id: user.id,
                                    },
                                    populate: ["role"],
                                })];
                        case 1:
                            role = _e.sent();
                            roleName = (_a = role === null || role === void 0 ? void 0 : role.role) === null || _a === void 0 ? void 0 : _a.name;
                            if (!(roleName === "Admin" ||
                                roleName === "Content Manager")) return [3 /*break*/, 6];
                            documentId = ctx.params.documentId;
                            data_1 = __assign({}, (((_b = ctx.request.body) === null || _b === void 0 ? void 0 : _b.data) || {}));
                            _e.label = 2;
                        case 2:
                            _e.trys.push([2, 5, , 6]);
                            return [4 /*yield*/, strapi
                                    .documents("api::course.course")
                                    .update({
                                    documentId: documentId,
                                    data: data_1,
                                })];
                        case 3:
                            _e.sent();
                            return [4 /*yield*/, strapi
                                    .documents("api::course.course")
                                    .publish({
                                    documentId: documentId,
                                })];
                        case 4:
                            updatedCourse = _e.sent();
                            return [2 /*return*/, {
                                    data: updatedCourse,
                                }];
                        case 5:
                            error_2 = _e.sent();
                            strapi.log.error("ADMIN COURSE UPDATE ERROR", error_2);
                            return [2 /*return*/, ctx.internalServerError("Failed to update course")];
                        case 6:
                            if (roleName !== "Instructor") {
                                return [2 /*return*/, ctx.forbidden()];
                            }
                            return [4 /*yield*/, strapi
                                    .documents("api::course.course")
                                    .findOne({
                                    documentId: ctx.params.documentId ||
                                        ctx.params.id,
                                    populate: {
                                        instructor: true,
                                    },
                                })];
                        case 7:
                            course = _e.sent();
                            if (!course) {
                                return [2 /*return*/, ctx.notFound("Course not found")];
                            }
                            if (((_c = course.instructor) === null || _c === void 0 ? void 0 : _c.id) !== user.id) {
                                return [2 /*return*/, ctx.forbidden("You can only update your own course")];
                            }
                            data = __assign(__assign({}, (((_d = ctx.request.body) === null || _d === void 0 ? void 0 : _d.data) || {})), { instructor: user.id });
                            _e.label = 8;
                        case 8:
                            _e.trys.push([8, 11, , 12]);
                            return [4 /*yield*/, strapi
                                    .documents("api::course.course")
                                    .update({
                                    documentId: course.documentId,
                                    data: data,
                                })];
                        case 9:
                            _e.sent();
                            return [4 /*yield*/, strapi
                                    .documents("api::course.course")
                                    .publish({
                                    documentId: course.documentId,
                                })];
                        case 10:
                            updatedCourse = _e.sent();
                            return [2 /*return*/, {
                                    data: updatedCourse,
                                }];
                        case 11:
                            error_3 = _e.sent();
                            strapi.log.error("UPDATE COURSE ERROR", error_3);
                            return [2 /*return*/, ctx.internalServerError("Failed to update course")];
                        case 12: return [2 /*return*/];
                    }
                });
            });
        },
        delete: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, role, roleName, course, error_4;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            user = ctx.state.user;
                            if (!user) {
                                return [2 /*return*/, ctx.unauthorized("Authentication required")];
                            }
                            return [4 /*yield*/, strapi
                                    .query(USER_UID)
                                    .findOne({
                                    where: {
                                        id: user.id,
                                    },
                                    populate: ["role"],
                                })];
                        case 1:
                            role = _c.sent();
                            roleName = (_a = role === null || role === void 0 ? void 0 : role.role) === null || _a === void 0 ? void 0 : _a.name;
                            if (!(roleName === "Admin" ||
                                roleName === "Content Manager")) return [3 /*break*/, 3];
                            return [4 /*yield*/, _super.delete.call(this, ctx)];
                        case 2: return [2 /*return*/, _c.sent()];
                        case 3:
                            if (roleName !== "Instructor") {
                                return [2 /*return*/, ctx.forbidden()];
                            }
                            return [4 /*yield*/, strapi
                                    .documents("api::course.course")
                                    .findOne({
                                    documentId: ctx.params.documentId ||
                                        ctx.params.id,
                                    populate: {
                                        instructor: true,
                                    },
                                })];
                        case 4:
                            course = _c.sent();
                            if (!course) {
                                return [2 /*return*/, ctx.notFound("Course not found")];
                            }
                            if (((_b = course.instructor) === null || _b === void 0 ? void 0 : _b.id) !== user.id) {
                                return [2 /*return*/, ctx.forbidden("You can only delete your own course")];
                            }
                            _c.label = 5;
                        case 5:
                            _c.trys.push([5, 7, , 8]);
                            return [4 /*yield*/, strapi
                                    .documents("api::course.course")
                                    .delete({
                                    documentId: course.documentId,
                                })];
                        case 6:
                            _c.sent();
                            return [2 /*return*/, { data: null }];
                        case 7:
                            error_4 = _c.sent();
                            strapi.log.error("DELETE COURSE ERROR", error_4);
                            return [2 /*return*/, ctx.internalServerError("Failed to delete course")];
                        case 8: return [2 /*return*/];
                    }
                });
            });
        },
        /*
         * ADMIN USER MANAGEMENT
         */
        adminUsers: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var currentUser, admin, users;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            currentUser = ctx.state.user;
                            if (!currentUser) {
                                return [2 /*return*/, ctx.unauthorized("Authentication required")];
                            }
                            return [4 /*yield*/, strapi
                                    .query(USER_UID)
                                    .findOne({
                                    where: {
                                        id: currentUser.id,
                                    },
                                    populate: ["role"],
                                })];
                        case 1:
                            admin = _b.sent();
                            if (((_a = admin === null || admin === void 0 ? void 0 : admin.role) === null || _a === void 0 ? void 0 : _a.name) !== "Admin") {
                                return [2 /*return*/, ctx.forbidden("Only Admin can manage users")];
                            }
                            return [4 /*yield*/, strapi.db
                                    .query(USER_UID)
                                    .findMany({
                                    select: [
                                        "id",
                                        "documentId",
                                        "username",
                                        "email",
                                        "confirmed",
                                        "blocked",
                                        "createdAt",
                                        "updatedAt",
                                    ],
                                    populate: ["role"],
                                    orderBy: {
                                        createdAt: "desc",
                                    },
                                })];
                        case 2:
                            users = _b.sent();
                            return [2 /*return*/, {
                                    data: users.map(function (item) { return ({
                                        id: item.id,
                                        documentId: item.documentId,
                                        username: item.username,
                                        email: item.email,
                                        confirmed: item.confirmed,
                                        blocked: item.blocked,
                                        createdAt: item.createdAt,
                                        updatedAt: item.updatedAt,
                                        role: item.role
                                            ? {
                                                id: item.role.id,
                                                name: item.role.name,
                                                type: item.role.type,
                                                documentId: item.role
                                                    .documentId,
                                            }
                                            : null,
                                    }); }),
                                }];
                    }
                });
            });
        },
        adminUpdateUserRole: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var currentUser, admin, documentId, requestedRole, targetUser, targetRole, updated;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            currentUser = ctx.state.user;
                            if (!currentUser) {
                                return [2 /*return*/, ctx.unauthorized("Authentication required")];
                            }
                            return [4 /*yield*/, strapi
                                    .query(USER_UID)
                                    .findOne({
                                    where: {
                                        id: currentUser.id,
                                    },
                                    populate: ["role"],
                                })];
                        case 1:
                            admin = _c.sent();
                            if (((_a = admin === null || admin === void 0 ? void 0 : admin.role) === null || _a === void 0 ? void 0 : _a.name) !== "Admin") {
                                return [2 /*return*/, ctx.forbidden("Only Admin can change user roles")];
                            }
                            documentId = ctx.params.documentId;
                            requestedRole = (_b = ctx.request.body) === null || _b === void 0 ? void 0 : _b.role;
                            if (typeof requestedRole !==
                                "string" ||
                                !ALLOWED_ROLES.includes(requestedRole)) {
                                return [2 /*return*/, ctx.badRequest("Invalid role")];
                            }
                            return [4 /*yield*/, strapi.db
                                    .query(USER_UID)
                                    .findOne({
                                    where: {
                                        documentId: documentId,
                                    },
                                })];
                        case 2:
                            targetUser = _c.sent();
                            if (!targetUser) {
                                return [2 /*return*/, ctx.notFound("User not found")];
                            }
                            return [4 /*yield*/, strapi.db
                                    .query(ROLE_UID)
                                    .findOne({
                                    where: {
                                        name: requestedRole,
                                    },
                                })];
                        case 3:
                            targetRole = _c.sent();
                            if (!targetRole) {
                                return [2 /*return*/, ctx.badRequest("Role not found")];
                            }
                            return [4 /*yield*/, strapi.db
                                    .query(USER_UID)
                                    .update({
                                    where: {
                                        id: targetUser.id,
                                    },
                                    data: {
                                        role: targetRole.id,
                                    },
                                })];
                        case 4:
                            _c.sent();
                            return [4 /*yield*/, strapi.db
                                    .query(USER_UID)
                                    .findOne({
                                    where: {
                                        id: targetUser.id,
                                    },
                                    select: [
                                        "id",
                                        "documentId",
                                        "username",
                                        "email",
                                        "confirmed",
                                        "blocked",
                                    ],
                                    populate: ["role"],
                                })];
                        case 5:
                            updated = _c.sent();
                            return [2 /*return*/, {
                                    data: updated,
                                }];
                    }
                });
            });
        },
        adminDeleteUser: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var currentUser, admin, documentId, targetUser;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            currentUser = ctx.state.user;
                            if (!currentUser) {
                                return [2 /*return*/, ctx.unauthorized("Authentication required")];
                            }
                            return [4 /*yield*/, strapi
                                    .query(USER_UID)
                                    .findOne({
                                    where: {
                                        id: currentUser.id,
                                    },
                                    populate: ["role"],
                                })];
                        case 1:
                            admin = _b.sent();
                            if (((_a = admin === null || admin === void 0 ? void 0 : admin.role) === null || _a === void 0 ? void 0 : _a.name) !== "Admin") {
                                return [2 /*return*/, ctx.forbidden("Only Admin can delete users")];
                            }
                            documentId = ctx.params.documentId;
                            return [4 /*yield*/, strapi.db
                                    .query(USER_UID)
                                    .findOne({
                                    where: {
                                        documentId: documentId,
                                    },
                                })];
                        case 2:
                            targetUser = _b.sent();
                            if (!targetUser) {
                                return [2 /*return*/, ctx.notFound("User not found")];
                            }
                            if (targetUser.id ===
                                currentUser.id) {
                                return [2 /*return*/, ctx.badRequest("You cannot delete your own account")];
                            }
                            return [4 /*yield*/, strapi.db
                                    .query(USER_UID)
                                    .delete({
                                    where: {
                                        id: targetUser.id,
                                    },
                                })];
                        case 3:
                            _b.sent();
                            return [2 /*return*/, {
                                    data: {
                                        success: true,
                                    },
                                }];
                    }
                });
            });
        },
    });
});
