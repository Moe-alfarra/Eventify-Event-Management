import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import Tabs from "../../components/Tabs";
import StatCard from "../../components/StatCard";
import ConfirmModal from "../../components/ConfirmModal";
import EditProfileModal from "../../components/EditProfileModal";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import { useAuth } from "../../context/AuthContext";
import {
  getOrganizerDashboard,
  getOrganizerProfile,
  getMyEvents,
  getEventRegistrations,
  createEvent,
  updateEvent,
  publishEvent,
  cancelEvent,
  updateOrganizerProfile,
  changeOrganizerPassword,
} from "../../api/organizerApi";

const getErrorMessage = (err, fallback) => {
  return (
    err.response?.data?.message ||
    err.response?.data?.error ||
    (typeof err.response?.data === "string" ? err.response.data : null) ||
    fallback
  );
};

const EVENT_CATEGORIES = [
  "TECHNOLOGY",
  "BUSINESS",
  "EDUCATION",
  "HEALTH",
  "SPORTS",
  "ENTERTAINMENT",
  "SOCIAL",
  "OTHER",
];

const formatCategory = (cat) =>
  cat ? cat.charAt(0) + cat.slice(1).toLowerCase() : "-";

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");

  const [dashboardData, setDashboardData] = useState(null);
  const [events, setEvents] = useState([]);
  const [profile, setProfile] = useState(null);

  const [overviewLoading, setOverviewLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [profileActionLoading, setProfileActionLoading] = useState(false);

  const [overviewError, setOverviewError] = useState("");
  const [eventsError, setEventsError] = useState("");
  const [profileError, setProfileError] = useState("");

  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionType, setActionType] = useState("");

  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const [eventSearch, setEventSearch] = useState("");
  const [eventCategoryFilter, setEventCategoryFilter] = useState("ALL");
  const [eventStatusFilter, setEventStatusFilter] = useState("ALL");
  const [eventSort, setEventSort] = useState("DATE_ASC");

  const [registrationsModalOpen, setRegistrationsModalOpen] = useState(false);
  const [eventRegistrations, setEventRegistrations] = useState([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [registrationsError, setRegistrationsError] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    location: "",
    imageUrl: "",
    startTime: "",
    endTime: "",
    capacity: "",
    category: "TECHNOLOGY",
  });

  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    location: "",
    imageUrl: "",
    startTime: "",
    endTime: "",
    capacity: "",
    category: "TECHNOLOGY",
  });

  const tabs = useMemo(
    () => [
      { label: "Overview", value: "overview" },
      { label: "My Events", value: "events" },
      { label: "Create Event", value: "create" },
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

    if (activeTab === "profile" && !profile && !profileLoading) {
      fetchProfile();
    }
  }, [activeTab]);

  const fetchOverview = async () => {
    setOverviewLoading(true);
    setOverviewError("");

    try {
      const data = await getOrganizerDashboard();
      setDashboardData(data);
    } catch (err) {
      setOverviewError(getErrorMessage(err, "Failed to load dashboard data."));
    } finally {
      setOverviewLoading(false);
    }
  };

  const fetchEvents = async () => {
    setEventsLoading(true);
    setEventsError("");

    try {
      const data = await getMyEvents();
      setEvents(data);
    } catch (err) {
      setEventsError(getErrorMessage(err, "Failed to load your events."));
    } finally {
      setEventsLoading(false);
    }
  };

  const fetchProfile = async () => {
    setProfileLoading(true);
    setProfileError("");

    try {
      const data = await getOrganizerProfile();
      setProfile(data);
    } catch (err) {
      setProfileError(getErrorMessage(err, "Failed to load profile."));
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      const payload = {
        ...createForm,
        capacity: Number(createForm.capacity),
      };

      await createEvent(payload);
      toast.success("Event created successfully.");

      setCreateForm({
        title: "",
        description: "",
        location: "",
        imageUrl: "",
        startTime: "",
        endTime: "",
        capacity: "",
        category: "TECHNOLOGY",
      });

      await Promise.all([fetchOverview(), fetchEvents()]);
      setActiveTab("events");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to create event."));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleOpenPublishModal = (event) => {
    setSelectedEvent(event);
    setPublishModalOpen(true);
  };

  const handleClosePublishModal = () => {
    setSelectedEvent(null);
    setPublishModalOpen(false);
  };

  const handleOpenCancelModal = (event) => {
    setSelectedEvent(event);
    setCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    setSelectedEvent(null);
    setCancelModalOpen(false);
  };

  const handleConfirmPublish = async () => {
    if (!selectedEvent) return;

    setActionLoadingId(selectedEvent.eventId);
    setActionType("publish");

    try {
      await publishEvent(selectedEvent.eventId);
      toast.success(
        selectedEvent?.status === "CANCELLED"
          ? "Event republished successfully."
          : "Event published successfully."
      );
      await Promise.all([fetchOverview(), fetchEvents()]);
      handleClosePublishModal();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to publish event."));
    } finally {
      setActionLoadingId(null);
      setActionType("");
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedEvent) return;

    setActionLoadingId(selectedEvent.eventId);
    setActionType("cancel");

    try {
      await cancelEvent(selectedEvent.eventId);
      toast.success("Event cancelled successfully.");
      await Promise.all([fetchOverview(), fetchEvents()]);
      handleCloseCancelModal();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to cancel event."));
    } finally {
      setActionLoadingId(null);
      setActionType("");
    }
  };

  const handleOpenRegistrationsModal = async (event) => {
    setSelectedEvent(event);
    setRegistrationsModalOpen(true);
    setRegistrationsLoading(true);
    setRegistrationsError("");
    setEventRegistrations([]);

    try {
      const data = await getEventRegistrations(event.eventId);
      setEventRegistrations(data);
    } catch (err) {
      setRegistrationsError(getErrorMessage(err, "Failed to load registrations."));
    } finally {
      setRegistrationsLoading(false);
    }
  };

  const handleCloseRegistrationsModal = () => {
    setSelectedEvent(null);
    setRegistrationsModalOpen(false);
    setEventRegistrations([]);
    setRegistrationsError("");
  };

  const toDateTimeLocal = (value) => {
    if (!value) return "";
    const d = new Date(value);
    const pad = (n) => String(n).padStart(2, "0");

    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleOpenEditModal = (event) => {
    setSelectedEvent(event);
    setEditForm({
      title: event.title || "",
      description: event.description || "",
      location: event.location || "",
      imageUrl: event.imageUrl || "",
      startTime: toDateTimeLocal(event.startTime),
      endTime: toDateTimeLocal(event.endTime),
      capacity: event.capacity || "",
      category: event.category || "TECHNOLOGY",
    });
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setSelectedEvent(null);
    setEditModalOpen(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setEditLoading(true);

    try {
      const payload = {
        ...editForm,
        capacity: Number(editForm.capacity),
      };

      await updateEvent(selectedEvent.eventId, payload);
      toast.success("Event updated successfully.");
      await Promise.all([fetchOverview(), fetchEvents()]);
      handleCloseEditModal();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update event."));
    } finally {
      setEditLoading(false);
    }
  };

  const handleUpdateProfile = async (payload) => {
    setProfileActionLoading(true);

    try {
      await updateOrganizerProfile(payload);
      toast.success("Profile updated successfully. Please sign in again.");
      setEditProfileOpen(false);

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
      await changeOrganizerPassword(payload);
      toast.success("Password changed successfully. Please sign in again.");
      setChangePasswordOpen(false);

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

  return (
    <DashboardLayout>
      <div className="mb-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/10 backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-violet-300">
              Organizer Workspace
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Manage and grow your events
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
              Create events, monitor activity, and manage your event lifecycle from one place.
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
          <OrganizerOverviewTab
            loading={overviewLoading}
            error={overviewError}
            data={dashboardData}
          />
        )}

        {activeTab === "events" && (
          <OrganizerEventsTab
            loading={eventsLoading}
            error={eventsError}
            events={events}
            onPublish={handleOpenPublishModal}
            onCancel={handleOpenCancelModal}
            onEdit={handleOpenEditModal}
            onViewRegistrations={handleOpenRegistrationsModal}
            actionLoadingId={actionLoadingId}
            actionType={actionType}
            eventSearch={eventSearch}
            setEventSearch={setEventSearch}
            eventCategoryFilter={eventCategoryFilter}
            setEventCategoryFilter={setEventCategoryFilter}
            eventStatusFilter={eventStatusFilter}
            setEventStatusFilter={setEventStatusFilter}
            eventSort={eventSort}
            setEventSort={setEventSort}
          />
        )}

        {activeTab === "create" && (
          <CreateEventTab
            formData={createForm}
            onChange={handleCreateChange}
            onSubmit={handleCreateEvent}
            isLoading={createLoading}
          />
        )}

        {activeTab === "profile" && (
          <OrganizerProfileTab
            loading={profileLoading}
            error={profileError}
            profile={profile}
            onEditProfile={() => setEditProfileOpen(true)}
            onChangePassword={() => setChangePasswordOpen(true)}
          />
        )}
      </motion.div>

      <ConfirmModal
        isOpen={publishModalOpen}
        onClose={handleClosePublishModal}
        onConfirm={handleConfirmPublish}
        title={selectedEvent?.status === "CANCELLED" ? "Republish Event" : "Publish Event"}
        message={`Are you sure you want to ${
          selectedEvent?.status === "CANCELLED" ? "republish" : "publish"
        } "${selectedEvent?.title || "this event"}"?`}
        confirmText={selectedEvent?.status === "CANCELLED" ? "Republish" : "Publish"}
        cancelText="Cancel"
        isLoading={
          actionType === "publish" &&
          actionLoadingId === selectedEvent?.eventId
        }
        variant="primary"
      />

      <ConfirmModal
        isOpen={cancelModalOpen}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancel}
        title="Cancel Event"
        message={`Are you sure you want to cancel "${
          selectedEvent?.title || "this event"
        }"?

      All registered attendees will be automatically cancelled.`}
        confirmText="Cancel Event & Registrations"
        cancelText="Keep Event"
        isLoading={
          actionType === "cancel" &&
          actionLoadingId === selectedEvent?.eventId
        }
        variant="danger"
      />

      <EditProfileModal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        profile={profile}
        onSubmit={handleUpdateProfile}
        isLoading={profileActionLoading}
      />

      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        onSubmit={handleChangePassword}
        isLoading={profileActionLoading}
      />

      <OrganizerRegistrationsModal
        isOpen={registrationsModalOpen}
        onClose={handleCloseRegistrationsModal}
        event={selectedEvent}
        registrations={eventRegistrations}
        isLoading={registrationsLoading}
        error={registrationsError}
      />

      <EditEventModal
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        formData={editForm}
        onChange={handleEditChange}
        onSubmit={handleUpdateEvent}
        isLoading={editLoading}
      />
    </DashboardLayout>
  );
}

function OrganizerOverviewTab({ loading, error, data }) {
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]"
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
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Events" value={data?.totalEvents ?? 0} />
        <StatCard title="Published Events" value={data?.publishedEvents ?? 0} />
        <StatCard title="Draft Events" value={data?.draftEvents ?? 0} />
        <StatCard title="Total Registrations" value={data?.totalRegistrations ?? 0} />
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
        <h3 className="text-lg font-semibold text-white">Organizer Snapshot</h3>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SnapshotCard label="Cancelled Events" value={data?.cancelledEvents ?? 0} />
          <SnapshotCard label="Upcoming Events" value={data?.upcomingEvents ?? 0} />
          <SnapshotCard label="Active Registrations" value={data?.activeRegistrations ?? 0} />
        </div>
      </div>
    </div>
  );
}

