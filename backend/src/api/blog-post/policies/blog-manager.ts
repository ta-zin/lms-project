// src/api/blog-post/policies/blog-manager.ts

export default async (policyContext: any) => {
  const user = policyContext.state.user;

  if (!user) {
    return false;
  }

  const roleName = user.role?.name?.toLowerCase();

  if (roleName === "admin" || roleName === "content manager") {
    return true;
  }

  return false;
};