import type { Core } from "@strapi/strapi";

const USER_UID = "plugin::users-permissions.user";
const ROLE_UID = "plugin::users-permissions.role";
const PERMISSION_UID = "plugin::users-permissions.permission";

const LMS_ADMIN_USERNAME =
  process.env.LMS_ADMIN_USERNAME || "admin";

const LMS_ADMIN_EMAIL =
  process.env.LMS_ADMIN_EMAIL || "admin@lms.com";

const LMS_ADMIN_PASSWORD =
  process.env.LMS_ADMIN_PASSWORD || "123456";

const ROLE_CONFIG = {
  Admin: {
    type: "admin",
    description: "Admin role for the LMS",

    permissions: [
      "api::blog-post.blog-post.create",
      "api::blog-post.blog-post.delete",
      "api::blog-post.blog-post.find",
      "api::blog-post.blog-post.findOne",
      "api::blog-post.blog-post.manage",
      "api::blog-post.blog-post.publish",
      "api::blog-post.blog-post.unpublish",
      "api::blog-post.blog-post.update",

      "api::course.course.adminDeleteUser",
      "api::course.course.adminUpdateUserRole",
      "api::course.course.adminUsers",
      "api::course.course.create",
      "api::course.course.delete",
      "api::course.course.find",
      "api::course.course.findOne",
      "api::course.course.update",

      "api::enrollment.enrollment.delete",
      "api::enrollment.enrollment.find",
      "api::enrollment.enrollment.findOne",

      "api::lesson-progress.lesson-progress.find",
      "api::lesson-progress.lesson-progress.findOne",
      "api::lesson-progress.lesson-progress.getCourseProgress",

      "api::lesson.lesson.create",
      "api::lesson.lesson.delete",
      "api::lesson.lesson.find",
      "api::lesson.lesson.findOne",
      "api::lesson.lesson.update",

      "api::question.question.create",
      "api::question.question.delete",
      "api::question.question.find",
      "api::question.question.findOne",
      "api::question.question.update",

      "api::quiz-result.quiz-result.find",
      "api::quiz-result.quiz-result.findOne",

      "api::quiz.quiz.create",
      "api::quiz.quiz.delete",
      "api::quiz.quiz.find",
      "api::quiz.quiz.findOne",
      "api::quiz.quiz.update",

      "plugin::users-permissions.auth.logout",
      "plugin::users-permissions.role.createRole",
      "plugin::users-permissions.role.deleteRole",
      "plugin::users-permissions.role.find",
      "plugin::users-permissions.role.findOne",
      "plugin::users-permissions.role.updateRole",
      "plugin::users-permissions.user.me",
    ],
  },

  "Content Manager": {
    type: "content_manager",
    description: "Content Manager role for the LMS",

    permissions: [
      "api::blog-post.blog-post.create",
      "api::blog-post.blog-post.delete",
      "api::blog-post.blog-post.find",
      "api::blog-post.blog-post.findOne",
      "api::blog-post.blog-post.update",

      "api::course.course.create",
      "api::course.course.delete",
      "api::course.course.find",
      "api::course.course.findOne",
      "api::course.course.update",

      "api::lesson-progress.lesson-progress.find",
      "api::lesson-progress.lesson-progress.findOne",
      "api::lesson-progress.lesson-progress.getCourseProgress",

      "api::lesson.lesson.create",
      "api::lesson.lesson.delete",
      "api::lesson.lesson.find",
      "api::lesson.lesson.findOne",
      "api::lesson.lesson.update",

      "api::quiz.quiz.create",
      "api::quiz.quiz.delete",
      "api::quiz.quiz.find",
      "api::quiz.quiz.findOne",
      "api::quiz.quiz.update",

      "plugin::users-permissions.role.find",
      "plugin::users-permissions.role.findOne",
      "plugin::users-permissions.user.me",
    ],
  },

  Instructor: {
    type: "instructor",
    description: "Instructor role for the LMS",

    permissions: [
      "api::blog-post.blog-post.find",
      "api::blog-post.blog-post.findOne",

      "api::course.course.adminDeleteUser",
      "api::course.course.adminUpdateUserRole",
      "api::course.course.adminUsers",
      "api::course.course.create",
      "api::course.course.delete",
      "api::course.course.find",
      "api::course.course.findOne",
      "api::course.course.update",

      "api::enrollment.enrollment.find",
      "api::enrollment.enrollment.findOne",

      "api::lesson-progress.lesson-progress.getCourseProgress",

      "api::lesson.lesson.create",
      "api::lesson.lesson.delete",
      "api::lesson.lesson.find",
      "api::lesson.lesson.findOne",
      "api::lesson.lesson.update",

      "api::question.question.create",
      "api::question.question.delete",
      "api::question.question.find",
      "api::question.question.findOne",
      "api::question.question.update",

      "api::quiz-result.quiz-result.find",
      "api::quiz-result.quiz-result.findOne",

      "api::quiz.quiz.create",
      "api::quiz.quiz.delete",
      "api::quiz.quiz.find",
      "api::quiz.quiz.findOne",
      "api::quiz.quiz.update",

      "plugin::users-permissions.role.find",
      "plugin::users-permissions.role.findOne",
      "plugin::users-permissions.user.find",
      "plugin::users-permissions.user.findOne",
      "plugin::users-permissions.user.me",
    ],
  },

  Student: {
    type: "student",
    description: "Student role for the LMS",

    permissions: [
      "api::blog-post.blog-post.find",
      "api::blog-post.blog-post.findOne",

      "api::course.course.find",
      "api::course.course.findOne",

      "api::enrollment.enrollment.create",
      "api::enrollment.enrollment.find",
      "api::enrollment.enrollment.findOne",

      "api::lesson-progress.lesson-progress.create",
      "api::lesson-progress.lesson-progress.getCourseProgress",

      "api::lesson.lesson.find",
      "api::lesson.lesson.findOne",

      "api::question.question.find",
      "api::question.question.findOne",

      "api::quiz-result.quiz-result.create",
      "api::quiz-result.quiz-result.find",
      "api::quiz-result.quiz-result.findOne",

      "api::quiz.quiz.find",
      "api::quiz.quiz.findOne",

      "plugin::users-permissions.role.find",
      "plugin::users-permissions.role.findOne",
      "plugin::users-permissions.user.findOne",
      "plugin::users-permissions.user.me",
    ],
  },
} as const;

