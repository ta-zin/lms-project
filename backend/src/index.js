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
var USER_UID = "plugin::users-permissions.user";
var ROLE_UID = "plugin::users-permissions.role";
var LMS_ADMIN_USERNAME = process.env.LMS_ADMIN_USERNAME || "admin";
var LMS_ADMIN_EMAIL = process.env.LMS_ADMIN_EMAIL ||
    "admin@lms.com";
var LMS_ADMIN_PASSWORD = process.env.LMS_ADMIN_PASSWORD ||
    "Admin@12345";
var ROLE_NAMES = [
    "Admin",
    "Content Manager",
    "Instructor",
    "Student",
];
exports.default = {
    /**
     * Runs before the application is initialized.
     */
    register: function () { },
    /**
     * Runs before the application starts.
     */
    bootstrap: function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var userService, roles, _i, ROLE_NAMES_1, roleName, role, type, studentRole, adminRole, usersPermissionsStore, advancedSettings, adminUser, error_1;
            var strapi = _b.strapi;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 14, , 15]);
                        userService = strapi
                            .plugin("users-permissions")
                            .service("user");
                        roles = {};
                        _i = 0, ROLE_NAMES_1 = ROLE_NAMES;
                        _c.label = 1;
                    case 1:
                        if (!(_i < ROLE_NAMES_1.length)) return [3 /*break*/, 6];
                        roleName = ROLE_NAMES_1[_i];
                        return [4 /*yield*/, strapi.db
                                .query(ROLE_UID)
                                .findOne({
                                where: {
                                    name: roleName,
                                },
                            })];
                    case 2:
                        role = _c.sent();
                        if (!!role) return [3 /*break*/, 4];
                        type = roleName
                            .toLowerCase()
                            .replace(/\s+/g, "-");
                        return [4 /*yield*/, strapi.db
                                .query(ROLE_UID)
                                .create({
                                data: {
                                    name: roleName,
                                    type: type,
                                    description: "".concat(roleName, " role for the LMS"),
                                },
                            })];
                    case 3:
                        role = _c.sent();
                        strapi.log.info("Created LMS role: ".concat(roleName));
                        _c.label = 4;
                    case 4:
                        roles[roleName] = role;
                        _c.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        studentRole = roles["Student"];
                        adminRole = roles["Admin"];
                        usersPermissionsStore = strapi.store({
                            type: "plugin",
                            name: "users-permissions",
                        });
                        return [4 /*yield*/, usersPermissionsStore.get({
                                key: "advanced",
                            })];
                    case 7:
                        advancedSettings = (_c.sent()) || {};
                        return [4 /*yield*/, usersPermissionsStore.set({
                                key: "advanced",
                                value: __assign(__assign({}, advancedSettings), { default_role: studentRole.id }),
                            })];
                    case 8:
                        _c.sent();
                        return [4 /*yield*/, strapi.db
                                .query(USER_UID)
                                .findOne({
                                where: {
                                    email: LMS_ADMIN_EMAIL,
                                },
                            })];
                    case 9:
                        adminUser = _c.sent();
                        if (!!adminUser) return [3 /*break*/, 11];
                        return [4 /*yield*/, userService.add({
                                username: LMS_ADMIN_USERNAME,
                                email: LMS_ADMIN_EMAIL,
                                password: LMS_ADMIN_PASSWORD,
                                confirmed: true,
                                blocked: false,
                                role: adminRole.id,
                            })];
                    case 10:
                        adminUser = _c.sent();
                        strapi.log.info("LMS Admin created: ".concat(LMS_ADMIN_EMAIL));
                        return [3 /*break*/, 13];
                    case 11: 
                    /*
                     * Make sure the existing fixed account
                     * is always an Admin and active.
                     */
                    return [4 /*yield*/, strapi.db
                            .query(USER_UID)
                            .update({
                            where: {
                                id: adminUser.id,
                            },
                            data: {
                                username: LMS_ADMIN_USERNAME,
                                confirmed: true,
                                blocked: false,
                                role: adminRole.id,
                            },
                        })];
                    case 12:
                        /*
                         * Make sure the existing fixed account
                         * is always an Admin and active.
                         */
                        _c.sent();
                        strapi.log.info("LMS Admin verified: ".concat(LMS_ADMIN_EMAIL));
                        _c.label = 13;
                    case 13: return [3 /*break*/, 15];
                    case 14:
                        error_1 = _c.sent();
                        strapi.log.error("LMS bootstrap error", error_1);
                        return [3 /*break*/, 15];
                    case 15: return [2 /*return*/];
                }
            });
        });
    },
};
