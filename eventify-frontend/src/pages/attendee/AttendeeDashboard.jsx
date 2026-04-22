import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/StatCard";
import Tabs from "../../components/Tabs";
import EditProfileModal from "../../components/EditProfileModal";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import EventDetailsModal from "../../components/EventDetailsModal";
import ConfirmModal from "../../components/ConfirmModal";
import {
  getAttendeeDashboard,
  getAttendeeProfile,
  getEvents,
  getMyRegistrations,
  registerForEvent,
  cancelRegistration,
  updateAttendeeProfile,
  changeAttendeePassword,
} from "../../api/attendeeApi";

export default function AttendeeDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [profile, setProfile] = useState(null);

  const [overviewLoading, setOverviewLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const [overviewError, setOverviewError] = useState("");
  const [eventsError, setEventsError] = useState("");
  const [registrationsError, setRegistrationsError] = useState("");
  const [profileError, setProfileError] = useState("");

  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionType, setActionType] = useState("");

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);


  const [eventSearch, setEventSearch] = useState("");
  const [eventCategoryFilter, setEventCategoryFilter] = useState("ALL");
  const [eventSort, setEventSort] = useState("DATE_ASC");

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [profileActionLoading, setProfileActionLoading] = useState(false);


  const tabs = useMemo(
    () => [
      { label: "Overview", value: "overview" },
      { label: "Events", value: "events" },
      { label: "My Registrations", value: "registrations" },
      { label: "Profile", value: "profile" },
    ],
    []
  );

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (activeTab === "events" && events.length === 0 && !eventsLoading) {
      fetchEvents();
    }

    if (
      activeTab === "registrations" &&
      registrations.length === 0 &&
      !registrationsLoading
    ) {
      fetchRegistrations();
    }

    if (activeTab === "profile" && !profile && !profileLoading) {
      fetchProfile();
    }
  }, [activeTab]);

  const handleOpenEditProfile = () => setEditProfileOpen(true);
  const handleCloseEditProfile = () => setEditProfileOpen(false);

  const handleOpenChangePassword = () => setChangePasswordOpen(true);
  const handleCloseChangePassword = () => setChangePasswordOpen(false);

  const getErrorMessage = (err, fallback) => {
    return (
      err.response?.data?.message ||
      err.response?.data?.error ||
      (typeof err.response?.data === "string" ? err.response.data : null) ||
      fallback
    );
  };

  const handleUpdateProfile = async (payload) => {
    setProfileActionLoading(true);

    try {
      await updateAttendeeProfile(payload);

      toast.success("Profile updated successfully. Please sign in again.");

      handleCloseEditProfile();

      // 🔥 IMPORTANT: delay slightly so toast shows
      setTimeout(() => {
        logout();
        navigate("/login", { replace: true });
      }, 1000);

    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update profile."));
    } finally {
      setProfileActionLoading(false);
    }
  };

  const handleChangePassword = async (payload) => {
    setProfileActionLoading(true);

    try {
      await changeAttendeePassword(payload);

      toast.success("Password changed successfully. Please sign in again.");
      handleCloseChangePassword();

      setTimeout(() => {
        logout();
        navigate("/login", { replace: true });
      }, 1000);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to change password."));
    } finally {
      setProfileActionLoading(false);
    }
  };

  const fetchOverview = async () => {
    setOverviewLoading(true);
    setOverviewError("");

    try {
      const data = await getAttendeeDashboard();
      setDashboardData(data);
    } catch (err) {
      setOverviewError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to load dashboard data."
      );
    } finally {
      setOverviewLoading(false);
    }
  };

  const fetchEvents = async () => {
    setEventsLoading(true);
    setEventsError("");

    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      setEventsError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to load events."
      );
    } finally {
      setEventsLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    setRegistrationsLoading(true);
    setRegistrationsError("");

    try {
      const data = await getMyRegistrations();
      setRegistrations(data);
    } catch (err) {
      setRegistrationsError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to load registrations."
      );
    } finally {
      setRegistrationsLoading(false);
    }
  };

  const fetchProfile = async () => {
    setProfileLoading(true);
    setProfileError("");

    try {
      const data = await getAttendeeProfile();
      setProfile(data);
    } catch (err) {
      setProfileError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to load profile."
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handleOpenDetails = (event) => {
    setSelectedEvent(event);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setSelectedEvent(null);
    setIsDetailsOpen(false);
  };

  const handleRegister = async (eventId) => {
    setActionLoadingId(eventId);
    setActionType("register");

    try {
      await registerForEvent(eventId);
      toast.success("Successfully registered for the event.");

      await Promise.all([fetchOverview(), fetchEvents(), fetchRegistrations()]);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to register for event."
      );
    } finally {
      setActionLoadingId(null);
      setActionType("");
    }
  };

  const handleConfirmCancelRegistration = async () => {
    if (!selectedRegistration) return;

    const registrationId = selectedRegistration.registrationId;

    setActionLoadingId(registrationId);
    setActionType("cancel");

    try {
      await cancelRegistration(registrationId);
      toast.success("Registration cancelled successfully.");

      await Promise.all([fetchOverview(), fetchEvents(), fetchRegistrations()]);
      handleCloseCancelModal();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to cancel registration."
      );
    } finally {
      setActionLoadingId(null);
      setActionType("");
    }
  };

  const handleOpenCancelModal = (registration) => {
    setSelectedRegistration(registration);
    setCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    setSelectedRegistration(null);
    setCancelModalOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="mb-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/10 backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-violet-300">
              Attendee Workspace
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Discover and manage your events
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
              Browse upcoming experiences, register in seconds, and keep all your event activity in one clean space.
            </p>
          </div>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {activeTab === "overview" && (
          <OverviewTab
            loading={overviewLoading}
            error={overviewError}
            data={dashboardData}
          />
        )}

        {activeTab === "events" && (
         <EventsTab
           loading={eventsLoading}
           error={eventsError}
           events={events}
           registrations={registrations}
           onRegister={handleRegister}
           onViewDetails={handleOpenDetails}
           actionLoadingId={actionLoadingId}
           actionType={actionType}
           eventSearch={eventSearch}
           setEventSearch={setEventSearch}
           eventCategoryFilter={eventCategoryFilter}
           setEventCategoryFilter={setEventCategoryFilter}
           eventSort={eventSort}
           setEventSort={setEventSort}
         />
        )}

        {activeTab === "registrations" && (
          <RegistrationsTab
            loading={registrationsLoading}
            error={registrationsError}
            registrations={registrations}
            onCancel={handleOpenCancelModal}
            actionLoadingId={actionLoadingId}
            actionType={actionType}
          />
        )}

        {activeTab === "profile" && (
           <ProfileTab
             loading={profileLoading}
             error={profileError}
             profile={profile}
             onEditProfile={handleOpenEditProfile}
             onChangePassword={handleOpenChangePassword}
           />
         )}
      </motion.div>

      <EventDetailsModal
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        event={selectedEvent}
        onRegister={handleRegister}
        isRegistering={
          actionType === "register" && actionLoadingId === selectedEvent?.eventId
        }
        isRegistered={(registrations || []).some(
          (r) =>
            r.eventId === selectedEvent?.eventId &&
            r.status === "REGISTERED"
        )}
      />

      <ConfirmModal
        isOpen={cancelModalOpen}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancelRegistration}
        title="Cancel Registration"
        message={`Are you sure you want to cancel your registration for "${
          selectedRegistration?.eventTitle || selectedRegistration?.eventName || "this event"
        }"?`}
        confirmText="Yes, Cancel"
        cancelText="Keep Registration"
        isLoading={
          actionType === "cancel" &&
          actionLoadingId === selectedRegistration?.registrationId
        }
        variant="danger"
      />

      <EditProfileModal
        isOpen={editProfileOpen}
        onClose={handleCloseEditProfile}
        profile={profile}
        onSubmit={handleUpdateProfile}
        isLoading={profileActionLoading}
      />

      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={handleCloseChangePassword}
        onSubmit={handleChangePassword}
        isLoading={profileActionLoading}
      />
    </DashboardLayout>
  );
}

