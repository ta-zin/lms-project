export default async (policyContext: any) => {
  const user = policyContext.state.user;

  if (!user) {
    return false;
  }

  if (user.role?.type === "admin") {
    return true;
  }

  return user.role?.name === "Student";
};