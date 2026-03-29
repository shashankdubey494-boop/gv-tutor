import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { verifyAuth, logoutUser } from "../services/authService";
import { getTutorProfile } from "../services/tutorService";
import LoadingSpinner from "../components/LoadingSpinner";

export default function TutorProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Start as false for instant page display
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        // Check authentication
        const authData = await verifyAuth();
        if (!authData.success || authData.user.role !== "tutor") {
          navigate("/login");
          return;
        }
        setUser(authData.user);

        // Load tutor profile
        const profileData = await getTutorProfile();
        if (profileData.success) {
          setProfile(profileData.profile);
        } else {
          setError("Profile not found. Please complete your profile first.");
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError(err.message || "Failed to load profile");
        if (err.message.includes("not found") || err.message.includes("Profile not found")) {
          navigate("/complete-profile");
        }
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-black pt-28 px-4 pb-20 flex items-center justify-center">
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/20 p-8 text-white rounded-xl text-center">
          <p className="text-xl mb-4 text-red-400">{error}</p>
          <button
            onClick={() => navigate("/complete-profile")}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 rounded-lg font-semibold text-white"
          >
            Complete Profile
          </button>
        </div>
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return "T";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-black pt-28 px-4 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header with Icon - Clickable */}
        <div 
          onClick={() => navigate("/profile")}
          className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/20 rounded-xl p-8 sm:p-10 text-white mb-6 cursor-pointer hover:border-cyan-500/60 hover:shadow-cyan-500/40 transition-all duration-300"
        >
          <div className="flex flex-col items-center text-center">
            {/* Profile Icon - Larger and more adorable */}
            <div className="w-40 h-40 rounded-full bg-gradient-to-r from-cyan-500 via-green-500 to-cyan-500 flex items-center justify-center text-white text-6xl font-bold mb-6 shadow-2xl shadow-cyan-500/50 hover:scale-110 transition-transform ring-4 ring-cyan-500/20">
              {getInitials(profile?.fullName || user?.email)}
            </div>
            
            {/* Name and Email */}
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
              {profile?.fullName || "Tutor"}
            </h1>
            <p className="text-white/80 text-xl mb-2">{user?.email}</p>
            {profile?.phone && (
              <p className="text-white/70 text-lg mb-4">📞 {profile.phone}</p>
            )}
            
            {/* Status Badge */}
            <div className="flex gap-3 mt-2">
              <span className="px-5 py-2 bg-green-500/20 text-green-300 border-2 border-green-500/40 rounded-full text-sm font-semibold shadow-lg shadow-green-500/20">
                ✓ Profile Complete
              </span>
              {profile?.isVerified && (
                <span className="px-5 py-2 bg-blue-500/20 text-blue-300 border-2 border-blue-500/40 rounded-full text-sm font-semibold shadow-lg shadow-blue-500/20">
                  ✓ Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/20 rounded-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6 pb-4 border-b border-cyan-500/30">
            Profile Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-cyan-400 mb-4">Personal Information</h3>
              
              <div>
                <p className="text-white/70 text-sm mb-1">Full Name</p>
                <p className="text-white font-medium">{profile?.fullName || "N/A"}</p>
              </div>

              <div>
                <p className="text-white/70 text-sm mb-1">Phone Number</p>
                <p className="text-white font-medium">{profile?.phone || "N/A"}</p>
              </div>

              <div>
                <p className="text-white/70 text-sm mb-1">Gender</p>
                <p className="text-white font-medium capitalize">{profile?.gender || "N/A"}</p>
              </div>

              <div>
                <p className="text-white/70 text-sm mb-1">Address</p>
                <p className="text-white font-medium">{profile?.address || "N/A"}</p>
              </div>
            </div>

            {/* Teaching Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-green-400 mb-4">Teaching Information</h3>
              
              <div>
                <p className="text-white/70 text-sm mb-1">Experience</p>
                <p className="text-white font-medium">{profile?.experience || 0} years</p>
              </div>

              <div>
                <p className="text-white/70 text-sm mb-1">Hourly Rate</p>
                <p className="text-white font-medium">₹{profile?.hourlyRate || "0"}/hour</p>
              </div>

              <div>
                <p className="text-white/70 text-sm mb-1">Preferred Timing</p>
                <p className="text-white font-medium">{profile?.preferredTiming || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div className="mt-6">
            <p className="text-white/70 text-sm mb-2">Subjects</p>
            <div className="flex flex-wrap gap-2">
              {profile?.subjects && profile.subjects.length > 0 ? (
                profile.subjects.map((subject, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full text-sm"
                  >
                    {subject}
                  </span>
                ))
              ) : (
                <p className="text-white/50">No subjects added</p>
              )}
            </div>
          </div>

          {/* Classes */}
          <div className="mt-6">
            <p className="text-white/70 text-sm mb-2">Classes</p>
            <div className="flex flex-wrap gap-2">
              {profile?.classes && profile.classes.length > 0 ? (
                profile.classes.map((cls, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded-full text-sm"
                  >
                    {cls}
                  </span>
                ))
              ) : (
                <p className="text-white/50">No classes added</p>
              )}
            </div>
          </div>

          {/* Available Locations */}
          <div className="mt-6">
            <p className="text-white/70 text-sm mb-2">Available Locations</p>
            <div className="flex flex-wrap gap-2">
              {profile?.availableLocations && profile.availableLocations.length > 0 ? (
                profile.availableLocations.map((location, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-sm"
                  >
                    {location}
                  </span>
                ))
              ) : (
                <p className="text-white/50">No locations added</p>
              )}
            </div>
          </div>

          {/* Bio */}
          {profile?.bio && (
            <div className="mt-6">
              <p className="text-white/70 text-sm mb-2">Bio</p>
              <p className="text-white/90 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Achievements */}
          {profile?.achievements && (
            <div className="mt-6">
              <p className="text-white/70 text-sm mb-2">Achievements</p>
              <p className="text-white/90 leading-relaxed">{profile.achievements}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-cyan-500/30 flex gap-4 flex-wrap">
            <button
              onClick={() => navigate("/edit-profile")}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 rounded-lg font-semibold text-white transition"
            >
              Edit Profile
            </button>
            <button
              onClick={() => navigate("/apply-tutor")}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-cyan-500/30 rounded-lg font-semibold text-white transition"
            >
              View Positions
            </button>
            <button
              onClick={async () => {
                try {
                  await logoutUser();
                  navigate("/login");
                } catch (err) {
                  console.error("Logout error:", err);
                  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                  navigate("/login");
                }
              }}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-white transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

