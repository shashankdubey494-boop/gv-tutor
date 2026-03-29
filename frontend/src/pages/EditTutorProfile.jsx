import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveTutorProfileWithOptionalResume, getTutorProfile } from "../services/tutorService";
import { verifyAuth, logoutUser } from "../services/authService";
import LoadingSpinner from "../components/LoadingSpinner";
import { X } from "lucide-react";

export default function EditTutorProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    gender: "",
    address: "",
    experience: "",
    subjects: [],
    subjectInput: "",
    classes: [],
    classInput: "",
    availableLocations: [],
    locationInput: "",
    preferredTiming: "",
    hourlyRate: "",
    bio: "",
    achievements: "",
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [hasResumeOnServer, setHasResumeOnServer] = useState(false);
  const [existingResumeName, setExistingResumeName] = useState("");

  // Load existing profile data
  useEffect(() => {
    async function loadProfile() {
      try {
        // Verify user is a tutor
        const authData = await verifyAuth();
        if (!authData.success || authData.user.role !== "tutor") {
          navigate("/login");
          return;
        }

        // Load existing profile
        const profileData = await getTutorProfile();
        if (profileData.success && profileData.profile) {
          const profile = profileData.profile;
          setFormData({
            fullName: profile.fullName || "",
            phone: profile.phone || "",
            gender: profile.gender || "",
            address: profile.address || "",
            experience: profile.experience || "",
            subjects: profile.subjects || [],
            subjectInput: "",
            classes: profile.classes || [],
            classInput: "",
            availableLocations: profile.availableLocations || [],
            locationInput: "",
            preferredTiming: profile.preferredTiming || "",
            hourlyRate: profile.hourlyRate || "",
            bio: profile.bio || "",
            achievements: profile.achievements || "",
          });
          setHasResumeOnServer(Boolean(
            profile.resumeStoredFileName || profile.resumeOriginalName
          ));
          setExistingResumeName(profile.resumeOriginalName || "");
        } else {
          setError("Profile not found. Please create a profile first.");
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setChecking(false);
      }
    }

    loadProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddItem = (field) => {
    const inputField = `${field}Input`;
    const value = formData[inputField]?.trim();

    if (value) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], value],
        [inputField]: "",
      }));
    }
  };

  const handleRemoveItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate required fields
      if (!formData.fullName || !formData.phone || !formData.gender || !formData.address || 
          !formData.experience || formData.subjects.length === 0 || formData.classes.length === 0 || 
          !formData.availableLocations.length || !formData.preferredTiming || !formData.hourlyRate) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      const { profileResponse: response, resumeUploaded, resumeError } =
        await saveTutorProfileWithOptionalResume(
          {
            fullName: formData.fullName,
            phone: formData.phone,
            gender: formData.gender.toLowerCase(),
            address: formData.address,
            experience: parseInt(formData.experience, 10),
            subjects: formData.subjects,
            classes: formData.classes.map((c) => parseInt(c, 10)),
            availableLocations: formData.availableLocations,
            preferredTiming: formData.preferredTiming,
            hourlyRate: parseFloat(formData.hourlyRate),
            bio: formData.bio,
            achievements: formData.achievements,
          },
          resumeFile || null
        );

      if (response.success) {
        if (resumeFile && !resumeUploaded && resumeError) {
          console.warn("Resume upload skipped (profile still saved):", resumeError);
        }
        setSuccess(true);
        setTimeout(() => {
          navigate("/profile");
        }, 1000);
      } else {
        setError(response.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-black pt-28 px-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/20 p-8 sm:p-10 text-white rounded-xl">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
            Edit Tutor Profile
          </h1>
          <p className="text-white/70 mb-8">Update your profile information</p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 animate-pulse">
              ✓ Profile updated successfully! Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="border-b border-cyan-500/30 pb-4">
              <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name *"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 mb-4"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number *"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 mb-4"
              />
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 mb-4"
              >
                <option value="">Select Gender *</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <input
                type="text"
                name="address"
                placeholder="Address *"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>

            {/* Teaching Information */}
            <div className="border-b border-cyan-500/30 pb-4">
              <h3 className="text-xl font-semibold mb-4">Teaching Information</h3>
              <input
                type="number"
                name="experience"
                placeholder="Years of Experience *"
                value={formData.experience}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 mb-4"
              />
              <div className="mb-4">
                <label className="block text-white/70 text-sm mb-2">Subjects *</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    name="subjectInput"
                    placeholder="Add subject (e.g., Math)"
                    value={formData.subjectInput}
                    onChange={handleChange}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddItem("subjects");
                      }
                    }}
                    className="flex-1 px-4 py-3 rounded-lg bg-gray-800 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddItem("subjects")}
                    className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 rounded-lg font-medium text-white"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.subjects.map((subject, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full text-sm flex items-center gap-2"
                    >
                      {subject}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem("subjects", idx)}
                        className="hover:text-red-400"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-white/70 text-sm mb-2">Classes/Grades *</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="number"
                    name="classInput"
                    placeholder="Add class (e.g., 10)"
                    value={formData.classInput}
                    onChange={handleChange}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddItem("classes");
                      }
                    }}
                    className="flex-1 px-4 py-3 rounded-lg bg-gray-800 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddItem("classes")}
                    className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 rounded-lg font-medium text-white"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.classes.map((cls, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full text-sm flex items-center gap-2"
                    >
                      Class {cls}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem("classes", idx)}
                        className="hover:text-red-400"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-white/70 text-sm mb-2">Hourly Rate (₹) *</label>
                <input
                  type="number"
                  name="hourlyRate"
                  placeholder="Hourly Rate *"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  required
                  step="0.01"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Available Locations *</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    name="locationInput"
                    placeholder="Add location (e.g., Bhopal)"
                    value={formData.locationInput}
                    onChange={handleChange}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddItem("availableLocations");
                      }
                    }}
                    className="flex-1 px-4 py-3 rounded-lg bg-gray-800 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddItem("availableLocations")}
                    className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 rounded-lg font-medium text-white"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.availableLocations.map((location, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full text-sm flex items-center gap-2"
                    >
                      {location}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem("availableLocations", idx)}
                        className="hover:text-red-400"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="border-b border-cyan-500/30 pb-4">
              <h3 className="text-xl font-semibold mb-4">Availability</h3>
              <input
                type="text"
                name="preferredTiming"
                placeholder="Preferred Timing (e.g., Evening 6-8 PM) *"
                value={formData.preferredTiming}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Additional Information</h3>
              <textarea
                name="bio"
                placeholder="Bio/About Yourself"
                value={formData.bio}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 mb-4"
              />
              <textarea
                name="achievements"
                placeholder="Achievements/Awards (Optional)"
                value={formData.achievements}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 mb-4"
              />
            </div>

            {/* Resume */}
            <div className="border-b border-cyan-500/30 pb-4">
              <h3 className="text-xl font-semibold mb-4">Resume</h3>
              <p className="text-white/70 text-sm mb-3">
                PDF, DOC, or DOCX (max 5 MB). Upload a new file to replace your current resume.
              </p>
              {hasResumeOnServer && existingResumeName && !resumeFile && (
                <p className="text-cyan-300/90 text-sm mb-3">
                  Current file: {existingResumeName}
                </p>
              )}
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-cyan-500/30 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-600 file:text-white file:font-medium hover:file:bg-cyan-500"
              />
              {resumeFile && (
                <p className="text-green-300/90 text-sm mt-2">Selected: {resumeFile.name}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-cyan-500/30">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 transition font-semibold text-white shadow-lg shadow-cyan-500/30 disabled:opacity-50"
              >
                {loading ? "Saving Changes..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="flex-1 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 border border-cyan-500/30 font-semibold text-white transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
