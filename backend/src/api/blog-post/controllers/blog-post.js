"use strict";
// src/api/blog-post/controllers/blog-post.ts
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
var BLOG_UID = "api::blog-post.blog-post";
exports.default = strapi_1.factories.createCoreController(BLOG_UID, function (_a) {
    var strapi = _a.strapi;
    return ({
        find: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var blogs, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, strapi
                                    .service(BLOG_UID)
                                    .findPublishedBlogs()];
                        case 1:
                            blogs = _a.sent();
                            return [2 /*return*/, {
                                    data: blogs,
                                }];
                        case 2:
                            error_1 = _a.sent();
                            ctx.throw(500, "Failed to fetch published blog posts");
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        },
        findOne: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var documentId, blog, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            documentId = ctx.params.documentId;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, strapi
                                    .service(BLOG_UID)
                                    .findPublishedBlog(documentId)];
                        case 2:
                            blog = _a.sent();
                            if (!blog) {
                                return [2 /*return*/, ctx.notFound("Blog post not found")];
                            }
                            return [2 /*return*/, {
                                    data: blog,
                                }];
                        case 3:
                            error_2 = _a.sent();
                            ctx.throw(500, "Failed to fetch blog post");
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        },
        create: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, blog, error_3;
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            user = ctx.state.user;
                            if (!user) {
                                return [2 /*return*/, ctx.unauthorized("Authentication required")];
                            }
                            _d.label = 1;
                        case 1:
                            _d.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, strapi
                                    .service(BLOG_UID)
                                    .createBlog(user.id, (_b = (_a = ctx.request.body) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : {})];
                        case 2:
                            blog = _d.sent();
                            return [2 /*return*/, {
                                    data: blog,
                                }];
                        case 3:
                            error_3 = _d.sent();
                            if ((_c = error_3.message) === null || _c === void 0 ? void 0 : _c.includes("Only Admin and Content Manager")) {
                                return [2 /*return*/, ctx.forbidden(error_3.message)];
                            }
                            ctx.throw(400, error_3.message);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        },
        update: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, documentId, blog, error_4;
                var _a, _b, _c, _d, _e;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            user = ctx.state.user;
                            if (!user) {
                                return [2 /*return*/, ctx.unauthorized("Authentication required")];
                            }
                            documentId = ctx.params.documentId;
                            _f.label = 1;
                        case 1:
                            _f.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, strapi
                                    .service(BLOG_UID)
                                    .updateBlog(user.id, documentId, (_b = (_a = ctx.request.body) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : {})];
                        case 2:
                            blog = _f.sent();
                            return [2 /*return*/, {
                                    data: blog,
                                }];
                        case 3:
                            error_4 = _f.sent();
                            if (((_c = error_4.message) === null || _c === void 0 ? void 0 : _c.includes("only manage")) ||
                                ((_d = error_4.message) === null || _d === void 0 ? void 0 : _d.includes("not allowed"))) {
                                return [2 /*return*/, ctx.forbidden(error_4.message)];
                            }
                            if ((_e = error_4.message) === null || _e === void 0 ? void 0 : _e.includes("not found")) {
                                return [2 /*return*/, ctx.notFound(error_4.message)];
                            }
                            ctx.throw(400, error_4.message);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        },
        delete: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, documentId, deleted, error_5;
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            user = ctx.state.user;
                            if (!user) {
                                return [2 /*return*/, ctx.unauthorized("Authentication required")];
                            }
                            documentId = ctx.params.documentId;
                            _d.label = 1;
                        case 1:
                            _d.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, strapi
                                    .service(BLOG_UID)
                                    .deleteBlog(user.id, documentId)];
                        case 2:
                            deleted = _d.sent();
                            return [2 /*return*/, {
                                    data: deleted,
                                }];
                        case 3:
                            error_5 = _d.sent();
                            if (((_a = error_5.message) === null || _a === void 0 ? void 0 : _a.includes("only manage")) ||
                                ((_b = error_5.message) === null || _b === void 0 ? void 0 : _b.includes("not allowed"))) {
                                return [2 /*return*/, ctx.forbidden(error_5.message)];
                            }
                            if ((_c = error_5.message) === null || _c === void 0 ? void 0 : _c.includes("not found")) {
                                return [2 /*return*/, ctx.notFound(error_5.message)];
                            }
                            ctx.throw(400, error_5.message);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        },
        publish: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, documentId, blog, error_6;
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            user = ctx.state.user;
                            if (!user) {
                                return [2 /*return*/, ctx.unauthorized("Authentication required")];
                            }
                            documentId = ctx.params.documentId;
                            _d.label = 1;
                        case 1:
                            _d.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, strapi
                                    .service(BLOG_UID)
                                    .publishBlog(user.id, documentId)];
                        case 2:
                            blog = _d.sent();
                            return [2 /*return*/, {
                                    data: blog,
                                }];
                        case 3:
                            error_6 = _d.sent();
                            if (((_a = error_6.message) === null || _a === void 0 ? void 0 : _a.includes("only manage")) ||
                                ((_b = error_6.message) === null || _b === void 0 ? void 0 : _b.includes("not allowed"))) {
                                return [2 /*return*/, ctx.forbidden(error_6.message)];
                            }
                            if ((_c = error_6.message) === null || _c === void 0 ? void 0 : _c.includes("not found")) {
                                return [2 /*return*/, ctx.notFound(error_6.message)];
                            }
                            ctx.throw(400, error_6.message);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        },
        unpublish: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, documentId, blog, error_7;
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            user = ctx.state.user;
                            if (!user) {
                                return [2 /*return*/, ctx.unauthorized("Authentication required")];
                            }
                            documentId = ctx.params.documentId;
                            _d.label = 1;
                        case 1:
                            _d.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, strapi
                                    .service(BLOG_UID)
                                    .unpublishBlog(user.id, documentId)];
                        case 2:
                            blog = _d.sent();
                            return [2 /*return*/, {
                                    data: blog,
                                }];
                        case 3:
                            error_7 = _d.sent();
                            if (((_a = error_7.message) === null || _a === void 0 ? void 0 : _a.includes("only manage")) ||
                                ((_b = error_7.message) === null || _b === void 0 ? void 0 : _b.includes("not allowed"))) {
                                return [2 /*return*/, ctx.forbidden(error_7.message)];
                            }
                            if ((_c = error_7.message) === null || _c === void 0 ? void 0 : _c.includes("not found")) {
                                return [2 /*return*/, ctx.notFound(error_7.message)];
                            }
                            ctx.throw(400, error_7.message);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        },
        manage: function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, blogs, error_8;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            user = ctx.state.user;
                            if (!user) {
                                return [2 /*return*/, ctx.unauthorized("Authentication required")];
                            }
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, strapi
                                    .service(BLOG_UID)
                                    .findManageBlogs(user.id)];
                        case 2:
                            blogs = _b.sent();
                            return [2 /*return*/, {
                                    data: blogs,
                                }];
                        case 3:
                            error_8 = _b.sent();
                            if ((_a = error_8.message) === null || _a === void 0 ? void 0 : _a.includes("Only Admin and Content Manager")) {
                                return [2 /*return*/, ctx.forbidden(error_8.message)];
                            }
                            ctx.throw(400, error_8.message);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        },
    });
});
