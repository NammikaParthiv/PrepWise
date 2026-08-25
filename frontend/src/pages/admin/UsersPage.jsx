import { useState, useEffect } from "react";
import axios from "../../utils/axios.js";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  const LIMIT = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const response = await axios.get("/api/admin/users", {
          params: {
            page,
            limit: LIMIT,
            search,
          },
        });

        setUsers(response.data.users || []);

        setPagination(
          response.data.pagination || {
            currentPage: page,
            totalPages: 1,
            totalItems: 0,
          },
        );
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, search]);

  const deleteUser = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this user and all their data?",
      )
    ) {
      return;
    }

    try {
      await axios.delete(`/api/admin/users/${id}`);

      const response = await axios.get("/api/admin/users", {
        params: {
          page,
          limit: LIMIT,
          search,
        },
      });

      setUsers(response.data.users || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error("Delete failed:", error);

      alert(error.response?.data?.msg || "Failed to delete user.");
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-500 bg-linear-to-br from-blue-100 via-sky-50 to-indigo-100 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 text-slate-900 dark:bg-slate-900 dark:text-white overflow-x-hidden">
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
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl sm:text-2xl font-bold opacity-50">
              No users found.
            </p>
            <p className="text-sm sm:text-base opacity-40">
              Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          <div>
            <div className="rounded-3xl border overflow-x-auto bg-white border-indigo-100 shadow-xl dark:bg-slate-800 dark:border-gray-700">
              <table className="w-full text-left min-w-162">
                <thead>
                  <tr className="bg-indigo-200 text-indigo-700 dark:bg-slate-700 dark:text-indigo-300 uppercase text-xs font-black tracking-widest">
                    <th className="px-6 sm:px-8 py-5 sm:py-6">UserName</th>
                    <th className="px-6 sm:px-8 py-5 sm:py-6">Email account</th>
                    <th className="px-6 sm:px-8 py-5 sm:py-6">Joined Date</th>
                    <th className="px-6 sm:px-8 py-5 sm:py-6 text-right">
                      Remove
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors text-sm sm:text-base"
                    >
                      <td className="px-6 sm:px-8 py-5 sm:py-6 font-bold">
                        {user.name}
                      </td>
                      <td className="px-6 sm:px-8 py-5 sm:py-6 opacity-80 break-all">
                        {user.email}
                      </td>
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
            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
                loading={loading}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default UsersPage;

function Pagination({ currentPage, totalPages, onPageChange, loading }) {
  return (
    <div className="flex justify-center items-center gap-2 mt-10">
      <button
        disabled={currentPage === 1 || loading}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-4 py-2 rounded-xl font-bold bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700 transition"
      >
        ←
      </button>

      {Array.from({ length: totalPages }, (_, index) => {
        const pageNumber = index + 1;

        return (
          <button
            key={pageNumber}
            disabled={loading}
            onClick={() => onPageChange(pageNumber)}
            className={`w-10 h-10 rounded-xl font-bold transition ${
              currentPage === pageNumber
                ? "bg-indigo-600 text-white"
                : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700"
            }`}
          >
            {pageNumber}
          </button>
        );
      })}

      <button
        disabled={currentPage === totalPages || loading}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-4 py-2 rounded-xl font-bold bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700 transition"
      >
        →
      </button>
    </div>
  );
}
