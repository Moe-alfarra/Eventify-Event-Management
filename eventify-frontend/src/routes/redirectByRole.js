export const getDashboardRouteByRole = (role) => {
  switch (role) {
    case "ATTENDEE":
      return "/attendee/dashboard";
    case "ORGANIZER":
      return "/organizer/dashboard";
    case "ADMIN":
      return "/admin/dashboard";
    default:
      return "/login";
  }
};