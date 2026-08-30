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
exports.default = strapi_1.factories.createCoreController("api::enrollment.enrollment", function (_a) {
    var strapi = _a.strapi;
    return ({
        create: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, role, data, course, existing, enrollment, error_1;
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
                            if (((_a = role === null || role === void 0 ? void 0 : role.role) === null || _a === void 0 ? void 0 : _a.name) !== "Student") {
                                return [2 /*return*/, ctx.forbidden("Only students can enroll")];
                            }
                            data = __assign({}, (((_b = ctx.request.body) === null || _b === void 0 ? void 0 : _b.data) || {}));
                            if (!data.course) {
                                return [2 /*return*/, ctx.badRequest("Course is required")];
                            }
                            return [4 /*yield*/, strapi
                                    .documents("api::course.course")
                                    .findOne({
                                    documentId: data.course,
                                })];
                        case 2:
                            course = _c.sent();
                            if (!course) {
                                return [2 /*return*/, ctx.notFound("Course not found")];
                            }
                            return [4 /*yield*/, strapi.db
                                    .query("api::enrollment.enrollment")
                                    .findOne({
                                    where: {
                                        student: user.id,
                                        course: course.id,
                                    },
                                })];
                        case 3:
                            existing = _c.sent();
                            if (existing) {
                                return [2 /*return*/, ctx.badRequest("Already enrolled")];
                            }
                            _c.label = 4;
                        case 4:
                            _c.trys.push([4, 6, , 7]);
                            return [4 /*yield*/, strapi
                                    .documents("api::enrollment.enrollment")
                                    .create({
                                    data: __assign(__assign({}, data), { student: user.id, course: course.documentId }),
                                    status: "published",
                                })];
                        case 5:
                            enrollment = _c.sent();
                            return [2 /*return*/, { data: enrollment }];
                        case 6:
                            error_1 = _c.sent();
                            strapi.log.error("CREATE ENROLLMENT ERROR", error_1);
                            return [2 /*return*/, ctx.internalServerError("Failed to create enrollment")];
                        case 7: return [2 /*return*/];
                    }
                });
            });
        },
        find: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, role, roleName, enrollments, error_2;
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
                            if (roleName !== "Student") {
                                return [2 /*return*/, ctx.forbidden()];
                            }
                            _b.label = 4;
                        case 4:
                            _b.trys.push([4, 6, , 7]);
                            return [4 /*yield*/, strapi
                                    .documents("api::enrollment.enrollment")
                                    .findMany({
                                    filters: {
                                        student: {
                                            id: {
                                                $eq: user.id,
                                            },
                                        },
                                    },
                                    populate: {
                                        student: true,
                                        course: true,
                                    },
                                })];
                        case 5:
                            enrollments = _b.sent();
                            return [2 /*return*/, {
                                    data: enrollments,
                                }];
                        case 6:
                            error_2 = _b.sent();
                            strapi.log.error("FIND ENROLLMENTS ERROR", error_2);
                            return [2 /*return*/, ctx.internalServerError("Failed to fetch enrollments")];
                        case 7: return [2 /*return*/];
                    }
                });
            });
        },
        findOne: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, role, roleName, enrollment;
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
                            if (roleName !== "Student") {
                                return [2 /*return*/, ctx.forbidden()];
                            }
                            return [4 /*yield*/, strapi
                                    .documents("api::enrollment.enrollment")
                                    .findOne({
                                    documentId: ctx.params.documentId,
                                    populate: {
                                        student: true,
                                        course: true,
                                    },
                                })];
                        case 4:
                            enrollment = _c.sent();
                            if (!enrollment) {
                                return [2 /*return*/, ctx.notFound("Enrollment not found")];
                            }
                            if (((_b = enrollment.student) === null || _b === void 0 ? void 0 : _b.id) !== user.id) {
                                return [2 /*return*/, ctx.forbidden("You can only view your own enrollment")];
                            }
                            return [2 /*return*/, {
                                    data: enrollment,
                                }];
                    }
                });
            });
        },
    });
});
