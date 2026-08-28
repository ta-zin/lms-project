export const getAuthenticatedUserId = (ctx: any): number => {
  const user = ctx.state.user;

  if (!user) {
    return 0;
  }

  return user.id;
};

export const isAdmin = (ctx: any): boolean => {
  return ctx.state.user?.role?.type === "admin";
};

export const isInstructor = (ctx: any): boolean => {
  return ctx.state.user?.role?.name === "Instructor";
};

export const isStudent = (ctx: any): boolean => {
  return ctx.state.user?.role?.name === "Student";
};