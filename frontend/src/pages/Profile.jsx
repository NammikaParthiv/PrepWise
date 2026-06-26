import Navbar from "../pages/layouts/NavBar";
import { useEffect, useState } from "react";
import axios from "../utils/axios.js";

function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");

  // Photo
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
        : "/user.png",
    );
    setPhotoFile(null);
    setIsEditing(true);
  };

  // Handles client-side file selection
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSaveChanges = async () => {
    try {
      let res;

      // Backend route switch: Use FormData if photo is changed, otherwise use pure JSON
      if (photoFile) {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("college", college);
        formData.append("profilePic", photoFile);

        res = await axios.put("/api/user/profile", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // Pure text update payload
        res = await axios.put("/api/user/profile", {
          name: name,
          college: college,
        });
      }

      // Handle both formats of backend responses safely
      const updatedUser = res.data.user || res.data;
      setUser(updatedUser);
      setIsEditing(false);
      setPhotoFile(null);
    } catch (err) {
      console.log("Error saving changes:", err);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-300 via-violet-2 00 to-blue-300">
      <Navbar />

      <div className="pt-16 pb-16 px-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800">My Profile</h1>
          <p className="text-lg text-gray-600 mt-3">
            Manage your account and track your PrepWise achievements.
          </p>
        </div>
        <div className="bg-white rounded-3xl shadow-2xl p-10 flex items-center justify-between relative">
          {!isEditing && (
            <button
              className="absolute top-8 right-10 text-3xl hover:text-blue-600 transition cursor-pointer"
              onClick={handleStartEditing}
            >
              ✏️
            </button>
          )}
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
              <label className="mt-6 px-6 py-3 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-semibold cursor-pointer transition shadow-md">
                📷 Change Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </label>
            )}
          </div>

          <div className="w-2/3 pl-16">
            <div className="space-y-8">
              <div>
                <p className="text-gray-500 text-lg">Full Name</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-2xl font-bold border-b-2 border-violet-500 focus:outline-none w-full py-1 mt-1 text-gray-800"
                  />
                ) : (
                  <h2 className="text-4xl font-bold text-gray-800">
                    {user?.name || "User??"}
                  </h2>
                )}
              </div>

              <div>
                <p className="text-gray-500 text-lg">Email</p>
                <h2 className="text-2xl text-gray-400 cursor-not-allowed select-none">
                  {user?.email || "xyz@gmail.com"}
                </h2>
              </div>
              <div>
                <p className="text-gray-500 text-lg">College</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="text-xl border-b-2 border-violet-500 focus:outline-none w-full py-1 mt-1 text-gray-800"
                  />
                ) : (
                  <h2 className="text-2xl text-gray-800">
                    {user?.college || "?"}
                  </h2>
                )}
              </div>
              {isEditing && (
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={handleCancel}
                    className="px-5 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    className="px-6 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-semibold shadow-md transition cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-20">
          <h2 className="text-4xl font-bold text-center mb-12">
            🏆 Achievements
          </h2>
          <div className="grid grid-cols-2 gap-10">
            <AchievementCard
              icon="🎤"
              title="Mock Interviews"
              value="18"
              color="from-violet-500 to-purple-600"
            />
            <AchievementCard
              icon="📄"
              title="Resume Analysis"
              value="12"
              color="from-orange-400 to-orange-600"
            />
            <AchievementCard
              icon="⭐"
              title="Best Interview Score"
              value="94 / 100"
              color="from-green-500 to-emerald-600"
            />
            <AchievementCard
              icon="🏅"
              title="Best Resume Score"
              value="91%"
              color="from-blue-500 to-cyan-600"
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
