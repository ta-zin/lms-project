"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    routes: [
        {
            method: "GET",
            path: "/admin/users",
            handler: "course.adminUsers",
            config: {
                auth: {},
            },
        },
        {
            method: "PUT",
            path: "/admin/users/:documentId/role",
            handler: "course.adminUpdateUserRole",
            config: {
                auth: {},
            },
        },
        {
            method: "DELETE",
            path: "/admin/users/:documentId",
            handler: "course.adminDeleteUser",
            config: {
                auth: {},
            },
        },
    ],
};
