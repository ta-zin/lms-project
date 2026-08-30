"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isStudent = exports.isInstructor = exports.isAdmin = exports.getAuthenticatedUserId = void 0;
var getAuthenticatedUserId = function (ctx) {
    var user = ctx.state.user;
    if (!user) {
        return 0;
    }
    return user.id;
};
exports.getAuthenticatedUserId = getAuthenticatedUserId;
var isAdmin = function (ctx) {
    var _a, _b;
    return ((_b = (_a = ctx.state.user) === null || _a === void 0 ? void 0 : _a.role) === null || _b === void 0 ? void 0 : _b.type) === "admin";
};
exports.isAdmin = isAdmin;
var isInstructor = function (ctx) {
    var _a, _b;
    return ((_b = (_a = ctx.state.user) === null || _a === void 0 ? void 0 : _a.role) === null || _b === void 0 ? void 0 : _b.name) === "Instructor";
};
exports.isInstructor = isInstructor;
var isStudent = function (ctx) {
    var _a, _b;
    return ((_b = (_a = ctx.state.user) === null || _a === void 0 ? void 0 : _a.role) === null || _b === void 0 ? void 0 : _b.name) === "Student";
};
exports.isStudent = isStudent;