function OrganizerEventsTab({
  loading,
  error,
  events,
  onPublish,
  onCancel,
  onEdit,
  onViewRegistrations,
  actionLoadingId,
  actionType,
  eventSearch,
  setEventSearch,
  eventCategoryFilter,
  setEventCategoryFilter,
  eventStatusFilter,
  setEventStatusFilter,
  eventSort,
  setEventSort,
}) {
  const categories = ["ALL", ...EVENT_CATEGORIES];
  const statuses = ["ALL", "DRAFT", "PUBLISHED", "CANCELLED"];

  const filteredEvents = [...(events || [])]
    .filter((event) => {
      const search = eventSearch.trim().toLowerCase();

      const matchesSearch =
        !search ||
        event.title?.toLowerCase().includes(search) ||
        event.location?.toLowerCase().includes(search) ||
        event.category?.toLowerCase().includes(search) ||
        event.status?.toLowerCase().includes(search);

      const matchesCategory =
        eventCategoryFilter === "ALL" || event.category === eventCategoryFilter;

      const matchesStatus =
        eventStatusFilter === "ALL" || event.status === eventStatusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      switch (eventSort) {
        case "DATE_DESC":
          return new Date(b.startTime) - new Date(a.startTime);
        case "CAPACITY_DESC":
          return (b.capacity ?? 0) - (a.capacity ?? 0);
        case "CAPACITY_ASC":
          return (a.capacity ?? 0) - (b.capacity ?? 0);
        case "DATE_ASC":
        default:
          return new Date(a.startTime) - new Date(b.startTime);
      }
    });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
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
        <div className="grid gap-4 lg:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Search
            </label>
            <input
              type="text"
              value={eventSearch}
              onChange={(e) => setEventSearch(e.target.value)}
              placeholder="Search title, location, status..."
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Category
            </label>
            <div className="relative">
              <select
                value={eventCategoryFilter}
                onChange={(e) => setEventCategoryFilter(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 pr-10 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "ALL" ? "All" : formatCategory(category)}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                ▼
              </span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Status
            </label>
            <div className="relative">
              <select
                value={eventStatusFilter}
                onChange={(e) => setEventStatusFilter(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 pr-10 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status === "ALL" ? "All" : status}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                ▼
              </span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Sort By
            </label>
            <div className="relative">
              <select
                value={eventSort}
                onChange={(e) => setEventSort(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 pr-10 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
              >
                <option value="DATE_ASC">Date: Nearest First</option>
                <option value="DATE_DESC">Date: Latest First</option>
                <option value="CAPACITY_DESC">Capacity: High to Low</option>
                <option value="CAPACITY_ASC">Capacity: Low to High</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                ▼
              </span>
            </div>
          </div>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-sm text-slate-400">
          No events match your search or filters.
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {filteredEvents.map((event) => {
            const isPublishing =
              actionType === "publish" && actionLoadingId === event.eventId;
            const isCancelling =
              actionType === "cancel" && actionLoadingId === event.eventId;

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
                        {formatCategory(event.category)}
                      </span>

                      <h3 className="mt-3 text-xl font-semibold text-white">
                        {event.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">{event.location}</p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        event.status === "PUBLISHED"
                          ? "border border-emerald-500/20 bg-emerald-500/15 text-emerald-300"
                          : event.status === "CANCELLED"
                          ? "border border-red-500/20 bg-red-500/15 text-red-300"
                          : "border border-amber-500/20 bg-amber-500/15 text-amber-300"
                      }`}
                    >
                      {event.status}
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
                      <span className="text-slate-500">Capacity:</span>{" "}
                      {event.capacity}
                    </div>
                    <div>
                      <span className="text-slate-500">Seats Left:</span>{" "}
                      {event.availableSeats}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => onViewRegistrations(event)}
                      className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] hover:text-white"
                    >
                      View Registrations
                    </button>

                    {event.status !== "CANCELLED" && (
                      <button
                        onClick={() => onEdit(event)}
                        className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] hover:text-white"
                      >
                        Edit
                      </button>
                    )}

                    {event.status !== "PUBLISHED" &&
                      new Date(event.startTime) > new Date() && (
                        <button
                          onClick={() => onPublish(event)}
                          disabled={isPublishing}
                          className="inline-flex items-center justify-center rounded-2xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isPublishing
                            ? event.status === "CANCELLED"
                              ? "Republishing..."
                              : "Publishing..."
                            : event.status === "CANCELLED"
                            ? "Republish"
                            : "Publish"}
                        </button>
                    )}

                    {event.status !== "CANCELLED" && (
                      <button
                        onClick={() => onCancel(event)}
                        disabled={isCancelling}
                        className="inline-flex items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isCancelling ? "Cancelling..." : "Cancel"}
                      </button>
                    )}
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

function OrganizerRegistrationsModal({
  isOpen,
  onClose,
  event,
  registrations,
  isLoading,
  error,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-white">
              Event Registrations
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {event?.title || "Selected event"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-16 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]"
                />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          ) : registrations.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-sm text-slate-400">
              No registrations found for this event.
            </div>
          ) : (
            <div className="space-y-3">
              {registrations.map((registration) => (
                <div
                  key={registration.registrationId}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {registration.attendeeName}
                      </h4>
                      <p className="mt-1 text-xs text-slate-400">
                            {registration.attendeeEmail}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Attendee ID: {registration.attendeeId}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        registration.status === "REGISTERED"
                          ? "border border-emerald-500/20 bg-emerald-500/15 text-emerald-300"
                          : "border border-red-500/20 bg-red-500/15 text-red-300"
                      }`}
                    >
                      {registration.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EditEventModal({
  isOpen,
  onClose,
  formData,
  onChange,
  onSubmit,
  isLoading,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-white">Edit Event</h3>
            <p className="mt-1 text-sm text-slate-400">
              Update your event details below.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] hover:text-white"
          >
            Close
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={onChange}
              required
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onChange}
              required
              rows={4}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={onChange}
              required
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Image URL
            </label>
            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={onChange}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Start Time
            </label>
            <input
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={onChange}
              required
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              End Time
            </label>
            <input
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={onChange}
              required
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Capacity
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={onChange}
              required
              min="1"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Category
            </label>

            <div className="relative">
              <select
                name="category"
                value={formData.category}
                onChange={onChange}
                className="w-full appearance-none rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 pr-10 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
              >
                {EVENT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {formatCategory(category)}
                  </option>
                ))}
              </select>

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                ▼
              </span>
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateEventTab({ formData, onChange, onSubmit, isLoading }) {
  return (
    <div className="max-w-4xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/10 backdrop-blur-xl">
      <h3 className="text-2xl font-bold text-white">Create Event</h3>
      <p className="mt-2 text-sm text-slate-400">
        Fill in the details below to create a new event.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={onChange}
            required
            className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={onChange}
            required
            rows={4}
            className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={onChange}
            required
            className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Image URL
          </label>
          <input
            type="text"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={onChange}
            className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Start Time
          </label>
          <input
            type="datetime-local"
            name="startTime"
            value={formData.startTime}
            onChange={onChange}
            required
            className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">
            End Time
          </label>
          <input
            type="datetime-local"
            name="endTime"
            value={formData.endTime}
            onChange={onChange}
            required
            className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Capacity
          </label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={onChange}
            required
            min="1"
            className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Category
          </label>

          <div className="relative">
            <select
              name="category"
              value={formData.category}
              onChange={onChange}
              className="w-full appearance-none rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 pr-10 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
            >
              {EVENT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {formatCategory(category)}
                </option>
              ))}
            </select>

            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              ▼
            </span>
          </div>
        </div>

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Creating..." : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
}

function OrganizerProfileTab({
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

  if (!profile) return null;

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

function SnapshotCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/[0.04] p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
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