// src/api/blog-post/services/blog-post.ts

import { factories } from "@strapi/strapi";

const BLOG_UID = "api::blog-post.blog-post";

export default factories.createCoreService(
  BLOG_UID,
  ({ strapi }) => ({

    async getUserRole(userId: number) {
      const user = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: { id: userId },
          populate: { role: true },
        });

      if (!user) {
        throw new Error("User not found");
      }

      return {
        user,
        roleName: user.role?.name?.toLowerCase() ?? "",
      };
    },

    async canManageBlog(
      userId: number,
      documentId: string
    ) {
      const { user, roleName } = await this.getUserRole(userId);

      const blog = await strapi
        .documents(BLOG_UID)
        .findOne({
          documentId,
          populate: {
            author: true,
          },
        });

      if (!blog) {
        return {
          allowed: false,
          reason: "Blog post not found",
          blog: null,
          user,
          roleName,
        };
      }

      // Admin can manage every blog
      if (roleName === "admin") {
        return {
          allowed: true,
          reason: null,
          blog,
          user,
          roleName,
        };
      }

      // Content Manager can manage only own blogs
      if (roleName === "content manager") {
        const authorId = blog.author?.id;

        if (authorId === user.id) {
          return {
            allowed: true,
            reason: null,
            blog,
            user,
            roleName,
          };
        }

        return {
          allowed: false,
          reason: "You can only manage your own blog posts",
          blog,
          user,
          roleName,
        };
      }

      return {
        allowed: false,
        reason: "You are not allowed to manage blog posts",
        blog,
        user,
        roleName,
      };
    },

    async createBlog(userId: number, data: any) {
      const { user, roleName } = await this.getUserRole(userId);

      if (
        roleName !== "admin" &&
        roleName !== "content manager"
      ) {
        throw new Error(
          "Only Admin and Content Manager can create blog posts"
        );
      }

      const blog = await strapi
        .documents(BLOG_UID)
        .create({
          data: {
            ...data,

            // Never trust author from client
            author: {
              connect: [user.id],
            },
          },

          populate: {
            author: true,
          },
        });

      return blog;
    },

    async updateBlog(
      userId: number,
      documentId: string,
      data: any
    ) {
      const permission = await this.canManageBlog(
        userId,
        documentId
      );

      if (!permission.allowed) {
        throw new Error(permission.reason);
      }

      // Prevent changing ownership through API
      const { author, publishedAt, ...safeData } = data;

      const blog = await strapi
        .documents(BLOG_UID)
        .update({
          documentId,
          data: safeData,
          populate: {
            author: true,
          },
        });

      return blog;
    },

    async deleteBlog(
      userId: number,
      documentId: string
    ) {
      const permission = await this.canManageBlog(
        userId,
        documentId
      );

      if (!permission.allowed) {
        throw new Error(permission.reason);
      }

      const deleted = await strapi
        .documents(BLOG_UID)
        .delete({
          documentId,
        });

      return deleted;
    },

    async publishBlog(
      userId: number,
      documentId: string
    ) {
      const permission = await this.canManageBlog(
        userId,
        documentId
      );

      if (!permission.allowed) {
        throw new Error(permission.reason);
      }

      const blog = await strapi
        .documents(BLOG_UID)
        .publish({
          documentId,
        });

      return blog;
    },

    async unpublishBlog(
      userId: number,
      documentId: string
    ) {
      const permission = await this.canManageBlog(
        userId,
        documentId
      );

      if (!permission.allowed) {
        throw new Error(permission.reason);
      }

      const blog = await strapi
        .documents(BLOG_UID)
        .unpublish({
          documentId,
        });

      return blog;
    },

    async findPublishedBlogs() {
      const blogs = await strapi
        .documents(BLOG_UID)
        .findMany({
          status: "published",
          populate: {
            author: {
              fields: ["id", "username"],
            },
          },
        });

      return blogs;
    },

    async findPublishedBlog(
      documentId: string
    ) {
      const blog = await strapi
        .documents(BLOG_UID)
        .findOne({
          documentId,
          status: "published",
          populate: {
            author: {
              fields: ["id", "username"],
            },
          },
        });

      return blog;
    },

    async findManageBlogs(userId: number) {
      const { user, roleName } =
        await this.getUserRole(userId);

      if (
        roleName !== "admin" &&
        roleName !== "content manager"
      ) {
        throw new Error(
          "Only Admin and Content Manager can manage blog posts"
        );
      }

      if (roleName === "admin") {
        return await strapi
          .documents(BLOG_UID)
          .findMany({
            status: "draft",
            populate: {
              author: {
                fields: ["id", "username"],
              },
            },
          });
      }

      return await strapi
        .documents(BLOG_UID)
        .findMany({
          status: "draft",
          filters: {
            author: {
              id: {
                $eq: user.id,
              },
            },
          },
          populate: {
            author: {
              fields: ["id", "username"],
            },
          },
        });
    },

  })
);