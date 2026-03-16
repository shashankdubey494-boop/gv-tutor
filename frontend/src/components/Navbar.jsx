import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { handleApplyAsTutor } from "../utils/authHelper";
import { verifyAuth, logoutUser } from "../services/authService";
import { getTutorProfile } from "../services/tutorService";
import BrandLogo from "./BrandLogo";
import {
  Home, Info, GraduationCap, Library, Phone,
  Search, BookOpen, User, LogIn, LogOut,
  LayoutDashboard, ChevronDown, UserPlus, Sparkles,
  Menu, X, UserCircle
} from "lucide-react";

// Navbar component with logout functionality

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [tutorMenuOpen, setTutorMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tutorMenuOpen && !event.target.closest('.tutor-dropdown')) {
        setTutorMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [tutorMenuOpen]);

  // Check if user is logged in
  useEffect(() => {
    // If logout query param is present, clear state immediately and remove param
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("logout") === "true") {
      setUser(null);
      setProfile(null);
      setLoading(false);
      try {
        sessionStorage.removeItem("auth_user");
      } catch (err) {
        // Ignore storage errors
      }
      // Remove logout param from URL without reload
      window.history.replaceState({}, "", "/");
      return;
    }

    async function checkUser() {
      try {
        const authData = await verifyAuth();
        if (authData.success) {
          setUser(authData.user);
          try {
            sessionStorage.setItem("auth_user", JSON.stringify(authData.user));
          } catch (err) {
            // Ignore storage errors
          }
          // If tutor, get profile
          if (authData.user.role === "tutor") {
            try {
              const profileData = await getTutorProfile();
              if (profileData.success) {
                setProfile(profileData.profile);
              }
            } catch (err) {
              // Profile might not exist yet - silent fail
            }
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        // Silently handle "Not authenticated" errors (expected when not logged in)
        // Only log unexpected errors
        if (!err.message || !err.message.includes("Not authenticated")) {
          console.error("Navbar: Unexpected auth error:", err);
        }
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    checkUser();
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 border-b transition-all duration-300 ${
        isScrolled
          ? "bg-slate-950/35 backdrop-blur-xl border-white/10"
          : "bg-slate-900/90 backdrop-blur-md border-slate-700/40"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 sm:h-24 flex items-center relative">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 z-10">
          <BrandLogo
            className="transition-transform duration-300 hover:scale-105"
            imageClassName="h-10 sm:h-12"
          />
        </Link>

        {/* Desktop Menu - Centered */}
        <ul className="hidden lg:flex gap-8 text-white text-lg items-center absolute left-1/2 transform -translate-x-1/2">
          <Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link>
          <Link to="/about" className="hover:text-cyan-400 transition-colors">About</Link>

          {/* Home Tutor Dropdown */}
          <li className="relative select-none tutor-dropdown">
            <span
              onClick={() => setTutorMenuOpen(!tutorMenuOpen)}
              className="hover:text-cyan-400 cursor-pointer flex items-center gap-1"
            >
              Home Tutor ▾
            </span>

            {tutorMenuOpen && (
              <div className="absolute left-0 mt-2 w-44 bg-white text-black rounded-lg shadow-lg overflow-hidden">
                <Link
                  to="/find-tutor"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setTutorMenuOpen(false)}
                >
                  Find Tutor
                </Link>
                {/* Only show "Apply as Tutor" if user is not logged in OR is a tutor (not admin) */}
                {(!user || (user.role === "tutor" && user.role !== "admin")) && (
                  <button
                    onClick={() => {
                      setTutorMenuOpen(false);
                      handleApplyAsTutor(navigate);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Apply as Tutor
                  </button>
                )}
              </div>
            )}
          </li>

          <Link to="/library" className="hover:text-cyan-400 transition-colors">Library</Link>
          <Link to="/contact" className="hover:text-cyan-400 transition-colors">Contact</Link>
        </ul>

        {/* Desktop Buttons / Profile - Right Side */}
        <div className="hidden lg:flex gap-4 items-center ml-auto z-10">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-gray-600 animate-pulse"></div>
          ) : user && user.role === "admin" ? (
            <div className="flex items-center gap-4">
              <Link
                to="/admin/dashboard"
                className="px-4 py-2 text-white border border-white/30 rounded hover:bg-white/20"
              >
                Admin Dashboard
              </Link>
              <div className="relative group">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-green-500 flex items-center justify-center text-white font-semibold cursor-pointer">
                  {user.email[0].toUpperCase()}
                </div>
                <div className="absolute right-0 mt-2 w-40 bg-black/90 border border-white/30 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-auto">
                  <div className="px-4 py-2 text-sm text-white/70 border-b border-white/10">
                    {user.email}
                  </div>
                  <div className="px-4 py-2 text-xs text-white/50 border-b border-white/10">
                    Administrator
                  </div>
                  {/* Show "Change Password" for admin if they have a password */}
                  {user.hasPassword && (
                    <Link
                      to="/change-password"
                      className="block px-4 py-2 text-white hover:bg-white/10 border-b border-white/10"
                    >
                      Change Password
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        // Clear user state immediately
                        setUser(null);
                        setProfile(null);
                        // Call logout API
                        await logoutUser();
                        // Small delay to ensure cookie is cleared
                        await new Promise(resolve => setTimeout(resolve, 100));
                      } catch (err) {
                        console.error("Logout error:", err);
                      } finally {
                        // Clear all possible cookie variations
                        const domain = window.location.hostname;
                        const cookies = [
                          "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT",
                          "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax",
                          "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure",
                          `token=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 GMT`,
                        ];
                        cookies.forEach(cookie => {
                          document.cookie = cookie;
                        });
                        try {
                          sessionStorage.removeItem("auth_user");
                        } catch (err) {
                          // Ignore storage errors
                        }
                        // Force full page reload with cache bypass
                        window.location.replace("/?logout=true");
                      }
                    }}
                    className="w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-b-lg cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : user && (user.role === "tutor" || user.role === "user") ? (
            <div className="flex items-center gap-4">
              {/* Only show "Apply as Tutor" button for tutors, NOT for regular users or admins */}
              {user.role === "tutor" && user.role !== "admin" && (
                <>
                  <Link
                    to="/apply-tutor"
                    className="px-4 py-2 text-white border border-white/30 rounded hover:bg-white/20"
                  >
                    Apply as Tutor
                  </Link>
                  {profile && (
                    <Link
                      to="/profile"
                      className="px-4 py-2 text-white border border-white/30 rounded hover:bg-white/20"
                    >
                      My Profile
                    </Link>
                  )}
                </>
              )}
              {/* Profile icon with dropdown - shown for all logged-in users */}
              <div className="relative group">
                {user.role === "tutor" && profile ? (
                  <Link
                    to="/profile"
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-green-500 flex items-center justify-center text-white font-semibold cursor-pointer hover:scale-110 transition-transform shadow-lg shadow-cyan-500/30"
                  >
                    {profile.fullName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </Link>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-green-500 flex items-center justify-center text-white font-semibold cursor-pointer hover:scale-110 transition-transform shadow-lg shadow-cyan-500/30">
                    {user.email[0].toUpperCase()}
                  </div>
                )}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-black/95 border border-cyan-500/30 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none group-hover:pointer-events-auto">
                  <div className="px-4 py-3 text-sm text-white border-b border-cyan-500/20 truncate">
                    {user.email}
                  </div>
                  <div className="px-4 py-2 text-xs text-white/60 border-b border-cyan-500/20">
                    {user.role === "tutor" ? "Tutor" : "User"}
                  </div>
                  {user.role === "tutor" && profile && (
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-white hover:bg-cyan-500/10 border-b border-cyan-500/20 transition-colors"
                    >
                      View Profile
                    </Link>
                  )}
                  {/* Show "Set Password" for Google-only users (check if no password) */}
                  {user.authProviders &&
                    user.authProviders.includes("google") &&
                    !user.hasPassword && (
                      <Link
                        to="/set-password"
                        className="block px-4 py-2 text-white hover:bg-cyan-500/10 border-b border-cyan-500/20 transition-colors"
                      >
                        Set Password
                      </Link>
                    )}
                  {/* Show "Change Password" for users who have a password */}
                  {user.hasPassword && (
                    <Link
                      to="/change-password"
                      className="block px-4 py-2 text-white hover:bg-cyan-500/10 border-b border-cyan-500/20 transition-colors"
                    >
                      Change Password
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        // Clear user state immediately
                        setUser(null);
                        setProfile(null);
                        // Call logout API
                        await logoutUser();
                        // Small delay to ensure cookie is cleared
                        await new Promise(resolve => setTimeout(resolve, 100));
                      } catch (err) {
                        console.error("Logout error:", err);
                      } finally {
                        // Clear all possible cookie variations
                        const domain = window.location.hostname;
                        const cookies = [
                          "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT",
                          "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax",
                          "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure",
                          `token=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 GMT`,
                        ];
                        cookies.forEach(cookie => {
                          document.cookie = cookie;
                        });
                        try {
                          sessionStorage.removeItem("auth_user");
                        } catch (err) {
                          // Ignore storage errors
                        }
                        // Force full page reload with cache bypass
                        window.location.replace("/?logout=true");
                      }
                    }}
                    className="w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-b-lg cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-white border border-white/30 rounded hover:bg-white/20"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Icon - Right Side */}
        <div
          className="lg:hidden text-white/90 hover:text-white cursor-pointer transition-colors ml-auto"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {menuOpen && (
        <div className="lg:hidden bg-gradient-to-b from-slate-900/95 to-black/95 backdrop-blur-3xl text-white p-5 space-y-3 border-t border-white/10 animate-in fade-in slide-in-from-top-2 duration-300 shadow-2xl h-[calc(100vh-80px)] sm:h-[calc(100vh-96px)] overflow-y-auto">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="group flex items-center px-4 py-3.5 rounded-xl bg-white/5 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-cyan-500/20 border border-white/10 hover:border-blue-500/30 transition-all duration-300 transform active:scale-95 shadow-lg shadow-black/20"
          >
            <Home className="w-5 h-5 mr-3 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-medium tracking-wide group-hover:text-blue-200 transition-colors">Home</span>
          </Link>

          <Link
            to="/about"
            onClick={() => setMenuOpen(false)}
            className="group flex items-center px-4 py-3.5 rounded-xl bg-white/5 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-pink-500/20 border border-white/10 hover:border-purple-500/30 transition-all duration-300 transform active:scale-95 shadow-lg shadow-black/20"
          >
            <Info className="w-5 h-5 mr-3 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-medium tracking-wide group-hover:text-purple-200 transition-colors">About</span>
          </Link>

          <div className="tutor-dropdown">
            <button
              className="w-full text-left px-4 py-3.5 rounded-xl bg-white/5 hover:bg-gradient-to-r hover:from-emerald-600/20 hover:to-teal-500/20 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 transform active:scale-95 shadow-lg shadow-black/20 flex items-center justify-between group"
              onClick={() => setTutorMenuOpen(!tutorMenuOpen)}
            >
              <div className="flex items-center">
                <GraduationCap className="w-5 h-5 mr-3 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium tracking-wide group-hover:text-emerald-200 transition-colors">Home Tutor</span>
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${tutorMenuOpen ? 'rotate-180 text-emerald-400' : 'text-white/50 group-hover:text-emerald-400'}`} />
            </button>

            {tutorMenuOpen && (
              <div className="ml-4 mt-2 space-y-2 border-l-2 border-white/10 pl-4 animate-in slide-in-from-left-2 duration-200">
                <Link
                  to="/find-tutor"
                  onClick={() => {
                    setTutorMenuOpen(false);
                    setMenuOpen(false);
                  }}
                  className="flex items-center px-4 py-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200 hover:text-white border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-200 text-sm font-medium hover:translate-x-1 group"
                >
                  <Search className="w-4 h-4 mr-2 text-emerald-400 group-hover:scale-110" />
                  Find Tutor
                </Link>
                {/* Only show "Apply as Tutor" if user is not logged in OR is a tutor (not admin) */}
                {(!user || (user.role === "tutor" && user.role !== "admin")) && (
                  <button
                    onClick={() => {
                      setTutorMenuOpen(false);
                      setMenuOpen(false);
                      handleApplyAsTutor(navigate);
                    }}
                    className="flex w-full items-center px-4 py-2.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-200 hover:text-white border border-blue-500/20 hover:border-blue-500/40 transition-all duration-200 text-sm font-medium hover:translate-x-1 group"
                  >
                    <BookOpen className="w-4 h-4 mr-2 text-blue-400 group-hover:scale-110" />
                    Apply as Tutor
                  </button>
                )}
              </div>
            )}
          </div>

          <Link
            to="/library"
            onClick={() => setMenuOpen(false)}
            className="group flex items-center px-4 py-3.5 rounded-xl bg-white/5 hover:bg-gradient-to-r hover:from-amber-600/20 hover:to-orange-500/20 border border-white/10 hover:border-amber-500/30 transition-all duration-300 transform active:scale-95 shadow-lg shadow-black/20"
          >
            <Library className="w-5 h-5 mr-3 text-amber-400 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-medium tracking-wide group-hover:text-amber-200 transition-colors">Library</span>
          </Link>

          <Link
            to="/contact"
            onClick={() => setMenuOpen(false)}
            className="group flex items-center px-4 py-3.5 rounded-xl bg-white/5 hover:bg-gradient-to-r hover:from-rose-600/20 hover:to-red-500/20 border border-white/10 hover:border-rose-500/30 transition-all duration-300 transform active:scale-95 shadow-lg shadow-black/20"
          >
            <Phone className="w-5 h-5 mr-3 text-rose-400 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-medium tracking-wide group-hover:text-rose-200 transition-colors">Contact</span>
          </Link>

          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-4"></div>

          {user && user.role === "admin" ? (
            <div className="space-y-3 pt-2">
              <Link
                to="/admin/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-900/40 transform hover:-translate-y-0.5 transition-all duration-200 border border-white/10 group"
              >
                <LayoutDashboard className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                Admin Dashboard
              </Link>
              <button
                type="button"
                onClick={async () => {
                  setMenuOpen(false);
                  try {
                    setUser(null);
                    setProfile(null);
                    await logoutUser();
                  } catch (err) {
                    console.error("Logout error:", err);
                  } finally {
                    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
                    if (window.location.protocol === "https:") {
                      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure";
                    }
                    try {
                      sessionStorage.removeItem("auth_user");
                    } catch (err) {
                      // Ignore storage errors
                    }
                    window.location.href = "/";
                  }
                }}
                className="flex items-center justify-center w-full py-3.5 px-4 rounded-xl bg-white/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 font-semibold border border-red-500/20 hover:border-red-500/40 transition-all duration-200 group"
              >
                <LogOut className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                Logout ({user.email})
              </button>
            </div>
          ) : user && (user.role === "tutor" || user.role === "user") ? (
            <div className="space-y-3 pt-2">
              {/* Only show "Apply as Tutor" button for tutors, NOT for regular users or admins */}
              {user.role === "tutor" && user.role !== "admin" && (
                <div className="space-y-3">
                  <Link
                    to="/apply-tutor"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-900/40 transform hover:-translate-y-0.5 transition-all duration-200 border border-white/10 group"
                  >
                    <Sparkles className="w-5 h-5 mr-2 group-hover:spin-slow" />
                    Apply as Tutor
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-900/40 transform hover:-translate-y-0.5 transition-all duration-200 border border-white/10 group"
                  >
                    <UserCircle className="w-5 h-5 mr-2 group-hover:scale-110" />
                    My Profile
                  </Link>
                </div>
              )}
              <button
                type="button"
                onClick={async () => {
                  setMenuOpen(false);
                  try {
                    setUser(null);
                    setProfile(null);
                    await logoutUser();
                  } catch (err) {
                    console.error("Logout error:", err);
                  } finally {
                    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
                    if (window.location.protocol === "https:") {
                      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure";
                    }
                    try {
                      sessionStorage.removeItem("auth_user");
                    } catch (err) {
                      // Ignore storage errors
                    }
                    window.location.href = "/";
                  }
                }}
                className="flex items-center justify-center w-full py-3.5 px-4 mt-3 rounded-xl bg-white/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 font-semibold border border-red-500/20 hover:border-red-500/40 transition-all duration-200 group"
              >
                <LogOut className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                Logout ({user.email})
              </button>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center w-full py-3.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold border border-white/10 hover:border-white/30 transition-all duration-200 hover:scale-[1.02] group"
              >
                <LogIn className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-900/40 transform hover:-translate-y-0.5 transition-all duration-200 border border-white/10 group"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Sign Up Free
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
