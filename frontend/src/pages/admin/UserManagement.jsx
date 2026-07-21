import { useEffect, useState } from "react";
import { getAdminUsers, suspendUser, unsuspendUser } from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAdminUsers({ role: roleFilter || undefined, search: search || undefined });
      setUsers(res.data.users);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendToggle = async (user) => {
    try {
      if (user.isSuspended) {
        await unsuspendUser(user._id);
      } else {
        const reason = window.prompt("Reason for suspension:");
        if (reason === null) return;
        await suspendUser(user._id, reason);
      }
      fetchUsers();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="bg-white rounded-xl ring-1 ring-slate-900/5 shadow-sm overflow-hidden">
        <div className="flex flex-wrap gap-3 p-4 border-b border-slate-100">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
            placeholder="Search by name or email…"
            className="flex-1 min-w-50 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
          >
            <option value="">All roles</option>
            <option value="client">Clients</option>
            <option value="freelancer">Freelancers</option>
            <option value="admin">Admins</option>
          </select>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Search
          </button>
        </div>

        {loading ? (
          <p className="p-4 text-sm text-slate-400">Loading users…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Email</th>
                  <th className="px-4 py-2 font-medium">Role</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id || u.id}>
                    <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3 text-slate-600 capitalize">
                      {u.role}
                      {u.role === "freelancer" && u.isVerified && (
                        <span className="ml-1 text-blue-500" title="Verified">✓</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.isSuspended ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                        }`}
                      >
                        {u.isSuspended ? "Suspended" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-3">
                      {/* View Profile Button (Hidden for Admins) */}
                      {u.role !== "admin" && (
                        <button
                          onClick={() => {
                            window.open(`/admin/${u.role}/${u.profileId}`, '_blank');
                          }}
                          className="text-xs font-medium text-slate-600 hover:text-slate-900 hover:underline"
                        >
                          View Profile
                        </button>
                      )}

                      {/* Suspend / Reinstate Button */}
                      {u.role !== "admin" && (
                        <button
                          onClick={() => handleSuspendToggle(u)}
                          className={`text-xs font-medium hover:underline ${
                            u.isSuspended ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {u.isSuspended ? "Reinstate" : "Suspend"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <p className="p-6 text-center text-sm text-slate-400">No users found.</p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;