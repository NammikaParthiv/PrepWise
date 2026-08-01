import { useEffect, useState } from "react";
import axios from "../utils/axios.js";

function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");

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
    setPhone(user?.phone || "+91 ");
    setGender(user?.gender || "Prefer not to say");
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
      const payload = {
        name,
        college,
        phone,
        gender,
      };

      if (photoFile) {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("college", college);
        formData.append("phone", phone);
        formData.append("gender", gender);
        formData.append("profilePic", photoFile);

        res = await axios.put("/api/user/profile", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await axios.put("/api/user/profile", payload);
      }

      const updatedUser = res.data.user || res.data;
      setUser((prev) => ({
        ...prev,
        ...updatedUser,
      }));
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
      setUser((prev) => ({
        ...prev,
        ...updatedUser,
      }));
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
      <div className="pt-8 pb-12 sm:pt-16 sm:pb-16 px-4 sm:px-12 max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl font-extrabold">My Profile</h1>
          <p className="text-sm sm:text-lg text-gray-700 dark:text-gray-300 mt-2 sm:mt-3 px-2">
            Manage your account and track your PrepWise achievements.
          </p>
        </div>

        {/* Profile Card Container */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-10 flex flex-col lg:flex-row items-center lg:items-start justify-between relative gap-8 lg:gap-0">
          
          {!isEditing && (
            <button
              className="absolute top-6 right-6 sm:top-8 sm:right-10 text-2xl sm:text-3xl hover:text-violet-500 transition cursor-pointer"
              onClick={handleStartEditing}
              title="Edit Profile"
            >
              ✏️
            </button>
          )}

          {/* Profile Photo Section */}
          <div className="w-full lg:w-1/3 flex flex-col items-center">
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
              className="w-40 h-40 sm:w-52 sm:h-52 rounded-full border-4 border-violet-500 object-cover shadow-xl"
            />

            {isEditing && (
              <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-3 mt-6 w-full sm:w-auto">
                <label className="w-full sm:w-auto px-5 py-2.5 sm:px-6 sm:py-3 text-center rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold cursor-pointer transition shadow-md text-sm sm:text-base">
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
                  className="w-full sm:w-auto px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition shadow-md cursor-pointer text-sm sm:text-base"
                >
                  🗑 Delete Photo
                </button>
              </div>
            )}
          </div>

          {/* Profile Info Section */}
          <div className="w-full lg:w-2/3 lg:pl-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-lg">Full Name</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-xl sm:text-2xl font-bold border-b-2 border-violet-500 focus:outline-none w-full py-1 mt-1 bg-transparent text-black dark:text-white"
                  />
                ) : (
                  <h2 className="text-2xl sm:text-3xl font-bold break-words">
                    {user?.name || "User??"}
                  </h2>
                )}
              </div>

              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-lg">Email</p>
                <h2 className="text-lg sm:text-xl text-gray-500 cursor-not-allowed select-none pt-1 break-words">
                  {user?.email || "xyz@gmail.com"}
                </h2>
              </div>

              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-lg">College</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="text-lg sm:text-xl border-b-2 border-violet-500 focus:outline-none w-full py-1 mt-1 bg-transparent text-black dark:text-white"
                  />
                ) : (
                  <h2 className="text-xl sm:text-2xl break-words">{user?.college || "Not specified"}</h2>
                )}
              </div>

              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-lg">Phone Number</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={phone}
                    placeholder="+91 XXXXXXXXXX"
                    onChange={(e) => setPhone(e.target.value)}
                    className="text-lg sm:text-xl border-b-2 border-violet-500 focus:outline-none w-full py-1 mt-1 bg-transparent text-black dark:text-white"
                  />
                ) : (
                  <h2 className="text-xl sm:text-2xl">{user?.phone || "+91 XXXXXXXXXX"}</h2>
                )}
              </div>

              <div className="md:col-span-2">
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-lg">Gender</p>
                {isEditing ? (
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="text-lg sm:text-xl border-b-2 border-violet-500 focus:outline-none w-full py-1 mt-1 bg-transparent text-black dark:text-white cursor-pointer"
                  >
                    <option value="Male" className="bg-white dark:bg-slate-800">Male</option>
                    <option value="Female" className="bg-white dark:bg-slate-800">Female</option>
                    <option value="Other" className="bg-white dark:bg-slate-800">Other</option>
                    <option value="Prefer not to say" className="bg-white dark:bg-slate-800">Prefer not to say</option>
                  </select>
                ) : (
                  <h2 className="text-xl sm:text-2xl">{user?.gender || "Prefer not to say"}</h2>
                )}
              </div>

              {isEditing && (
                <div className="md:col-span-2 flex flex-col sm:flex-row justify-end gap-3 sm:space-x-4 pt-4">
                  <button
                    onClick={handleCancel}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-md transition cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="mt-16 sm:mt-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12">🏆 Achievements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
            <AchievementCard
              icon="🎤"
              title="Mock Interviews"
              value={user?.stats?.totalInterviews ?? "0"}
              color="from-violet-600 to-purple-700"
            />
            <AchievementCard
              icon="📄"
              title="Resume Analysis"
              value={user?.stats?.totalResumes ?? "0"}
              color="from-orange-500 to-orange-700"
            />
            <AchievementCard
              icon="⭐"
              title="Best Interview Score"
              value={`${user?.stats?.bestInterviewScore ?? 0} / 100`}
              color="from-green-600 to-emerald-700"
            />
            <AchievementCard
              icon="🏅"
              title="Best Resume Score"
              value={`${user?.stats?.bestResumeScore ?? 0}%`}
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
      rounded-2xl sm:rounded-3xl
      p-6 sm:p-8
      shadow-xl
      hover:shadow-2xl
      hover:-translate-y-1 sm:hover:-translate-y-2
      transition-all
      duration-300
      text-white
      cursor-pointer
      `}
    >
      <div className="text-5xl sm:text-6xl text-center">{icon}</div>

      <h2 className="text-2xl sm:text-3xl font-bold text-center mt-4 sm:mt-6">{title}</h2>

      <h1 className="text-4xl sm:text-5xl font-extrabold text-center mt-6 sm:mt-8">{value}</h1>
    </div>
  );
}