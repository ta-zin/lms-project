"use strict";
// src/api/blog-post/services/blog-post.ts
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
var BLOG_UID = "api::blog-post.blog-post";
exports.default = strapi_1.factories.createCoreService(BLOG_UID, function (_a) {
    var strapi = _a.strapi;
    return ({
        getUserRole: function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var user;
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0: return [4 /*yield*/, strapi.db
                                .query("plugin::users-permissions.user")
                                .findOne({
                                where: { id: userId },
                                populate: { role: true },
                            })];
                        case 1:
                            user = _d.sent();
                            if (!user) {
                                throw new Error("User not found");
                            }
                            return [2 /*return*/, {
                                    user: user,
                                    roleName: (_c = (_b = (_a = user.role) === null || _a === void 0 ? void 0 : _a.name) === null || _b === void 0 ? void 0 : _b.toLowerCase()) !== null && _c !== void 0 ? _c : "",
                                }];
                    }
                });
            });
        },
        canManageBlog: function (userId, documentId) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, user, roleName, blog, authorId;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, this.getUserRole(userId)];
                        case 1:
                            _a = _c.sent(), user = _a.user, roleName = _a.roleName;
                            return [4 /*yield*/, strapi
                                    .documents(BLOG_UID)
                                    .findOne({
                                    documentId: documentId,
                                    populate: {
                                        author: true,
                                    },
                                })];
                        case 2:
                            blog = _c.sent();
                            if (!blog) {
                                return [2 /*return*/, {
                                        allowed: false,
                                        reason: "Blog post not found",
                                        blog: null,
                                        user: user,
                                        roleName: roleName,
                                    }];
                            }
                            // Admin can manage every blog
                            if (roleName === "admin") {
                                return [2 /*return*/, {
                                        allowed: true,
                                        reason: null,
                                        blog: blog,
                                        user: user,
                                        roleName: roleName,
                                    }];
                            }
                            // Content Manager can manage only own blogs
                            if (roleName === "content manager") {
                                authorId = (_b = blog.author) === null || _b === void 0 ? void 0 : _b.id;
                                if (authorId === user.id) {
                                    return [2 /*return*/, {
                                            allowed: true,
                                            reason: null,
                                            blog: blog,
                                            user: user,
                                            roleName: roleName,
                                        }];
                                }
                                return [2 /*return*/, {
                                        allowed: false,
                                        reason: "You can only manage your own blog posts",
                                        blog: blog,
                                        user: user,
                                        roleName: roleName,
                                    }];
                            }
                            return [2 /*return*/, {
                                    allowed: false,
                                    reason: "You are not allowed to manage blog posts",
                                    blog: blog,
                                    user: user,
                                    roleName: roleName,
                                }];
                    }
                });
            });
        },
        createBlog: function (userId, data) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, user, roleName, blog;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.getUserRole(userId)];
                        case 1:
                            _a = _b.sent(), user = _a.user, roleName = _a.roleName;
                            if (roleName !== "admin" &&
                                roleName !== "content manager") {
                                throw new Error("Only Admin and Content Manager can create blog posts");
                            }
                            return [4 /*yield*/, strapi
                                    .documents(BLOG_UID)
                                    .create({
                                    data: __assign(__assign({}, data), { 
                                        // Never trust author from client
                                        author: {
                                            connect: [user.id],
                                        } }),
                                    populate: {
                                        author: true,
                                    },
                                })];
                        case 2:
                            blog = _b.sent();
                            return [2 /*return*/, blog];
                    }
                });
            });
        },
        updateBlog: function (userId, documentId, data) {
            return __awaiter(this, void 0, void 0, function () {
                var permission, author, publishedAt, safeData, blog;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.canManageBlog(userId, documentId)];
                        case 1:
                            permission = _a.sent();
                            if (!permission.allowed) {
                                throw new Error(permission.reason);
                            }
                            author = data.author, publishedAt = data.publishedAt, safeData = __rest(data, ["author", "publishedAt"]);
                            return [4 /*yield*/, strapi
                                    .documents(BLOG_UID)
                                    .update({
                                    documentId: documentId,
                                    data: safeData,
                                    populate: {
                                        author: true,
                                    },
                                })];
                        case 2:
                            blog = _a.sent();
                            return [2 /*return*/, blog];
                    }
                });
            });
        },
        deleteBlog: function (userId, documentId) {
            return __awaiter(this, void 0, void 0, function () {
                var permission, deleted;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.canManageBlog(userId, documentId)];
                        case 1:
                            permission = _a.sent();
                            if (!permission.allowed) {
                                throw new Error(permission.reason);
                            }
                            return [4 /*yield*/, strapi
                                    .documents(BLOG_UID)
                                    .delete({
                                    documentId: documentId,
                                })];
                        case 2:
                            deleted = _a.sent();
                            return [2 /*return*/, deleted];
                    }
                });
            });
        },
        publishBlog: function (userId, documentId) {
            return __awaiter(this, void 0, void 0, function () {
                var permission, blog;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.canManageBlog(userId, documentId)];
                        case 1:
                            permission = _a.sent();
                            if (!permission.allowed) {
                                throw new Error(permission.reason);
                            }
                            return [4 /*yield*/, strapi
                                    .documents(BLOG_UID)
                                    .publish({
                                    documentId: documentId,
                                })];
                        case 2:
                            blog = _a.sent();
                            return [2 /*return*/, blog];
                    }
                });
            });
        },
        unpublishBlog: function (userId, documentId) {
            return __awaiter(this, void 0, void 0, function () {
                var permission, blog;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.canManageBlog(userId, documentId)];
                        case 1:
                            permission = _a.sent();
                            if (!permission.allowed) {
                                throw new Error(permission.reason);
                            }
                            return [4 /*yield*/, strapi
                                    .documents(BLOG_UID)
                                    .unpublish({
                                    documentId: documentId,
                                })];
                        case 2:
                            blog = _a.sent();
                            return [2 /*return*/, blog];
                    }
                });
            });
        },
        findPublishedBlogs: function () {
            return __awaiter(this, void 0, void 0, function () {
                var blogs;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, strapi
                                .documents(BLOG_UID)
                                .findMany({
                                status: "published",
                                populate: {
                                    author: {
                                        fields: ["id", "username"],
                                    },
                                },
                            })];
                        case 1:
                            blogs = _a.sent();
                            return [2 /*return*/, blogs];
                    }
                });
            });
        },
        findPublishedBlog: function (documentId) {
            return __awaiter(this, void 0, void 0, function () {
                var blog;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, strapi
                                .documents(BLOG_UID)
                                .findOne({
                                documentId: documentId,
                                status: "published",
                                populate: {
                                    author: {
                                        fields: ["id", "username"],
                                    },
                                },
                            })];
                        case 1:
                            blog = _a.sent();
                            return [2 /*return*/, blog];
                    }
                });
            });
        },
        findManageBlogs: function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, user, roleName;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.getUserRole(userId)];
                        case 1:
                            _a = _b.sent(), user = _a.user, roleName = _a.roleName;
                            if (roleName !== "admin" &&
                                roleName !== "content manager") {
                                throw new Error("Only Admin and Content Manager can manage blog posts");
                            }
                            if (!(roleName === "admin")) return [3 /*break*/, 3];
                            return [4 /*yield*/, strapi
                                    .documents(BLOG_UID)
                                    .findMany({
                                    status: "draft",
                                    populate: {
                                        author: {
                                            fields: ["id", "username"],
                                        },
                                    },
                                })];
                        case 2: return [2 /*return*/, _b.sent()];
                        case 3: return [4 /*yield*/, strapi
                                .documents(BLOG_UID)
                                .findMany({
                                status: "draft",
                                filters: {
                                    author: {
                                        id: {
                                            $eq: user.id,
                                        },
                                    },
                                },
                                populate: {
                                    author: {
                                        fields: ["id", "username"],
                                    },
                                },
                            })];
                        case 4: return [2 /*return*/, _b.sent()];
                    }
                });
            });
        },
    });
});
