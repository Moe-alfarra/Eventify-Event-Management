import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import Tabs from "../../components/Tabs";
import StatCard from "../../components/StatCard";
import ConfirmModal from "../../components/ConfirmModal";
import EditProfileModal from "../../components/EditProfileModal";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import CreateUserModal from "../../components/CreateUserModal";
import { useAuth } from "../../context/AuthContext";
import {
  getAdminDashboard,
  getAdminProfile,
  getUsers,
  getAdminEvents,
  getAdminEventRegistrations,
  deleteUser,
  deleteEvent,
  deleteRegistration,
  createUser,
  updateAdminProfile,
  changeAdminPassword,
} from "../../api/adminApi";
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
const getErrorMessage = (err, fallback) =>
  err.response?.data?.message ||
  err.response?.data?.error ||
  (typeof err.response?.data === "string" ? err.response.data : null) ||
  fallback;

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");

  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [profile, setProfile] = useState(null);

  const [selected, setSelected] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState("");

  const [loadingId, setLoadingId] = useState(null);

  const [createUserModal, setCreateUserModal] = useState(false);

  const [createUserLoading, setCreateUserLoading] = useState(false);

  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [userSort, setUserSort] = useState("NAME_ASC");

  const [registrationsModalOpen, setRegistrationsModalOpen] = useState(false);
  const [eventRegistrations, setEventRegistrations] = useState([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [registrationsError, setRegistrationsError] = useState("");

  const [eventSearch, setEventSearch] = useState("");
  const [eventCategoryFilter, setEventCategoryFilter] = useState("ALL");
  const [eventStatusFilter, setEventStatusFilter] = useState("ALL");
  const [eventSort, setEventSort] = useState("DATE_ASC");

  const navigate = useNavigate();

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [profileActionLoading, setProfileActionLoading] = useState(false);


  const tabs = useMemo(
    () => [
      { label: "Overview", value: "overview" },
      { label: "Users", value: "users" },
      { label: "Events", value: "events" },
      { label: "Profile", value: "profile" },
    ],
    []
  );

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    if (activeTab === "events") fetchEvents();
    if (activeTab === "profile") fetchProfile();
  }, [activeTab]);

  const fetchDashboard = async () => {
    try {
      setDashboard(await getAdminDashboard());
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load dashboard"));
    }
  };

  const fetchUsers = async () => {
    try {
      setUsers(await getUsers());
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load users"));
    }
  };

  const fetchEvents = async () => {
    try {
      setEvents(await getAdminEvents());
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load events"));
    }
  };

  const fetchProfile = async () => {
    try {
      setProfile(await getAdminProfile());
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load profile"));
    }
  };

  const handleCreateUser = async (data) => {
    setCreateUserLoading(true);

    try {
      await createUser(data);
      toast.success("User created successfully");
      setCreateUserModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to create user"));
    } finally {
      setCreateUserLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;

    setLoadingId(selected.id);

    try {
      if (confirmType === "user") {
        await deleteUser(selected.userId);
        toast.success("User deleted");
        fetchUsers();
      }

      if (confirmType === "event") {
        await deleteEvent(selected.eventId);
        toast.success("Event deleted");
        fetchEvents();
      }

      if (confirmType === "registration") {
        await deleteRegistration(selected.registrationId);
        toast.success("Registration deleted");
      }

      setConfirmOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Action failed"));
    } finally {
      setLoadingId(null);
    }
  };

  const handleOpenRegistrationsModal = async (event) => {
    setSelected(event);
    setRegistrationsModalOpen(true);
    setRegistrationsLoading(true);
    setRegistrationsError("");

    try {
      const data = await getAdminEventRegistrations(event.eventId);
      setEventRegistrations(data);
    } catch (err) {
      setRegistrationsError(getErrorMessage(err, "Failed to load registrations"));
    } finally {
      setRegistrationsLoading(false);
    }
  };

  const handleCloseRegistrationsModal = () => {
    setRegistrationsModalOpen(false);
    setSelected(null);
    setEventRegistrations([]);
    setRegistrationsError("");
  };

  const handleDeleteRegistration = async (registration) => {
    try {
      await deleteRegistration(registration.registrationId);
      toast.success("Registration deleted");

      setEventRegistrations((prev) =>
        prev.filter((r) => r.registrationId !== registration.registrationId)
      );
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete registration"));
    }
  };

  const handleUpdateProfile = async (payload) => {
    setProfileActionLoading(true);

    try {
      await updateAdminProfile(payload);
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
      await changeAdminPassword(payload);
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
              Admin Workspace
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Manage users, events, and platform activity
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
              Manage accounts, monitor events, review registrations, and keep the platform organized from one place.
            </p>
          </div>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <motion.div
        key={activeTab}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {activeTab === "overview" && dashboard && (
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              <StatCard title="Total Users" value={dashboard.totalUsers} />
              <StatCard title="Total Events" value={dashboard.totalEvents} />
              <StatCard title="Total Registrations" value={dashboard.totalRegistrations} />
              <StatCard title="Attendees" value={dashboard.totalAttendees} />
              <StatCard title="Organizers" value={dashboard.totalOrganizers} />
              <StatCard title="Admins" value={dashboard.totalAdmins} />
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <AdminUsersTab
            users={users}
            currentUser={user}
            userSearch={userSearch}
            setUserSearch={setUserSearch}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            userSort={userSort}
            setUserSort={setUserSort}
            onDelete={(user) => {
              setSelected(user);
              setConfirmType("user");
              setConfirmOpen(true);
            }}
            onCreateUser={() => setCreateUserModal(true)}
          />
        )}

        {activeTab === "events" && (
          <AdminEventsTab
            events={events}
            eventSearch={eventSearch}
            setEventSearch={setEventSearch}
            eventCategoryFilter={eventCategoryFilter}
            setEventCategoryFilter={setEventCategoryFilter}
            eventStatusFilter={eventStatusFilter}
            setEventStatusFilter={setEventStatusFilter}
            eventSort={eventSort}
            setEventSort={setEventSort}
            onViewRegistrations={handleOpenRegistrationsModal}
            onDelete={(event) => {
              setSelected(event);
              setConfirmType("event");
              setConfirmOpen(true);
            }}
          />
        )}

        {activeTab === "profile" && (
          <AdminProfileTab
            loading={!profile}
            error={null}
            profile={profile}
            onEditProfile={() => setEditProfileOpen(true)}
            onChangePassword={() => setChangePasswordOpen(true)}
          />
        )}
      </motion.div>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Confirm Action"
        message="Are you sure?"
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={!!loadingId}
        variant="danger"
      />

      <CreateUserModal
        isOpen={createUserModal}
        onClose={() => setCreateUserModal(false)}
        onSubmit={handleCreateUser}
        isLoading={createUserLoading}
      />

      <AdminRegistrationsModal
        isOpen={registrationsModalOpen}
        onClose={handleCloseRegistrationsModal}
        event={selected}
        registrations={eventRegistrations}
        isLoading={registrationsLoading}
        error={registrationsError}
        onDelete={handleDeleteRegistration}
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
    </DashboardLayout>
  );
}
function AdminProfileTab({
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
          {profile.name?.charAt(0)?.toUpperCase() || "A"}
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


function AdminRegistrationsModal({
  isOpen,
  onClose,
  event,
  registrations,
  isLoading,
  error,
  onDelete,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-3xl bg-slate-900 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl text-white font-semibold">
              {event?.title} Registrations
            </h2>
            <p className="text-sm text-slate-400">{event?.location}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2 text-slate-300 hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <p className="text-slate-400">Loading...</p>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : registrations.length === 0 ? (
            <p className="text-slate-400">No registrations found.</p>
          ) : (
            <div className="space-y-3">
              {registrations.map((registration) => (
                <div
                  key={registration.registrationId}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <div>
                    <p className="text-white font-medium">
                      {registration.attendeeName}
                    </p>
                    <p className="text-sm text-slate-400">
                      {registration.attendeeEmail}
                    </p>
                    <p className="text-xs text-slate-500">
                      ID: {registration.attendeeId}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        registration.status === "REGISTERED"
                          ? "border border-emerald-500/20 bg-emerald-500/15 text-emerald-300"
                          : "border border-red-500/20 bg-red-500/15 text-red-300"
                      }`}
                    >
                      {registration.status}
                    </span>

                    <button
                      onClick={() => onDelete(registration)}
                      className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300 hover:bg-red-500/20"
                    >
                      Delete
                    </button>
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

function AdminUsersTab({
  users,
  currentUser,
  userSearch,
  setUserSearch,
  roleFilter,
  setRoleFilter,
  userSort,
  setUserSort,
  onDelete,
  onCreateUser,
}) {
  const filteredUsers = [...(users || [])]
    .filter((user) => {
      const search = userSearch.trim().toLowerCase();

      const matchesSearch =
        !search ||
        user.name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.role?.toLowerCase().includes(search);

      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      switch (userSort) {
        case "NAME_DESC":
          return (b.name || "").localeCompare(a.name || "");
        case "EMAIL_ASC":
          return (a.email || "").localeCompare(b.email || "");
        case "EMAIL_DESC":
          return (b.email || "").localeCompare(a.email || "");
        case "NAME_ASC":
        default:
          return (a.name || "").localeCompare(b.name || "");
      }
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-2xl font-bold text-white">Users</h3>

        <button
          onClick={onCreateUser}
          className="rounded-2xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
        >
          + Create User
        </button>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Search
            </label>
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search name, email, role..."
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Role
            </label>
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 pr-10 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
              >
                <option value="ALL">ALL</option>
                <option value="ADMIN">Admin</option>
                <option value="ORGANIZER">Organizer</option>
                <option value="ATTENDEE">Attendee</option>
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
                value={userSort}
                onChange={(e) => setUserSort(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 pr-10 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
              >
                <option value="NAME_ASC">Name: A to Z</option>
                <option value="NAME_DESC">Name: Z to A</option>
                <option value="EMAIL_ASC">Email: A to Z</option>
                <option value="EMAIL_DESC">Email: Z to A</option>
              </select>

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                ▼
              </span>
            </div>
          </div>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-sm text-slate-400">
          No users match your search or filters.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => {
            const isSelf = currentUser?.userId === user.userId;

            return (
              <div
                key={user.userId}
                className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl"
              >
                <div>
                  <p className="text-base font-semibold text-white">{user.name}</p>
                  <p className="mt-1 text-sm text-slate-400">{user.email}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      user.role === "ADMIN"
                        ? "border border-violet-500/20 bg-violet-500/15 text-violet-300"
                        : user.role === "ORGANIZER"
                        ? "border border-amber-500/20 bg-amber-500/15 text-amber-300"
                        : "border border-emerald-500/20 bg-emerald-500/15 text-emerald-300"
                    }`}
                  >
                    {user.role}
                  </span>

                  <button
                    onClick={() => onDelete(user)}
                    disabled={isSelf}
                    className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                      isSelf
                        ? "cursor-not-allowed border border-white/10 bg-white/[0.04] text-slate-500"
                        : "border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                    }`}
                  >
                    {isSelf ? "You" : "Delete"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AdminEventsTab({
  events,
  eventSearch,
  setEventSearch,
  eventCategoryFilter,
  setEventCategoryFilter,
  eventStatusFilter,
  setEventStatusFilter,
  eventSort,
  setEventSort,
  onViewRegistrations,
  onDelete,
}) {
  const categories = ["ALL", ...EVENT_CATEGORIES];

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

  if (!events || events.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-sm text-slate-400">
        No events found.
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
                    {category}
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
                <option value="ALL">ALL</option>
                <option value="DRAFT">DRAFT</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="CANCELLED">CANCELLED</option>
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
          {filteredEvents.map((event) => (
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

                  <button
                    onClick={() => onDelete(event)}
                    className="inline-flex items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}