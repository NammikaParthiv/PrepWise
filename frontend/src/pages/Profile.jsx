import { useEffect, useState } from "react";
import axios from "../utils/axios.js";

function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/user/profile");
        setUser(res.data);
      } catch (err) {
        console.log("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const handleStartEditing = () => {
    setName(user?.name || "");
    setCollege(user?.college || "");
    setPhotoPreview(
      user?.profilePic_URL
        ? `http://localhost:2222${user.profilePic_URL}`
        : "/user.png"
    );
    setPhotoFile(null);
    setIsEditing(true);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSaveChanges = async () => {
    try {
      let res;
      if (photoFile) {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("college", college);
        formData.append("profilePic", photoFile);

        res = await axios.put("/api/user/profile", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await axios.put("/api/user/profile", {
          name,
          college,
        });
      }
      const updatedUser = res.data.user || res.data;
      setUser(updatedUser);
      setIsEditing(false);
      setPhotoFile(null);
    } catch (err) {
      console.log("Error saving changes:", err);
    }
  };

  const handleDeletePhoto = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to remove your profile photo?"
    );
    if (!confirmDelete) return;

    try {
      const res = await axios.delete("/api/user/profile/photo");
      const updatedUser = res.data.user || res.data;
      setUser(updatedUser);
      setPhotoFile(null);
      setPhotoPreview("/user.png");
    } catch (err) {
      console.log("Error deleting photo:", err);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-200 via-violet-200 to-blue-200 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 text-black dark:text-white transition-colors duration-300">
      <div className="pt-16 pb-16 px-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold">My Profile</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mt-3">
            Manage your account and track your PrepWise achievements.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-10 flex items-center justify-between relative">
          {!isEditing && (
            <button
              className="absolute top-8 right-10 text-3xl hover:text-violet-500 transition cursor-pointer"
              onClick={handleStartEditing}
            >
              ✏️
            </button>
          )}

          {/* Profile Photo */}
          <div className="w-1/3 flex flex-col items-center">
            <img
              src={
                isEditing
                  ? photoPreview ||
                    (user?.profilePic_URL
                      ? `http://localhost:2222${user.profilePic_URL}`
                      : "/user.png")
                  : user?.profilePic_URL
                  ? `http://localhost:2222${user.profilePic_URL}`
                  : "/user.png"
              }
              alt="Profile"
              className="w-52 h-52 rounded-full border-4 border-violet-500 object-cover shadow-xl"
            />

            {isEditing && (
              <div className="flex flex-col items-center gap-3 mt-6">
                <label className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold cursor-pointer transition shadow-md">
                  📷 Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>

                <button
                  onClick={handleDeletePhoto}
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition shadow-md cursor-pointer"
                >
                  🗑 Delete Photo
                </button>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="w-2/3 pl-16">
            <div className="space-y-8">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-lg">Full Name</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-2xl font-bold border-b-2 border-violet-500 focus:outline-none w-full py-1 mt-1 bg-transparent text-black dark:text-white"
                  />
                ) : (
                  <h2 className="text-4xl font-bold">
                    {user?.name || "User??"}
                  </h2>
                )}
              </div>

              <div>
                <p className="text-gray-600 dark:text-gray-400 text-lg">Email</p>
                <h2 className="text-2xl text-gray-500 cursor-not-allowed select-none">
                  {user?.email || "xyz@gmail.com"}
                </h2>
              </div>

              <div>
                <p className="text-gray-600 dark:text-gray-400 text-lg">College</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="text-xl border-b-2 border-violet-500 focus:outline-none w-full py-1 mt-1 bg-transparent text-black dark:text-white"
                  />
                ) : (
                  <h2 className="text-2xl">{user?.college || "?"}</h2>
                )}
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={handleCancel}
                    className="px-5 py-2 rounded-xl border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    className="px-6 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-md transition cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="mt-20">
          <h2 className="text-4xl font-bold text-center mb-12">🏆 Achievements</h2>
          <div className="grid grid-cols-2 gap-10">
            <AchievementCard
              icon="🎤"
              title="Mock Interviews"
              value="18"
              color="from-violet-600 to-purple-700"
            />
            <AchievementCard
              icon="📄"
              title="Resume Analysis"
              value="12"
              color="from-orange-500 to-orange-700"
            />
            <AchievementCard
              icon="⭐"
              title="Best Interview Score"
              value="94 / 100"
              color="from-green-600 to-emerald-700"
            />
            <AchievementCard
              icon="🏅"
              title="Best Resume Score"
              value="91%"
              color="from-blue-600 to-cyan-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;


function AchievementCard({ icon, title, value, color }) {
  return (
    <div
      className={`
      bg-linear-to-r
      ${color}
      rounded-3xl
      p-8
      shadow-xl
      hover:shadow-2xl
      hover:-translate-y-2
      transition-all
      duration-300
      text-white
      cursor-pointer
      `}
    >
      <div className="text-6xl text-center">{icon}</div>

      <h2 className="text-3xl font-bold text-center mt-6">{title}</h2>

      <h1 className="text-5xl font-extrabold text-center mt-8">{value}</h1>
    </div>
  );
}