function OverviewTab({ loading, error, data }) {
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-3xl border border-white/10 bg-white/5"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total Registrations" value={data?.totalRegistrations ?? 0} />
        <StatCard title="Active" value={data?.activeRegistrations ?? 0} />
        <StatCard title="Cancelled" value={data?.cancelledRegistrations ?? 0} />
        <StatCard title="Upcoming" value={data?.upcomingEvents ?? 0} />
        <StatCard title="Past" value={data?.pastEvents ?? 0} />
      </div>

      {/* Snapshot Section */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
        <h3 className="text-lg font-semibold text-white">
          Your Event Activity
        </h3>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-sm text-slate-400">Active Registrations</p>
            <p className="mt-1 text-xl font-semibold text-white">
              {data?.activeRegistrations ?? 0}
            </p>
          </div>

          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-sm text-slate-400">Upcoming Events</p>
            <p className="mt-1 text-xl font-semibold text-white">
              {data?.upcomingEvents ?? 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventsTab({
  loading,
  error,
  events,
  registrations,
  onRegister,
  onViewDetails,
  actionLoadingId,
  actionType,
  eventSearch,
  setEventSearch,
  eventCategoryFilter,
  setEventCategoryFilter,
  eventSort,
  setEventSort,
}) {
  const categories = [
    "ALL",
    "TECHNOLOGY",
    "BUSINESS",
    "EDUCATION",
    "HEALTH",
    "SPORTS",
    "ENTERTAINMENT",
    "SOCIAL",
    "OTHER",
  ];

  const filteredEvents = [...events]
    .filter((event) => {
      const search = eventSearch.trim().toLowerCase();

      const matchesSearch =
        !search ||
        event.title?.toLowerCase().includes(search) ||
        event.location?.toLowerCase().includes(search) ||
        event.category?.toLowerCase().includes(search) ||
        event.organizerName?.toLowerCase().includes(search);

      const matchesCategory =
        eventCategoryFilter === "ALL" || event.category === eventCategoryFilter;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (eventSort) {
        case "DATE_DESC":
          return new Date(b.startTime) - new Date(a.startTime);
        case "SEATS_DESC":
          return (b.availableSeats ?? 0) - (a.availableSeats ?? 0);
        case "SEATS_ASC":
          return (a.availableSeats ?? 0) - (b.availableSeats ?? 0);
        case "DATE_ASC":
        default:
          return new Date(a.startTime) - new Date(b.startTime);
      }
    });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-14 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]"
            />
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
              Search
            </label>
            <input
              type="text"
              value={eventSearch}
              onChange={(e) => setEventSearch(e.target.value)}
              placeholder="Search title, location, category..."
              className="w-full rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
              Category
            </label>
            <div className="relative">
              <select
                value={eventCategoryFilter}
                onChange={(e) => setEventCategoryFilter(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                ▼
              </span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
              Sort By
            </label>
            <select
              value={eventSort}
              onChange={(e) => setEventSort(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
            >
              <option value="DATE_ASC">Date: Nearest First</option>
              <option value="DATE_DESC">Date: Latest First</option>
              <option value="SEATS_DESC">Seats: High → Low</option>
              <option value="SEATS_ASC">Seats: Low → High</option>
            </select>
          </div>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-sm text-slate-400">
          No events match your current search or filters.
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {filteredEvents.map((event) => {
            const isRegistering =
              actionType === "register" && actionLoadingId === event.eventId;

            const isRegistered = (registrations || []).some(
              (r) => r.eventId === event.eventId && r.status === "REGISTERED"
            );

            const isFull = event.availableSeats <= 0;

            return (
              <div
                key={event.eventId}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-lg backdrop-blur-xl transition hover:border-violet-500/30 hover:bg-white/[0.06]"
              >
                {event.imageUrl ? (
                  <div className="h-48 w-full overflow-hidden">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="h-40 bg-gradient-to-r from-violet-700 via-fuchsia-600 to-indigo-700" />
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex rounded-full bg-violet-500/15 px-3 py-1 text-xs font-medium text-violet-300">
                        {event.category}
                      </span>

                      <h3 className="mt-3 text-xl font-semibold text-white">
                        {event.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">{event.location}</p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        isFull
                          ? "bg-red-500/15 text-red-300 border border-red-500/20"
                          : "bg-white/[0.04] text-slate-300 border border-white/10"
                      }`}
                    >
                      {isFull ? "Full" : `${event.availableSeats} left`}
                    </span>
                  </div>

                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-300">
                    {event.description}
                  </p>

                  <div className="mt-5 grid gap-2 text-sm text-slate-400 sm:grid-cols-2">
                    <div>
                      <span className="text-slate-500">Starts:</span>{" "}
                      {formatDateTime(event.startTime)}
                    </div>
                    <div>
                      <span className="text-slate-500">Ends:</span>{" "}
                      {formatDateTime(event.endTime)}
                    </div>
                    <div>
                      <span className="text-slate-500">Organizer:</span>{" "}
                      {event.organizerName}
                    </div>
                    <div>
                      <span className="text-slate-500">Status:</span> {event.status}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => onViewDetails(event)}
                      className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] hover:text-white"
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => onRegister(event.eventId)}
                      disabled={isRegistering || isFull || isRegistered}
                      className={`inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold text-white transition shadow-lg disabled:cursor-not-allowed disabled:opacity-60 ${
                        isRegistered
                          ? "bg-emerald-600"
                          : "bg-violet-600 hover:-translate-y-0.5 hover:bg-violet-500"
                      }`}
                    >
                      {isRegistered
                        ? "Registered"
                        : isRegistering
                        ? "Registering..."
                        : isFull
                        ? "Event Full"
                        : "Register"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


function RegistrationsTab({
  loading,
  error,
  registrations,
  onCancel,
  actionLoadingId,
  actionType,
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-3xl border border-white/10 bg-white/5"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
        {error}
      </div>
    );
  }

  const active = registrations.filter(r => r.status === "REGISTERED");
  const cancelled = registrations.filter(r => r.status === "CANCELLED");

  return (
    <div className="space-y-8">
      {/* Active */}
      <Section title="Active Registrations">
        {active.length === 0 ? (
          <EmptyState text="No active registrations." />
        ) : (
          active.map((registration) => {
            const isCancelling =
              actionType === "cancel" &&
              actionLoadingId === registration.registrationId;

            return (
              <RegistrationCard
                key={registration.registrationId}
                registration={registration}
                isCancelling={isCancelling}
                onCancel={onCancel}
              />
            );
          })
        )}
      </Section>


      <Section title="Cancelled Registrations">
        {cancelled.length === 0 ? (
          <EmptyState text="No cancelled registrations." />
        ) : (
          cancelled.map((registration) => (
            <RegistrationCard
              key={registration.registrationId}
              registration={registration}
              disabled
            />
          ))
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold text-white">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-sm text-slate-400">
      {text}
    </div>
  );
}

function RegistrationCard({ registration, isCancelling, onCancel, disabled }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {registration.eventName}
          </h3>
          <p className="text-sm text-slate-400">{registration.location}</p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs ${
            registration.status === "REGISTERED"
              ? "bg-emerald-500/15 text-emerald-300"
              : "bg-red-500/15 text-red-300"
          }`}
        >
          {registration.status}
        </span>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-slate-400">
          {formatDateTime(registration.startTime)}
        </div>

        {!disabled && (
          <button
            onClick={() => onCancel(registration)}
            disabled={isCancelling}
            className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300 hover:bg-red-500/20"
          >
            {isCancelling ? "Cancelling..." : "Cancel"}
          </button>
        )}
      </div>
    </div>
  );
}
function ProfileTab({
  loading,
  error,
  profile,
  onEditProfile,
  onChangePassword,
}) {
  if (loading) {
    return (
      <div className="h-72 animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]" />
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
        {error}
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/10 backdrop-blur-xl">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 text-2xl font-bold text-white shadow-lg shadow-violet-900/30">
          {profile.name?.charAt(0)?.toUpperCase() || "U"}
        </div>

        <div className="flex-1">
          <div className="inline-flex rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-violet-300">
            Account Overview
          </div>

          <h3 className="mt-4 text-2xl font-bold tracking-tight text-white">
            {profile.name}
          </h3>
          <p className="mt-1 text-sm text-slate-400">{profile.email}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <InfoCard label="Email" value={profile.email} />
        <InfoCard label="Role" value={profile.role} />
        <InfoCard label="Password" value="••••••••" />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={onChangePassword}
          className="inline-flex items-center justify-center rounded-2xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:bg-violet-500"
        >
          Change Password
        </button>

        <button
          onClick={onEditProfile}
          className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] hover:text-white"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}