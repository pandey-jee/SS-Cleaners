// Admin configuration
export const ADMIN_EMAIL = "pandeyji252002@gmail.com";

// Check if a user is admin by email
export const isAdminUser = (email: string | undefined): boolean => {
  return email === ADMIN_EMAIL;
};
