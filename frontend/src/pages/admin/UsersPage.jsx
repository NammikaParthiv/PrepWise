import { useState, useEffect } from "react";
import axios from "../../utils/axios.js";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/admin/users");
        if (response.data.users) setUsers(response.data.users);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const deleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`/api/admin/users/${id}`);
        setUsers(users.filter((u) => u._id !== id));
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen transition-colors duration-500 bg-indigo-100 text-slate-900 dark:bg-slate-900 dark:text-white overflow-x-hidden">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 sm:mb-12 gap-6">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tighter">
              Member Directory
            </h1>
            <p className="mt-2 text-sm sm:text-base font-medium text-indigo-600 dark:text-indigo-400">
              Manage your user database securely.
            </p>
          </div>
        </div>

        <input
          type="text"
          placeholder="🔍 Search members..."
          className="w-full px-6 sm:px-8 py-4 sm:py-5 text-sm sm:text-base rounded-3xl border mb-6 sm:mb-8 outline-none transition-all bg-white border-indigo-100 focus:border-indigo-300 shadow-lg dark:bg-slate-800 dark:border-gray-700 dark:focus:border-indigo-500"
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl sm:text-2xl font-bold opacity-50">No users found.</p>
            <p className="text-sm sm:text-base opacity-40">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="rounded-3xl border overflow-hidden bg-white border-indigo-100 shadow-xl dark:bg-slate-800 dark:border-gray-700 overflow-x-auto">
            <table className="w-full text-left min-w-[650px]">
              <thead>
                <tr className="bg-indigo-200 text-indigo-700 dark:bg-slate-700 dark:text-indigo-300 uppercase text-xs font-black tracking-widest">
                  <th className="px-6 sm:px-8 py-5 sm:py-6">UserName</th>
                  <th className="px-6 sm:px-8 py-5 sm:py-6">Email account</th>
                  <th className="px-6 sm:px-8 py-5 sm:py-6">Joined Date</th>
                  <th className="px-6 sm:px-8 py-5 sm:py-6 text-right">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors text-sm sm:text-base"
                  >
                    <td className="px-6 sm:px-8 py-5 sm:py-6 font-bold">{user.name}</td>
                    <td className="px-6 sm:px-8 py-5 sm:py-6 opacity-80 break-all">{user.email}</td>
                    <td className="px-6 sm:px-8 py-5 sm:py-6 font-mono opacity-60 whitespace-nowrap">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 sm:px-8 py-5 sm:py-6 text-right">
                      <button
                        onClick={() => deleteUser(user._id)}
                        className="text-red-500 font-bold hover:text-red-400 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default UsersPage;