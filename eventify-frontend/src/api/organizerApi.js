import api from "./axios";

export const getOrganizerDashboard = async () => {
  const response = await api.get("/organizer/dashboard");
  return response.data;
};

export const getOrganizerProfile = async () => {
  const response = await api.get("/organizer/profile");
  return response.data;
};

export const getMyEvents = async () => {
  const response = await api.get("/organizer/events");
  return response.data;
};

export const getEventRegistrations = async (eventId) => {
  const response = await api.get(`/organizer/events/${eventId}/registrations`);
  return response.data;
};

export const createEvent = async (payload) => {
  const response = await api.post("/organizer/events", payload);
  return response.data;
};

export const updateEvent = async (eventId, payload) => {
  const response = await api.patch(`/organizer/events/${eventId}`, payload);
  return response.data;
};

export const publishEvent = async (eventId) => {
  const response = await api.patch(`/organizer/events/${eventId}/publish`);
  return response.data;
};

export const cancelEvent = async (eventId) => {
  const response = await api.patch(`/organizer/events/${eventId}/cancel`);
  return response.data;
};

export const updateOrganizerProfile = async (payload) => {
  const response = await api.patch("/organizer/profile", payload);
  return response.data;
};

export const changeOrganizerPassword = async (payload) => {
  const response = await api.patch("/organizer/profile/password", payload);
  return response.data;
};