export default {
  register() {},

  async bootstrap({
    strapi,
  }: {
    strapi: Core.Strapi;
  }) {
    try {
      const userService = strapi
        .plugin("users-permissions")
        .service("user");

      const roles: Record<string, any> = {};

      /*
       * Ensure LMS roles exist.
       */
      for (const [roleName, config] of Object.entries(
        ROLE_CONFIG
      )) {
        let role = await strapi.db
          .query(ROLE_UID)
          .findOne({
            where: {
              type: config.type,
            },
          });

        /*
         * Fallback for an existing role whose type may
         * not have been set correctly.
         */
        if (!role) {
          role = await strapi.db
            .query(ROLE_UID)
            .findOne({
              where: {
                name: roleName,
              },
            });
        }

        if (!role) {
          role = await strapi.db
            .query(ROLE_UID)
            .create({
              data: {
                name: roleName,
                type: config.type,
                description: config.description,
              },
            });

          strapi.log.info(
            `Created LMS role: ${roleName}`
          );
        } else {
          /*
           * Keep role metadata consistent.
           */
          role = await strapi.db
            .query(ROLE_UID)
            .update({
              where: {
                id: role.id,
              },
              data: {
                name: roleName,
                type: config.type,
                description: config.description,
              },
            });
        }

        /*
         * Ensure every required permission exists.
         */
        

        const permissionIds: number[] = [];

for (const action of config.permissions) {
  let permission = await strapi.db
    .query(PERMISSION_UID)
    .findOne({
      where: {
        action,
        role: role.id,
      },
    });

  if (!permission) {
    permission = await strapi.db
      .query(PERMISSION_UID)
      .create({
        data: {
          action,
          enabled: true,
          role: role.id,
        },
      });
  } else {
    permission = await strapi.db
      .query(PERMISSION_UID)
      .update({
        where: {
          id: permission.id,
        },
        data: {
          enabled: true,
        },
      });
  }

  permissionIds.push(permission.id);
}

        /*
         * Sync the role ↔ permission relationship.
         */
        await strapi.db
          .query(ROLE_UID)
          .update({
            where: {
              id: role.id,
            },
            data: {
              permissions: {
                set: permissionIds,
              },
            },
          });

        roles[roleName] = role;

        strapi.log.info(
          `LMS role ready: ${roleName} (${permissionIds.length} permissions)`
        );
      }

      const studentRole = roles["Student"];
      const adminRole = roles["Admin"];

      /*
       * Make Student the default registration role.
       */
      const usersPermissionsStore = strapi.store({
        type: "plugin",
        name: "users-permissions",
      });

      const advancedSettings =
        (await usersPermissionsStore.get({
          key: "advanced",
        })) || {};

      await usersPermissionsStore.set({
        key: "advanced",
        value: {
          ...advancedSettings,
          allow_register: true,
          default_role: "student",
        },
      });

      /*
       * Create or verify the fixed LMS Admin user.
       */
      let adminUser = await strapi.db
        .query(USER_UID)
        .findOne({
          where: {
            email: LMS_ADMIN_EMAIL,
          },
        });

      if (!adminUser) {
        await userService.add({
          username: LMS_ADMIN_USERNAME,
          email: LMS_ADMIN_EMAIL,
          password: LMS_ADMIN_PASSWORD,
          confirmed: true,
          blocked: false,
          role: adminRole.id,
        });

        strapi.log.info(
          `LMS Admin created: ${LMS_ADMIN_EMAIL}`
        );
      } else {
        await strapi.db
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
          });

        strapi.log.info(
          `LMS Admin verified: ${LMS_ADMIN_EMAIL}`
        );
      }

      strapi.log.info(
        "LMS roles and permissions synchronized successfully."
      );
    } catch (error) {
      strapi.log.error(
        "LMS bootstrap error",
        error
      );
    }
  },
};