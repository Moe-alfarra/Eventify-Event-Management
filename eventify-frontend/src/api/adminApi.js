import api from "./axios";

export const getAdminDashboard = async () => {
  const response = await api.get("/admin/dashboard");
  return response.data;
};

export const getAdminProfile = async () => {
  const response = await api.get("/admin/profile");
  return response.data;
};

export const updateAdminProfile = async (payload) => {
  const response = await api.patch("/admin/profile", payload);
  return response.data;
};

export const changeAdminPassword = async (payload) => {
  const response = await api.patch("/admin/profile/password", payload);
  return response.data;
};

export const createUser = async (payload) => {
  const response = await api.post("/admin/users", payload);
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data;
};

export const getAdminEvents = async () => {
  const response = await api.get("/admin/events");
  return response.data;
};

export const getAdminEventRegistrations = async (eventId) => {
  const response = await api.get(`/admin/events/${eventId}/registrations`);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

export const deleteEvent = async (eventId) => {
  const response = await api.delete(`/admin/events/${eventId}`);
  return response.data;
};

export const deleteRegistration = async (registrationId) => {
  const response = await api.delete(`/admin/registrations/${registrationId}`);
  return response.data;
};