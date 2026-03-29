import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createOrUpdateTutorProfile, getTutorProfile } from "../services/tutorService";
import { verifyAuth } from "../services/authService";
import LoadingSpinner from "../components/LoadingSpinner";
import { setRedirecting, isRedirecting, shouldRedirect, clearRedirecting } from "../utils/redirectGuard";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

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

  const location = useLocation();
  const [isRedirectingState, setIsRedirectingState] = useState(false);

  // Check if user is authenticated and is a tutor
  useEffect(() => {
    let isMounted = true;
    let timeoutId;
    
    // Clear any previous redirect flags after a delay
    setTimeout(() => {
      clearRedirecting();
    }, 1000);
    
    async function checkAuth() {
      // Prevent redirect loops
      if (isRedirecting()) {
        return;
      }
      
      try {
        const authData = await verifyAuth();
        
        // Prevent admins from applying as tutors
        if (authData.success && authData.user.role === "admin") {
          console.log("❌ CompleteProfile: Admin cannot apply as tutor, redirecting to admin dashboard");
          console.warn("Admins cannot apply as tutors. Redirecting to admin dashboard.");
          if (isMounted) {
            setIsRedirectingState(true);
            setRedirecting("/admin/dashboard");
            setTimeout(() => {
              navigate("/admin/dashboard", { replace: true });
            }, 500);
          }
          return;
        }
        
        // Allow both "user" and "tutor" roles to access this page
        // "user" will become "tutor" after completing profile
        if (!authData.success || (authData.user.role !== "tutor" && authData.user.role !== "user")) {
          if (isMounted && shouldRedirect(location.pathname, "/login")) {
            setIsRedirectingState(true);
            setRedirecting("/login");
            setTimeout(() => {
              navigate("/login", { replace: true });
            }, 500);
          }
          return;
        }
        
        // If user is already a tutor with complete profile, check if they're coming from profile page
        // If so, allow editing; otherwise redirect to apply page
        if (authData.user.role === "tutor" && authData.user.isTutorProfileComplete) {
          // Allow editing from profile page, but redirect if accessing directly from other pages
          if (location.state?.from !== '/profile' && !location.state?.allowEdit) {
            if (isMounted && shouldRedirect(location.pathname, "/apply-tutor")) {
              setIsRedirectingState(true);
              setRedirecting("/apply-tutor");
              setTimeout(() => {
                navigate("/apply-tutor", { replace: true });
              }, 500);
            }
            return;
          }
        }
        
        // Check if profile already exists
        try {
          const profileData = await getTutorProfile();
          if (profileData.success && profileData.profile.isProfileComplete) {
            // Profile already complete, redirect to apply page - but NOT if user is editing
            if (!location.state?.allowEdit && !location.state?.from) {
              if (isMounted && shouldRedirect(location.pathname, "/apply-tutor")) {
                setIsRedirectingState(true);
                setRedirecting("/apply-tutor");
                setTimeout(() => {
                  navigate("/apply-tutor", { replace: true });
                }, 500);
              }
              return;
            }
          }
          // If profile exists but incomplete, load existing data
          if (profileData.success && profileData.profile && isMounted) {
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
          }
        } catch (err) {
          // Profile doesn't exist yet, that's fine
          console.log("Profile doesn't exist yet:", err.message);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Authentication failed");
          if (shouldRedirect(location.pathname, "/login")) {
            setIsRedirectingState(true);
            setRedirecting("/login");
            setTimeout(() => {
              navigate("/login", { replace: true });
            }, 500);
          }
        }
      } finally {
        if (isMounted) {
          setChecking(false);
        }
      }
    }
    
    // Add timeout to prevent infinite loading (5 minutes for form filling)
    timeoutId = setTimeout(() => {
      if (isMounted && checking) {
        setError("Request is taking longer than expected. Please check your connection and try refreshing the page.");
        setChecking(false);
      }
    }, 300000); // 5 minutes (300 seconds) timeout
    
    checkAuth();
    
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [navigate, location.pathname]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  function handleAddSubject() {
    if (formData.subjectInput.trim()) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, formData.subjectInput.trim()],
        subjectInput: "",
      });
    }
  }

  function handleRemoveSubject(index) {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter((_, i) => i !== index),
    });
  }

  function handleAddClass() {
    if (formData.classInput.trim()) {
      setFormData({
        ...formData,
        classes: [...formData.classes, formData.classInput.trim()],
        classInput: "",
      });
    }
  }

  function handleRemoveClass(index) {
    setFormData({
      ...formData,
      classes: formData.classes.filter((_, i) => i !== index),
    });
  }

  function handleAddLocation() {
    if (formData.locationInput.trim()) {
      setFormData({
        ...formData,
        availableLocations: [...formData.availableLocations, formData.locationInput.trim()],
        locationInput: "",
      });
    }
  }

  function handleRemoveLocation(index) {
    setFormData({
      ...formData,
      availableLocations: formData.availableLocations.filter((_, i) => i !== index),
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.subjects.length === 0) {
      setError("Please add at least one subject");
      setLoading(false);
      return;
    }

    if (formData.classes.length === 0) {
      setError("Please add at least one class");
      setLoading(false);
      return;
    }

    if (formData.availableLocations.length === 0) {
      setError("Please add at least one available location");
      setLoading(false);
      return;
    }

    try {
      await createOrUpdateTutorProfile({
        ...formData,
        experience: parseInt(formData.experience),
        hourlyRate: parseFloat(formData.hourlyRate),
      });
      
      console.log("✅ Tutor profile created successfully! Redirecting to apply-tutor page...");
      
      // Profile completed successfully - user role is now "tutor"
      // Use window.location.href to force full page reload and ensure updated role is recognized
      setLoading(false);
      
      // Small delay to show success, then redirect
      setTimeout(() => {
        window.location.href = "/apply-tutor";
      }, 500);
    } catch (err) {
      console.error("❌ Error creating tutor profile:", err);
      setError(err.message);
      setLoading(false);
    }
  }

  if (checking || isRedirectingState) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-black pt-28 px-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/20 p-8 sm:p-10 text-white rounded-xl">
          <h2 className="text-3xl font-bold text-center mb-2">
            Complete Your Tutor Profile
          </h2>
          <p className="text-center text-white/80 mb-6">
            Please fill in all the required information to start applying for tutor positions
          </p>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg mb-4">
              <p className="text-sm mb-2">{error}</p>
              <button
                onClick={() => {
                  setError("");
                  setChecking(true);
                  window.location.reload();
                }}
                className="text-sm underline hover:text-red-200"
              >
                Retry
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="border-b border-cyan-500/30 pb-4">
              <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name *"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number *"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
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
            </div>

            {/* Teaching Experience */}
            <div className="border-b border-cyan-500/30 pb-4">
              <h3 className="text-xl font-semibold mb-4">Teaching Experience</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="number"
                  name="experience"
                  placeholder="Years of Experience *"
                  value={formData.experience}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
                <input
                  type="number"
                  name="hourlyRate"
                  placeholder="Hourly Rate (₹) *"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>

              {/* Subjects */}
              <div className="mb-4">
                <label className="block text-white/80 mb-2">Subjects You Teach *</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    name="subjectInput"
                    placeholder="Add subject"
                    value={formData.subjectInput}
                    onChange={handleChange}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSubject())}
                    className="flex-1 px-4 py-3 rounded-lg bg-gray-800 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubject}
                    className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 rounded-lg font-medium text-white"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.subjects.map((subject, index) => (
                    <span
                      key={index}
                      className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded-full flex items-center gap-2"
                    >
                      {subject}
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Classes */}
              <div className="mb-4">
                <label className="block text-white/80 mb-2">Classes You Teach *</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    name="classInput"
                    placeholder="Add class (e.g., Class 10, Class 12)"
                    value={formData.classInput}
                    onChange={handleChange}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddClass())}
                    className="flex-1 px-4 py-3 rounded-lg bg-gray-800 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddClass}
                    className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 rounded-lg font-medium text-white"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.classes.map((cls, index) => (
                    <span
                      key={index}
                      className="bg-green-500/20 text-green-300 border border-green-500/30 px-3 py-1 rounded-full flex items-center gap-2"
                    >
                      {cls}
                      <button
                        type="button"
                        onClick={() => handleRemoveClass(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Available Locations */}
              <div>
                <label className="block text-white/80 mb-2">Available Locations *</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    name="locationInput"
                    placeholder="Add location"
                    value={formData.locationInput}
                    onChange={handleChange}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddLocation())}
                    className="flex-1 px-4 py-3 rounded-lg bg-gray-800 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddLocation}
                    className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 rounded-lg font-medium text-white"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.availableLocations.map((location, index) => (
                    <span
                      key={index}
                      className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded-full flex items-center gap-2"
                    >
                      {location}
                      <button
                        type="button"
                        onClick={() => handleRemoveLocation(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ×
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
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 transition font-semibold text-white shadow-lg shadow-cyan-500/30"
            >
              {loading ? "Saving Profile..." : "Complete Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

