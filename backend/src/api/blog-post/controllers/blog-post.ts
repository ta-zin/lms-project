import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::blog-post.blog-post",
  ({ strapi }) => ({
    async find(ctx) {
      ctx.query = {
        ...ctx.query,
        filters: {
          ...(ctx.query.filters || {}),
          curr_status: {
            $eq: "published",
          },
        },
      };

      return await super.find(ctx);
    },

    async findOne(ctx) {
      const { id } = ctx.params;

      const entity = await strapi.entityService.findOne(
        "api::blog-post.blog-post",
        id
      );

      if (!entity || entity.curr_status !== "published") {
        return ctx.notFound("Blog post not found");
      }

      return await super.findOne(ctx);
    },
  })
);