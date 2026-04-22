export const getStoredToken = () => localStorage.getItem("token");

export const getStoredRole = () => localStorage.getItem("role");

export const getStoredUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user");
};