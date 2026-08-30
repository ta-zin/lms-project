import type { Core } from "@strapi/strapi";

const USER_UID =
  "plugin::users-permissions.user";

const ROLE_UID =
  "plugin::users-permissions.role";

const LMS_ADMIN_USERNAME =
  process.env.LMS_ADMIN_USERNAME || "admin";

const LMS_ADMIN_EMAIL =
  process.env.LMS_ADMIN_EMAIL ||
  "admin@lms.com";

const LMS_ADMIN_PASSWORD =
  process.env.LMS_ADMIN_PASSWORD ||
  "Admin@12345";

const ROLE_NAMES = [
  "Admin",
  "Content Manager",
  "Instructor",
  "Student",
] as const;

export default {
  /**
   * Runs before the application is initialized.
   */
  register() {},

  /**
   * Runs before the application starts.
   */
  async bootstrap({
    strapi,
  }: {
    strapi: Core.Strapi;
  }) {
    try {
      const userService = strapi
        .plugin("users-permissions")
        .service("user");

      /*
       * Make sure the LMS roles exist.
       */
      const roles: Record<string, any> = {};

      for (const roleName of ROLE_NAMES) {
        let role = await strapi.db
          .query(ROLE_UID)
          .findOne({
            where: {
              name: roleName,
            },
          });

        if (!role) {
          const type =
            roleName
              .toLowerCase()
              .replace(/\s+/g, "-");

          role = await strapi.db
            .query(ROLE_UID)
            .create({
              data: {
                name: roleName,
                type,
                description: `${roleName} role for the LMS`,
              },
            });

          strapi.log.info(
            `Created LMS role: ${roleName}`
          );
        }

        roles[roleName] = role;
      }

      const studentRole =
        roles["Student"];

      const adminRole =
        roles["Admin"];

      /*
       * Make Student the default role
       * for public registrations.
       */
      const usersPermissionsStore =
        strapi.store({
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
          default_role: studentRole.id,
        },
      });

      /*
       * Create the fixed LMS Admin user
       * if it does not already exist.
       */
      let adminUser = await strapi.db
        .query(USER_UID)
        .findOne({
          where: {
            email: LMS_ADMIN_EMAIL,
          },
        });

      if (!adminUser) {
        adminUser = await userService.add({
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
        /*
         * Make sure the existing fixed account
         * is always an Admin and active.
         */
        await strapi.db
          .query(USER_UID)
          .update({
            where: {
              id: adminUser.id,
            },
            data: {
              username:
                LMS_ADMIN_USERNAME,
              confirmed: true,
              blocked: false,
              role: adminRole.id,
            },
          });

        strapi.log.info(
          `LMS Admin verified: ${LMS_ADMIN_EMAIL}`
        );
      }
    } catch (error) {
      strapi.log.error(
        "LMS bootstrap error",
        error
      );
    }
  },
};