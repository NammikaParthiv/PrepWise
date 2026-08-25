import { useEffect, useState } from "react";
import axios from "../utils/axios.js";
import { useAuth } from "../context/AuthProvider.jsx";
import { showErrorAlert } from "../utils/errorMessage.js";

function Profile() {
  const { user, setUser } = useAuth();
  const [profileUser, setProfileUser] = useState(user);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoVersion, setPhotoVersion] = useState(0);
  const currentUser = profileUser || user;

  const getProfilePhotoUrl = (profilePicUrl) => {
    if (!profilePicUrl) return "/user.png";

    if (
      profilePicUrl.startsWith("http://") ||
      profilePicUrl.startsWith("https://")
    ) {
      return `${profilePicUrl}?v=${photoVersion}`;
    }

    return profilePicUrl;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/user/profile");
        setProfileUser(res.data);
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      } catch (err) {
        console.log("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, [setUser]);

  const handleStartEditing = () => {
    setName(currentUser?.name || "");
    setCollege(currentUser?.college || "");
    setPhone(currentUser?.phone || "+91 ");
    setGender(currentUser?.gender || "Prefer not to say");
    setPhotoPreview(
      currentUser?.profilePic_URL
        ? getProfilePhotoUrl(currentUser.profilePic_URL)
        : "/user.png",
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
      const payload = { name, college, phone, gender };

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
      const nextUser = {
        ...currentUser,
        ...updatedUser,
      };
      setProfileUser(nextUser);
      setUser((prev) => ({
        ...prev,
        ...updatedUser,
      }));
      localStorage.setItem("user", JSON.stringify(nextUser));
      setPhotoVersion(Date.now());
      setIsEditing(false);
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (err) {
      console.log("Error saving changes:", err);
      showErrorAlert(err, "Could not update profile. Please try again.");
    }
  };

  const handleDeletePhoto = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to remove your profile photo?",
    );
    if (!confirmDelete) return;

    try {
      const res = await axios.delete("/api/user/profile/photo");
      const updatedUser = res.data.user || res.data;
      const nextUser = {
        ...currentUser,
        ...updatedUser,
      };
      setProfileUser(nextUser);
      setUser((prev) => ({
        ...prev,
        ...updatedUser,
      }));
      localStorage.setItem("user", JSON.stringify(nextUser));
      setPhotoVersion(Date.now());
      setPhotoFile(null);
      setPhotoPreview("/user.png");
    } catch (err) {
      console.log("Error deleting photo:", err);
      showErrorAlert(err, "Could not delete profile photo. Please try again.");
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
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            My Profile
          </h1>
          <p className="text-sm sm:text-lg text-gray-700 dark:text-gray-300 mt-2 sm:mt-3 px-2 font-medium">
            Manage your account and track your PrepWise achievements.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-100 dark:border-slate-700">
          <div className="flex flex-col lg:flex-row items-stretch gap-8 lg:gap-8">
            <div
              className={`w-full lg:w-[26%] flex flex-col items-center lg:border-r border-gray-100 dark:border-slate-700 lg:pr-8 shrink-0 ${isEditing ? "justify-start pt-2" : "justify-center"}`}
            >
              <img
                src={
                  isEditing
                    ? photoPreview ||
                      (currentUser?.profilePic_URL
                        ? getProfilePhotoUrl(currentUser.profilePic_URL)
                        : "/user.png")
                    : currentUser?.profilePic_URL
                      ? getProfilePhotoUrl(currentUser.profilePic_URL)
                      : "/user.png"
                }
                alt="Profile"
                className="w-48 h-48 sm:w-60 sm:h-60 rounded-full border-4 border-violet-500 object-cover shadow-2xl"
              />

              {isEditing && (
                <div className="flex flex-col items-center gap-2.5 mt-5 w-full">
                  <label className="w-full px-4 py-2 text-center rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold cursor-pointer transition shadow-md text-sm">
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
                    className="w-full px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition shadow-md cursor-pointer text-sm"
                  >
                    🗑 Delete Photo
                  </button>
                </div>
              )}
            </div>

            {/* Right Side: Split into ~65% Info Column and ~35% Secondary Column */}
            <div className="w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* ~65% Width Column (Name, Email, College stacked) */}
              <div className="lg:col-span-7 flex flex-col gap-5">
                {/* Full Name */}
                <div className="bg-gray-50 dark:bg-slate-900/50 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-slate-700/60">
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-bold uppercase tracking-wider">
                    Full Name
                  </p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="text-lg sm:text-xl font-bold border-b-2 border-violet-500 focus:outline-none w-full py-1 mt-2 bg-transparent text-black dark:text-white"
                    />
                  ) : (
                    <h2 className="text-xl sm:text-2xl font-bold mt-1 break-words">
                      {currentUser?.name || "User??"}
                    </h2>
                  )}
                </div>

                {/* Email */}
                <div className="bg-gray-50 dark:bg-slate-900/50 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-slate-700/60">
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-bold uppercase tracking-wider">
                    Email
                  </p>
                  <h2 className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 cursor-not-allowed select-none mt-1 break-words font-medium">
                    {currentUser?.email || "xyz@gmail.com"}
                  </h2>
                </div>

                {/* College */}
                <div className="bg-gray-50 dark:bg-slate-900/50 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-slate-700/60">
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-bold uppercase tracking-wider">
                    College
                  </p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="text-lg sm:text-xl border-b-2 border-violet-500 focus:outline-none w-full py-1 mt-2 bg-transparent text-black dark:text-white"
                    />
                  ) : (
                    <h2 className="text-lg sm:text-xl font-medium mt-1 break-words">
                      {currentUser?.college || "Not specified"}
                    </h2>
                  )}
                </div>
              </div>

              {/* ~35% Width Column (Phone, Gender, and Emoji Edit Button in the corner) */}
              <div className="lg:col-span-5 flex flex-col gap-5 justify-between h-full">
                <div className="flex flex-col gap-5">
                  {/* Phone Number */}
                  <div className="bg-gray-50 dark:bg-slate-900/50 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-slate-700/65">
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-bold uppercase tracking-wider">
                      Phone Number
                    </p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="text-lg sm:text-xl border-b-2 border-violet-500 focus:outline-none w-full py-1 mt-2 bg-transparent text-black dark:text-white"
                      />
                    ) : (
                      <h2
                        className={`text-lg sm:text-xl font-medium mt-1 ${!currentUser?.phone || currentUser?.phone === "+91 " ? "text-gray-400 dark:text-gray-500" : ""}`}
                      >
                        {currentUser?.phone &&
                        currentUser?.phone.trim() !== "+91"
                          ? currentUser.phone
                          : "+91 "}
                      </h2>
                    )}
                  </div>

                  {/* Gender with Symbols & Prefer not to say */}
                  <div className="bg-gray-50 dark:bg-slate-900/50 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-slate-700/60">
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-bold uppercase tracking-wider">
                      Gender
                    </p>
                    {isEditing ? (
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="text-lg sm:text-xl border-b-2 border-violet-500 focus:outline-none w-full py-1 mt-2 bg-transparent text-black dark:text-white cursor-pointer"
                      >
                        <option
                          value="Male"
                          className="bg-white dark:bg-slate-800"
                        >
                          ♂️ Male
                        </option>
                        <option
                          value="Female"
                          className="bg-white dark:bg-slate-800"
                        >
                          ♀️ Female
                        </option>
                        <option
                          value="Prefer not to say"
                          className="bg-white dark:bg-slate-800"
                        >
                          Prefer not to say
                        </option>
                      </select>
                    ) : (
                      <h2 className="text-lg sm:text-xl font-medium mt-1">
                        {currentUser?.gender === "Male"
                          ? "♂️ Male"
                          : currentUser?.gender === "Female"
                            ? "♀️ Female"
                            : currentUser?.gender || "Prefer not to say"}
                      </h2>
                    )}
                  </div>
                </div>

                {/* Edit Button with only the emoji in the right corner (or Save/Cancel buttons when editing) */}
                <div className="flex justify-end pt-2">
                  {isEditing ? (
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={handleCancel}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 font-semibold transition cursor-pointer text-sm shadow-xs"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveChanges}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-md transition cursor-pointer text-sm"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <button
                      className="p-3 rounded-xl bg-violet-50 dark:bg-slate-700 hover:bg-violet-100 dark:hover:bg-slate-600 transition cursor-pointer text-xl shadow-xs"
                      onClick={handleStartEditing}
                      title="Edit Profile"
                    >
                      ✏️
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Section - Sizes kept identical to original */}
        <div className="mt-16 sm:mt-20">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-center mb-8 sm:mb-12">
            🏆 Achievements
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
            <AchievementCard
              icon="🎤"
              title="Mock Interviews"
              value={currentUser?.stats?.totalInterviews ?? "0"}
              color="from-violet-600 to-purple-700"
            />
            <AchievementCard
              icon="📄"
              title="Resume Analysis"
              value={currentUser?.stats?.totalResumes ?? "0"}
              color="from-orange-500 to-orange-700"
            />
            <AchievementCard
              icon="⭐"
              title="Best Interview Score"
              value={`${currentUser?.stats?.bestInterviewScore ?? 0} / 100`}
              color="from-green-600 to-emerald-700"
            />
            <AchievementCard
              icon="🏅"
              title="Best Resume Score"
              value={`${currentUser?.stats?.bestResumeScore ?? 0}%`}
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

      <h2 className="text-2xl sm:text-3xl font-bold text-center mt-4 sm:mt-6">
        {title}
      </h2>

      <h1 className="text-4xl sm:text-5xl font-extrabold text-center mt-6 sm:mt-8">
        {value}
      </h1>
    </div>
  );
}
