"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    routes: [
        {
            method: "GET",
            path: "/enrollments",
            handler: "enrollment.find",
            config: {
                policies: [],
            },
        },
        {
            method: "GET",
            path: "/enrollments/:documentId",
            handler: "enrollment.findOne",
            config: {
                policies: [],
            },
        },
        {
            method: "POST",
            path: "/enrollments",
            handler: "enrollment.create",
            config: {
                policies: ["global::is-student-enrollment"],
            },
        },
        {
            method: "DELETE",
            path: "/enrollments/:documentId",
            handler: "enrollment.delete",
            config: {
                policies: ["global::is-student-record-owner"],
            },
        },
    ],
};
