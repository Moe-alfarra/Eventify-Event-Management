import api from "./axios";

export const getAttendeeDashboard = async () => {
  const response = await api.get("/attendee/dashboard");
  return response.data;
};

export const getAttendeeProfile = async () => {
  const response = await api.get("/attendee/profile");
  return response.data;
};

export const getEvents = async () => {
  const response = await api.get("/attendee/events");
  return response.data;
};

export const getEventById = async (eventId) => {
  const response = await api.get(`/attendee/events/${eventId}`);
  return response.data;
};

export const getEventsByCategory = async (category) => {
  const response = await api.get(`/attendee/events/category/${category}`);
  return response.data;
};

export const getMyRegistrations = async () => {
  const response = await api.get("/attendee/registrations");
  return response.data;
};

export const registerForEvent = async (eventId) => {
  const response = await api.post(`/attendee/events/${eventId}/register`);
  return response.data;
};

export const cancelRegistration = async (registrationId) => {
  const response = await api.patch(`/attendee/registrations/${registrationId}/cancel`);
  return response.data;
};

export const updateAttendeeProfile = async (payload) => {
  const response = await api.patch("/attendee/profile", payload);
  return response.data;
};

export const changeAttendeePassword = async (payload) => {
  const response = await api.patch("/attendee/profile/password", payload);
  return response.data;
};