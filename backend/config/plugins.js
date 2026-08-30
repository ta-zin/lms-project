"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var allowedMediaTypes = [
    'image/*',
    'video/*',
    'audio/*',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.*',
    'text/plain',
    'text/csv',
];
var deniedTypes = [
    'image/svg+xml',
    'application/vnd.microsoft.portable-executable',
    'application/x-msdownload',
    'application/x-msdos-program',
    'application/x-executable',
    'application/x-dosexec',
    'application/x-sh',
    'text/x-shellscript',
    'application/x-mach-binary',
];
var config = function (_a) {
    var env = _a.env;
    return ({
        'users-permissions': {
            config: {
                jwtManagement: 'refresh',
                sessions: {
                    httpOnly: true,
                },
            },
        },
        upload: {
            config: {
                security: {
                    allowedTypes: allowedMediaTypes,
                    deniedTypes: deniedTypes,
                },
            },
        },
    });
};
exports.default = config;
