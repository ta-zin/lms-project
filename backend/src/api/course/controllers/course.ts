import { factories } from "@strapi/strapi";

const USER_UID =
  "plugin::users-permissions.user";

const ROLE_UID =
  "plugin::users-permissions.role";

const ALLOWED_ROLES = [
  "Admin",
  "Content Manager",
  "Instructor",
  "Student",
] as const;

export default factories.createCoreController(
  "api::course.course",
  ({ strapi }) => ({
    async create(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized(
          "Authentication required"
        );
      }

      const role = await strapi
        .query(USER_UID)
        .findOne({
          where: {
            id: user.id,
          },
          populate: ["role"],
        });

      const roleName = role?.role?.name;

      if (
        roleName !== "Admin" &&
        roleName !== "Content Manager" &&
        roleName !== "Instructor"
      ) {
        return ctx.forbidden(
          "You are not allowed to create courses"
        );
      }

      const data = {
        ...(ctx.request.body?.data || {}),
      };

      if (!data.title) {
        return ctx.badRequest(
          "Title is required"
        );
      }

      if (!data.description) {
        return ctx.badRequest(
          "Description is required"
        );
      }

      if (roleName === "Instructor") {
        data.instructor = user.id;
      }

      if (!data.instructor) {
        return ctx.badRequest(
          "Instructor is required"
        );
      }

      const instructor = await strapi
        .query(USER_UID)
        .findOne({
          where: {
            id: data.instructor,
          },
        });

      if (!instructor) {
        return ctx.badRequest(
          "Invalid instructor"
        );
      }

      try {
        const course = await strapi
          .documents("api::course.course")
          .create({
            data,
            status: "published",
          });

        return { data: course };
      } catch (error) {
        strapi.log.error(
          "CREATE COURSE ERROR",
          error
        );

        return ctx.internalServerError(
          "Failed to create course"
        );
      }
    },

    async find(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized(
          "Authentication required"
        );
      }

      const role = await strapi
        .query(USER_UID)
        .findOne({
          where: {
            id: user.id,
          },
          populate: ["role"],
        });

      const roleName = role?.role?.name;

      if (
        roleName === "Admin" ||
        roleName === "Content Manager"
      ) {
        return await super.find(ctx);
      }

      if (roleName === "Instructor") {
        ctx.query = {
          ...ctx.query,
          filters: {
            ...(ctx.query.filters || {}),
            instructor: {
              id: {
                $eq: user.id,
              },
            },
          },
        };

        return await super.find(ctx);
      }

      if (roleName === "Student") {
        return await super.find(ctx);
      }

      return ctx.forbidden();
    },

    async findOne(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized(
          "Authentication required"
        );
      }

      const role = await strapi
        .query(USER_UID)
        .findOne({
          where: {
            id: user.id,
          },
          populate: ["role"],
        });

      const roleName = role?.role?.name;

      if (
        roleName === "Admin" ||
        roleName === "Content Manager"
      ) {
        return await super.findOne(ctx);
      }

      const course = await strapi
        .documents("api::course.course")
        .findOne({
          documentId:
            ctx.params.documentId,
          populate: {
            instructor: true,
          },
        });

      if (!course) {
        return ctx.notFound(
          "Course not found"
        );
      }

      if (
        roleName === "Instructor" &&
        course.instructor?.id !== user.id
      ) {
        return ctx.forbidden(
          "You can only view your own courses"
        );
      }

      if (roleName === "Student") {
        const enrollment =
          await strapi.db
            .query(
              "api::enrollment.enrollment"
            )
            .findOne({
              where: {
                student: user.id,
                course: course.id,
              },
            });

        if (!enrollment) {
          return ctx.forbidden(
            "You are not enrolled in this course"
          );
        }
      }

      return { data: course };
    },

    async update(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized(
          "Authentication required"
        );
      }

      const role = await strapi
        .query(USER_UID)
        .findOne({
          where: {
            id: user.id,
          },
          populate: ["role"],
        });

      const roleName = role?.role?.name;

      if (
  roleName === "Admin" ||
  roleName === "Content Manager"
) {
  const documentId =
    ctx.params.documentId;

  const data = {
    ...(ctx.request.body?.data || {}),
  };

  try {
    await strapi
      .documents("api::course.course")
      .update({
        documentId,
        data,
      });

    const updatedCourse =
      await strapi
        .documents("api::course.course")
        .publish({
          documentId,
        });

    return {
      data: updatedCourse,
    };
  } catch (error) {
    strapi.log.error(
      "ADMIN COURSE UPDATE ERROR",
      error
    );

    return ctx.internalServerError(
      "Failed to update course"
    );
  }
}

      if (roleName !== "Instructor") {
        return ctx.forbidden();
      }

      const course = await strapi
        .documents("api::course.course")
        .findOne({
          documentId:
            ctx.params.documentId ||
            ctx.params.id,
          populate: {
            instructor: true,
          },
        });

      if (!course) {
        return ctx.notFound(
          "Course not found"
        );
      }

      if (
        course.instructor?.id !== user.id
      ) {
        return ctx.forbidden(
          "You can only update your own course"
        );
      }

      const data = {
        ...(ctx.request.body?.data || {}),
        instructor: user.id,
      };

      try {
  await strapi
    .documents("api::course.course")
    .update({
      documentId: course.documentId,
      data,
    });

  const updatedCourse =
    await strapi
      .documents("api::course.course")
      .publish({
        documentId: course.documentId,
      });

  return {
    data: updatedCourse,
  };
} catch (error) {
  strapi.log.error(
    "UPDATE COURSE ERROR",
    error
  );

  return ctx.internalServerError(
    "Failed to update course"
  );
}
    
    },

    async delete(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized(
          "Authentication required"
        );
      }

      const role = await strapi
        .query(USER_UID)
        .findOne({
          where: {
            id: user.id,
          },
          populate: ["role"],
        });

      const roleName = role?.role?.name;

      if (
        roleName === "Admin" ||
        roleName === "Content Manager"
      ) {
        return await super.delete(ctx);
      }

      if (roleName !== "Instructor") {
        return ctx.forbidden();
      }

      const course = await strapi
        .documents("api::course.course")
        .findOne({
          documentId:
            ctx.params.documentId ||
            ctx.params.id,
          populate: {
            instructor: true,
          },
        });

      if (!course) {
        return ctx.notFound(
          "Course not found"
        );
      }

      if (
        course.instructor?.id !== user.id
      ) {
        return ctx.forbidden(
          "You can only delete your own course"
        );
      }

      try {
        await strapi
          .documents("api::course.course")
          .delete({
            documentId:
              course.documentId,
          });

        return { data: null };
      } catch (error) {
        strapi.log.error(
          "DELETE COURSE ERROR",
          error
        );

        return ctx.internalServerError(
          "Failed to delete course"
        );
      }
    },

    /*
     * ADMIN USER MANAGEMENT
     */

    async adminUsers(ctx) {
      const currentUser =
        ctx.state.user;

      if (!currentUser) {
        return ctx.unauthorized(
          "Authentication required"
        );
      }

      const admin = await strapi
        .query(USER_UID)
        .findOne({
          where: {
            id: currentUser.id,
          },
          populate: ["role"],
        });

      if (
        admin?.role?.name !== "Admin"
      ) {
        return ctx.forbidden(
          "Only Admin can manage users"
        );
      }

      const users =
        await strapi.db
          .query(USER_UID)
          .findMany({
            select: [
              "id",
              "documentId",
              "username",
              "email",
              "confirmed",
              "blocked",
              "createdAt",
              "updatedAt",
            ],
            populate: ["role"],
            orderBy: {
              createdAt: "desc",
            },
          });

      return {
        data: users.map(
          (item: any) => ({
            id: item.id,
            documentId:
              item.documentId,
            username:
              item.username,
            email: item.email,
            confirmed:
              item.confirmed,
            blocked:
              item.blocked,
            createdAt:
              item.createdAt,
            updatedAt:
              item.updatedAt,
            role: item.role
              ? {
                  id: item.role.id,
                  name: item.role.name,
                  type: item.role.type,
                  documentId:
                    item.role
                      .documentId,
                }
              : null,
          })
        ),
      };
    },

    async adminUpdateUserRole(
      ctx
    ) {
      const currentUser =
        ctx.state.user;

      if (!currentUser) {
        return ctx.unauthorized(
          "Authentication required"
        );
      }

      const admin = await strapi
        .query(USER_UID)
        .findOne({
          where: {
            id: currentUser.id,
          },
          populate: ["role"],
        });

      if (
        admin?.role?.name !== "Admin"
      ) {
        return ctx.forbidden(
          "Only Admin can change user roles"
        );
      }

      const documentId =
        ctx.params.documentId;

      const requestedRole =
        ctx.request.body?.role;

      if (
        typeof requestedRole !==
          "string" ||
        !ALLOWED_ROLES.includes(
          requestedRole as any
        )
      ) {
        return ctx.badRequest(
          "Invalid role"
        );
      }

      const targetUser =
        await strapi.db
          .query(USER_UID)
          .findOne({
            where: {
              documentId,
            },
          });

      if (!targetUser) {
        return ctx.notFound(
          "User not found"
        );
      }

      const targetRole =
        await strapi.db
          .query(ROLE_UID)
          .findOne({
            where: {
              name: requestedRole,
            },
          });

      if (!targetRole) {
        return ctx.badRequest(
          "Role not found"
        );
      }

      await strapi.db
        .query(USER_UID)
        .update({
          where: {
            id: targetUser.id,
          },
          data: {
            role: targetRole.id,
          },
        });

      const updated =
        await strapi.db
          .query(USER_UID)
          .findOne({
            where: {
              id: targetUser.id,
            },
            select: [
              "id",
              "documentId",
              "username",
              "email",
              "confirmed",
              "blocked",
            ],
            populate: ["role"],
          });

      return {
        data: updated,
      };
    },

    async adminDeleteUser(ctx) {
      const currentUser =
        ctx.state.user;

      if (!currentUser) {
        return ctx.unauthorized(
          "Authentication required"
        );
      }

      const admin = await strapi
        .query(USER_UID)
        .findOne({
          where: {
            id: currentUser.id,
          },
          populate: ["role"],
        });

      if (
        admin?.role?.name !== "Admin"
      ) {
        return ctx.forbidden(
          "Only Admin can delete users"
        );
      }

      const documentId =
        ctx.params.documentId;

      const targetUser =
        await strapi.db
          .query(USER_UID)
          .findOne({
            where: {
              documentId,
            },
          });

      if (!targetUser) {
        return ctx.notFound(
          "User not found"
        );
      }

      if (
        targetUser.id ===
        currentUser.id
      ) {
        return ctx.badRequest(
          "You cannot delete your own account"
        );
      }

      await strapi.db
        .query(USER_UID)
        .delete({
          where: {
            id: targetUser.id,
          },
        });

      return {
        data: {
          success: true,
        },
      };
    },
  }) 
);