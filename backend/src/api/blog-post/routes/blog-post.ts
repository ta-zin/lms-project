export default {
  routes: [

    {
      method: "GET",
      path: "/blog-posts/manage",
      handler: "blog-post.manage",
      config: {
        policies: [
          "api::blog-post.blog-manager",
        ],
      },
    },

    {
      method: "GET",
      path: "/blog-posts",
      handler: "blog-post.find",
      config: {
        auth: false,
      },
    },

    {
      method: "GET",
      path: "/blog-posts/:documentId",
      handler: "blog-post.findOne",
      config: {
        auth: false,
      },
    },

    {
      method: "POST",
      path: "/blog-posts",
      handler: "blog-post.create",
      config: {
        policies: [
          "api::blog-post.blog-manager",
        ],
      },
    },

    {
      method: "PUT",
      path: "/blog-posts/:documentId",
      handler: "blog-post.update",
      config: {
        policies: [
          "api::blog-post.blog-manager",
        ],
      },
    },

    {
      method: "DELETE",
      path: "/blog-posts/:documentId",
      handler: "blog-post.delete",
      config: {
        policies: [
          "api::blog-post.blog-manager",
        ],
      },
    },

    {
      method: "POST",
      path: "/blog-posts/:documentId/publish",
      handler: "blog-post.publish",
      config: {
        policies: [
          "api::blog-post.blog-manager",
        ],
      },
    },

    {
      method: "POST",
      path: "/blog-posts/:documentId/unpublish",
      handler: "blog-post.unpublish",
      config: {
        policies: [
          "api::blog-post.blog-manager",
        ],
      },
    },

  ],
};