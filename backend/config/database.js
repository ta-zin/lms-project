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
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var database_1 = require("@strapi/database");
var config = function (_a) {
    var env = _a.env;
    var client = env('DATABASE_CLIENT', 'sqlite');
    if (!(0, database_1.isDatabaseClientKind)(client)) {
        throw new Error("Unsupported DATABASE_CLIENT: ".concat(client, ". Use \"postgres\", \"mysql\", or \"sqlite\"."));
    }
    var connections = {
        mysql: {
            client: 'mysql',
            connection: {
                host: env('DATABASE_HOST', 'localhost'),
                port: env.int('DATABASE_PORT', 3306),
                database: env('DATABASE_NAME', 'strapi'),
                user: env('DATABASE_USERNAME', 'strapi'),
                password: env('DATABASE_PASSWORD', 'strapi'),
                ssl: env.bool('DATABASE_SSL', false) && {
                    key: env('DATABASE_SSL_KEY', undefined),
                    cert: env('DATABASE_SSL_CERT', undefined),
                    ca: env('DATABASE_SSL_CA', undefined),
                    capath: env('DATABASE_SSL_CAPATH', undefined),
                    cipher: env('DATABASE_SSL_CIPHER', undefined),
                    rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
                },
            },
            pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
        },
        postgres: {
            client: 'postgres',
            connection: {
                connectionString: env('DATABASE_URL'),
                host: env('DATABASE_HOST', 'localhost'),
                port: env.int('DATABASE_PORT', 5432),
                database: env('DATABASE_NAME', 'strapi'),
                user: env('DATABASE_USERNAME', 'strapi'),
                password: env('DATABASE_PASSWORD', 'strapi'),
                ssl: env.bool('DATABASE_SSL', false) && {
                    key: env('DATABASE_SSL_KEY', undefined),
                    cert: env('DATABASE_SSL_CERT', undefined),
                    ca: env('DATABASE_SSL_CA', undefined),
                    capath: env('DATABASE_SSL_CAPATH', undefined),
                    cipher: env('DATABASE_SSL_CIPHER', undefined),
                    rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
                },
                schema: env('DATABASE_SCHEMA', 'public'),
            },
            pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
        },
        sqlite: {
            client: 'sqlite',
            connection: {
                filename: path_1.default.join(__dirname, '..', '..', env('DATABASE_FILENAME', '.tmp/data.db')),
            },
            useNullAsDefault: true,
        },
    };
    return {
        connection: __assign(__assign({}, connections[client]), { acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000) }),
    };
};
exports.default = config;
