// src/api/blog-post/controllers/blog-post.ts

import { factories } from "@strapi/strapi";

const BLOG_UID = "api::blog-post.blog-post";

export default factories.createCoreController(
  BLOG_UID,
  ({ strapi }) => ({

    async find(ctx) {
      try {
        const blogs = await strapi
          .service(BLOG_UID)
          .findPublishedBlogs();

        return {
          data: blogs,
        };
      } catch (error) {
        ctx.throw(500, "Failed to fetch published blog posts");
      }
    },

    async findOne(ctx) {
      const { documentId } = ctx.params;

      try {
        const blog = await strapi
          .service(BLOG_UID)
          .findPublishedBlog(documentId);

        if (!blog) {
          return ctx.notFound("Blog post not found");
        }

        return {
          data: blog,
        };
      } catch (error) {
        ctx.throw(500, "Failed to fetch blog post");
      }
    },

    async create(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized(
          "Authentication required"
        );
      }

      try {
        const blog = await strapi
          .service(BLOG_UID)
          .createBlog(
            user.id,
            ctx.request.body?.data ?? {}
          );

        return {
          data: blog,
        };
      } catch (error: any) {
        if (
          error.message?.includes(
            "Only Admin and Content Manager"
          )
        ) {
          return ctx.forbidden(error.message);
        }

        ctx.throw(400, error.message);
      }
    },

    async update(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized(
          "Authentication required"
        );
      }

      const { documentId } = ctx.params;

      try {
        const blog = await strapi
          .service(BLOG_UID)
          .updateBlog(
            user.id,
            documentId,
            ctx.request.body?.data ?? {}
          );

        return {
          data: blog,
        };
      } catch (error: any) {
        if (
          error.message?.includes("only manage") ||
          error.message?.includes("not allowed")
        ) {
          return ctx.forbidden(error.message);
        }

        if (
          error.message?.includes("not found")
        ) {
          return ctx.notFound(error.message);
        }

        ctx.throw(400, error.message);
      }
    },

    async delete(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized(
          "Authentication required"
        );
      }

      const { documentId } = ctx.params;

      try {
        const deleted = await strapi
          .service(BLOG_UID)
          .deleteBlog(
            user.id,
            documentId
          );

        return {
          data: deleted,
        };
      } catch (error: any) {
        if (
          error.message?.includes("only manage") ||
          error.message?.includes("not allowed")
        ) {
          return ctx.forbidden(error.message);
        }

        if (
          error.message?.includes("not found")
        ) {
          return ctx.notFound(error.message);
        }

        ctx.throw(400, error.message);
      }
    },

    async publish(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized(
          "Authentication required"
        );
      }

      const { documentId } = ctx.params;

      try {
        const blog = await strapi
          .service(BLOG_UID)
          .publishBlog(
            user.id,
            documentId
          );

        return {
          data: blog,
        };
      } catch (error: any) {
        if (
          error.message?.includes("only manage") ||
          error.message?.includes("not allowed")
        ) {
          return ctx.forbidden(error.message);
        }

        if (
          error.message?.includes("not found")
        ) {
          return ctx.notFound(error.message);
        }

        ctx.throw(400, error.message);
      }
    },

    async unpublish(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized(
          "Authentication required"
        );
      }

      const { documentId } = ctx.params;

      try {
        const blog = await strapi
          .service(BLOG_UID)
          .unpublishBlog(
            user.id,
            documentId
          );

        return {
          data: blog,
        };
      } catch (error: any) {
        if (
          error.message?.includes("only manage") ||
          error.message?.includes("not allowed")
        ) {
          return ctx.forbidden(error.message);
        }

        if (
          error.message?.includes("not found")
        ) {
          return ctx.notFound(error.message);
        }

        ctx.throw(400, error.message);
      }
    },

    async manage(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized(
          "Authentication required"
        );
      }

      try {
        const blogs = await strapi
          .service(BLOG_UID)
          .findManageBlogs(user.id);

        return {
          data: blogs,
        };
      } catch (error: any) {
        if (
          error.message?.includes(
            "Only Admin and Content Manager"
          )
        ) {
          return ctx.forbidden(error.message);
        }

        ctx.throw(400, error.message);
      }
    },

  })
);