import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { verifyAuth, logoutUser } from "../services/authService";
import { apiRequest } from "../services/api";
import { getContactMessages, updateMessageStatus, deleteContactMessage } from "../services/contactService";
import LoadingSpinner from "../components/LoadingSpinner";
import { useToast } from "../components/Toast";
import ToastContainer from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard", "parent", "tutor", "messages", "poster"
  const [parentApplications, setParentApplications] = useState([]);
  const [tutorApplications, setTutorApplications] = useState([]);
  const [tutorMembers, setTutorMembers] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [messagePage, setMessagePage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [expandedItems, setExpandedItems] = useState({ mobileMenu: false, profileDropdown: false });
  const [adminUser, setAdminUser] = useState(null);
  const [displayedParentApps, setDisplayedParentApps] = useState(10); // For pagination
  const [selectedRequest, setSelectedRequest] = useState(null); // For modal
  const [editFormData, setEditFormData] = useState(null); // For editing request
  const [selectedTutorProfile, setSelectedTutorProfile] = useState(null); // For tutor profile modal
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, messageId: null });
  const [requestDeleteConfirm, setRequestDeleteConfirm] = useState({ isOpen: false, requestId: null });
  const [logoDataUrl, setLogoDataUrl] = useState("");
  const [posterFields, setPosterFields] = useState({
    classLevel: "",
    board: "",
    subjects: "",
    time: "",
    teacher: "",
    location: ""
  });
  const posterRef = useRef(null);
  const { toasts, addToast, removeToast, success, error, warning, info } = useToast();

  // Check authentication
  useEffect(() => {
    async function checkAuth() {
      try {
        if (import.meta.env.DEV) { console.log("AdminDashboard: Checking authentication..."); }

        const authData = await verifyAuth();


        if (!authData.success || authData.user.role !== "admin") {
          console.error("❌ AdminDashboard: Not an admin, redirecting to login");
          window.location.href = "/admin/login";
          return;
        }

        if (import.meta.env.DEV) { console.log("AdminDashboard: Admin verified, loading data..."); }
        setAdminUser(authData.user);
        loadData();
      } catch (err) {
        console.error("❌ AdminDashboard: Auth check error:", err);
        window.location.href = "/admin/login";
      } finally {
        setChecking(false);
      }
    }
    checkAuth();
  }, [navigate]);

  async function loadData() {
    try {
      // Show empty dashboard immediately, load data in background
      const [parentData, tutorData, membersData] = await Promise.all([
        apiRequest("/api/admin/parent-applications", { method: "GET" }),
        apiRequest("/api/admin/tutor-applications", { method: "GET" }),
        apiRequest("/api/admin/tutor-members", { method: "GET" }),
      ]);

      if (parentData.success) {
        setParentApplications(parentData.requests || []);
      }
      if (tutorData.success) {
        setTutorApplications(tutorData.profiles || []);
      }
      if (membersData.success) {
        setTutorMembers(membersData.tutors || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }

  // Load contact messages
  async function loadContactMessages(loadMore = false) {
    try {
      setLoadingMessages(true);
      const currentPage = loadMore ? messagePage : 1;
      const response = await getContactMessages({
        page: currentPage,
        limit: 6
      });

      if (response.success) {
        if (loadMore) {
          setContactMessages(prev => [...prev, ...response.data.messages]);
        } else {
          setContactMessages(response.data.messages);
        }
        setHasMoreMessages(response.data.messages.length === 6);
        if (!loadMore) {
          setMessagePage(1);
        }
      } else {
        error('Failed to load messages');
      }
    } catch (err) {
      console.error('Error loading contact messages:', err);
      error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  }

  // Load messages when tab changes or page changes
  useEffect(() => {
    if (activeTab === "messages") {
      loadContactMessages();
    }
  }, [activeTab]);

  // Load logo as data URL for SVG export
  useEffect(() => {
    let isMounted = true;
    async function loadLogo() {
      try {
        const response = await fetch("/logo.png");
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          if (isMounted) {
            setLogoDataUrl(reader.result || "");
          }
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error("Failed to load logo for poster:", err);
      }
    }
    loadLogo();
    return () => {
      isMounted = false;
    };
  }, []);

  function updatePosterField(field, value) {
    setPosterFields(prev => ({
      ...prev,
      [field]: value
    }));
  }

  const posterData = useMemo(() => {
    return {
      ...posterFields,
      contact: "9691569239"
    };
  }, [posterFields]);

  function buildPosterSvg({ data, logoHref, mode = "export" }) {
    const safe = (text) =>
      String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    const line = (label, value, y) => `
      <text x="120" y="${y}" font-family="Poppins, Arial, sans-serif" font-size="44" font-weight="700" fill="#111111">
        ${safe(label)} -
      </text>
      <text x="420" y="${y}" font-family="Poppins, Arial, sans-serif" font-size="44" font-weight="600" fill="#111111">
        ${safe(value)}
      </text>
    `;

    const width = mode === "preview" ? "100%" : "1080";
    const height = mode === "preview" ? "100%" : "1350";

    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1080 1350" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="bgAccent" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="#E9FBFF"/>
            <stop offset="1" stop-color="#E6F7FF"/>
          </linearGradient>
          <linearGradient id="navyFlow" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stop-color="#0B1F4B"/>
            <stop offset="0.5" stop-color="#0F2C6B"/>
            <stop offset="1" stop-color="#133B8A"/>
            <animate attributeName="x1" values="0;1;0" dur="10s" repeatCount="indefinite"/>
            <animate attributeName="x2" values="1;0;1" dur="10s" repeatCount="indefinite"/>
          </linearGradient>
        </defs>
        <rect width="1080" height="1350" fill="#F4F8FF"/>
        <path d="M980 0 C1030 120, 1080 220, 1080 360 L1080 0 Z" fill="#88E0F2"/>
        <path d="M0 980 C120 900, 240 820, 360 820 L0 820 Z" fill="#88E0F2" opacity="0.7"/>
        <path d="M0 1180 C160 1100, 320 1040, 520 1040 L0 1040 Z" fill="#57C9E0" opacity="0.9"/>
        <rect x="70" y="1185" width="940" height="120" rx="28" fill="#1479B8"/>

        <rect x="0" y="0" width="1080" height="200" fill="url(#navyFlow)" stroke="#0B1F4B" stroke-width="2"/>
        <rect x="60" y="24" width="960" height="152" rx="28" fill="url(#navyFlow)" stroke="#0B1F4B" stroke-width="2"/>
        ${logoHref ? `
          <image href="${logoHref}" x="260" y="40" width="560" height="120" preserveAspectRatio="xMidYMid meet" />
        ` : ""}

        <text x="70" y="300" font-family="Poppins, Arial, sans-serif" font-size="76" font-weight="800" fill="#111111">WE ARE</text>
        <text x="70" y="380" font-family="Poppins, Arial, sans-serif" font-size="100" font-weight="900" fill="#1D7BD8">HIRING</text>
        <rect x="70" y="410" width="420" height="64" rx="32" fill="#1DA9C9"/>
        <text x="115" y="455" font-family="Poppins, Arial, sans-serif" font-size="36" font-weight="700" fill="#FFFFFF">HOME TUTOR</text>

        ${line("CLASS", data.classLevel, 570)}
        ${line("BOARD", data.board, 650)}
        ${line("SUBJECTS", data.subjects, 730)}
        ${line("TIME", data.time, 810)}
        ${line("TEACHER", data.teacher, 890)}

        <rect x="70" y="955" width="620" height="64" rx="32" fill="#DFF7FF" stroke="#1DA9C9" stroke-width="3"/>
        <text x="110" y="998" font-family="Poppins, Arial, sans-serif" font-size="34" font-weight="700" fill="#0B6EA3">
          CONTACT - ${safe(data.contact)}
        </text>

        <text x="90" y="1120" font-family="Poppins, Arial, sans-serif" font-size="30" font-weight="700" fill="#0B1F4B">
          ADDRESS - ${safe(data.location).toUpperCase()}
        </text>

        <a href="https://www.goodwilledu.in" target="_blank">
          <text x="90" y="1260" font-family="Poppins, Arial, sans-serif" font-size="30" font-weight="700" fill="#FFFFFF">
            APPLY IN OUR WEBSITE:
          </text>
          <text x="520" y="1260" font-family="Poppins, Arial, sans-serif" font-size="30" font-weight="700" fill="#FFE082" text-decoration="underline">
            www.goodwilledu.in
          </text>
        </a>
      </svg>
    `;
  }

  async function downloadPoster() {
    try {
      const svgString = buildPosterSvg({ data: posterData, logoHref: logoDataUrl, mode: "export" });
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 1080;
        canvas.height = 1350;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0);
        URL.revokeObjectURL(url);
        const pngUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = "poster.png";
        link.click();
      };
      image.src = url;
    } catch (err) {
      console.error("Failed to download poster:", err);
      error("Failed to download poster. Please try again.");
    }
  }

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (expandedItems.mobileMenu) {
        const mobileMenu = document.querySelector('.mobile-menu-panel');
        const hamburgerButton = document.querySelector('[aria-label="Toggle mobile menu"]');

        if (mobileMenu && !mobileMenu.contains(event.target) &&
          hamburgerButton && !hamburgerButton.contains(event.target)) {
          setExpandedItems(prev => ({ ...prev, mobileMenu: false }));
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expandedItems.mobileMenu]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (expandedItems.profileDropdown) {
        const profileContainer = event.target.closest('[data-profile-dropdown="admin"]');
        
        if (!profileContainer) {
          setExpandedItems(prev => ({
            ...prev,
            profileDropdown: false
          }));
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expandedItems.profileDropdown]);

  // Handle message deletion
  async function handleMessageDelete(messageId) {
    try {
      await deleteContactMessage(messageId);
      success('Message deleted successfully');
      loadContactMessages(); // Refresh messages
    } catch (err) {
      console.error('Error deleting message:', err);
      error('Failed to delete message');
    }
  }

  // Confirm delete
  function confirmDelete(messageId) {
    setDeleteConfirm({ isOpen: true, messageId });
  }

  // Handle confirmed delete
  function handleConfirmedDelete() {
    if (deleteConfirm.messageId) {
      handleMessageDelete(deleteConfirm.messageId);
    }
    setDeleteConfirm({ isOpen: false, messageId: null });
  }

  // Confirm tutor request delete
  function confirmRequestDelete(requestId) {
    setRequestDeleteConfirm({ isOpen: true, requestId });
  }

  async function handleRequestDelete(requestId) {
    try {
      await apiRequest(`/api/admin/tutor-requests/${requestId}`, {
        method: "DELETE",
      });
      success("Request deleted successfully");
      setSelectedRequest(null);
      setEditFormData(null);
      setParentApplications((prev) => prev.filter((req) => req._id !== requestId));
      setTutorApplications((prev) =>
        prev.map((profile) => ({
          ...profile,
          appliedPosts: (profile.appliedPosts || []).filter((post) => post._id !== requestId),
        }))
      );
      setSelectedTutorProfile((prev) =>
        prev
          ? {
              ...prev,
              appliedPosts: (prev.appliedPosts || []).filter((post) => post._id !== requestId),
            }
          : prev
      );
    } catch (err) {
      error("Failed to delete request: " + err.message);
    }
  }

  function handleConfirmedRequestDelete() {
    if (requestDeleteConfirm.requestId) {
      handleRequestDelete(requestDeleteConfirm.requestId);
    }
    setRequestDeleteConfirm({ isOpen: false, requestId: null });
  }

  // Load more messages
  function loadMoreMessages() {
    setMessagePage(prev => prev + 1);
    loadContactMessages(true);
  }

  function toggleExpand(type, id) {
    setExpandedItems((prev) => ({
      ...prev,
      [`${type}-${id}`]: !prev[`${type}-${id}`],
    }));
  }

  async function handleStatusUpdate(requestId, newStatus) {
    try {
      await apiRequest(`/api/admin/tutor-requests/${requestId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      success('Status updated successfully');
      loadData();
    } catch (err) {
      error('Failed to update status: ' + err.message);
    }
  }

  async function handleFieldVisibilityUpdate(requestId, fieldName, isVisible) {
    try {
      await apiRequest(`/api/admin/tutor-requests/${requestId}/visibility`, {
        method: "PUT",
        body: JSON.stringify({
          fieldVisibility: { [fieldName]: isVisible },
        }),
      });
      success('Field visibility updated successfully');
      loadData();
    } catch (err) {
      error('Failed to update field visibility: ' + err.message);
    }
  }

  async function handlePostRequest(requestId) {
    try {
      await apiRequest(`/api/admin/tutor-requests/${requestId}/post`, {
        method: "POST",
      });
      success('Request posted successfully! It is now visible to tutors.');
      setSelectedRequest(null);
      setEditFormData(null);
      loadData();
    } catch (err) {
      error('Failed to post request: ' + err.message);
    }
  }

  function handleCardClick(request) {
    setSelectedRequest(request);
    setEditFormData({
      parentName: request.parentName || "",
      parentEmail: request.parentEmail || "",
      parentPhone: request.parentPhone || "",
      studentGrade: request.studentGrade || "",
      subjects: Array.isArray(request.subjects) ? request.subjects : [request.subjects || ""],
      preferredLocation: request.preferredLocation || "",
      preferredTiming: request.preferredTiming || "",
      frequency: request.frequency || "weekly",
      budget: request.budget || "",
      preferredTutorGender: request.preferredTutorGender || "any",
      teacherExperience:
        request.teacherExperience === undefined || request.teacherExperience === null
          ? 0
          : request.teacherExperience,
      additionalRequirements: request.additionalRequirements || "",
      fieldVisibility: request.fieldVisibility || {},
    });
  }

  function handleEditChange(field, value) {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleAddSubject() {
    if (editFormData.subjectInput && editFormData.subjectInput.trim()) {
      setEditFormData((prev) => ({
        ...prev,
        subjects: [...prev.subjects, prev.subjectInput.trim()],
        subjectInput: "",
      }));
    }
  }

  function handleRemoveSubject(index) {
    setEditFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((_, i) => i !== index),
    }));
  }

  async function handleSaveRequest() {
    try {
      const { subjectInput, ...dataToSend } = editFormData;
      await apiRequest(`/api/admin/tutor-requests/${selectedRequest._id}`, {
        method: "PUT",
        body: JSON.stringify(dataToSend),
      });
      success('Request updated successfully!');
      setSelectedRequest(null);
      setEditFormData(null);
      loadData();
    } catch (err) {
      error('Failed to update request: ' + err.message);
    }
  }

  if (checking) {
    return <LoadingSpinner />;
  }

  const getMostRecentTimestamp = (item) => {
    const candidate =
      item?.createdAt ||
      item?.updatedAt ||
      item?.userId?.createdAt ||
      item?.userId?.updatedAt ||
      0;

    const timestamp = new Date(candidate).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  };

  const sortMostRecentFirst = (items = []) =>
    [...items].sort(
      (a, b) => getMostRecentTimestamp(b) - getMostRecentTimestamp(a)
    );

  // Filter out rejected applications and sort by most recent first
  const pendingParentApps = sortMostRecentFirst(
    parentApplications.filter((req) => req.status !== "rejected")
  );
  const recentParentApps = pendingParentApps.slice(0, 5);
  const recentTutorApps = sortMostRecentFirst(tutorApplications).slice(0, 5);
  const recentTutorMembers = sortMostRecentFirst(tutorMembers).slice(0, 5);

  return (
    <div className="min-h-screen bg-black">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-cyan-500/30 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Goodwill Tutor Logo"
              className="h-16 w-auto object-contain hover:scale-105 transition-transform duration-300"
            />
          </Link>

          {/* Center Navigation - Desktop */}
          <div className="hidden md:flex gap-2 lg:gap-4 items-center">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-3 lg:px-4 py-2 rounded-lg font-medium transition text-sm lg:text-base ${activeTab === "dashboard"
                ? "bg-gradient-to-r from-cyan-500 to-green-500 text-white"
                : "bg-gray-800 text-white/70 hover:text-white"
                }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("parent")}
              className={`px-3 lg:px-4 py-2 rounded-lg font-medium transition text-sm lg:text-base ${activeTab === "parent"
                ? "bg-gradient-to-r from-cyan-500 to-green-500 text-white"
                : "bg-gray-800 text-white/70 hover:text-white"
                }`}
            >
              Parent
            </button>
            <button
              onClick={() => setActiveTab("tutor")}
              className={`px-3 lg:px-4 py-2 rounded-lg font-medium transition text-sm lg:text-base ${activeTab === "tutor"
                ? "bg-gradient-to-r from-cyan-500 to-green-500 text-white"
                : "bg-gray-800 text-white/70 hover:text-white"
                }`}
            >
              Tutor
            </button>
            <button
              onClick={() => setActiveTab("messages")}
              className={`px-3 lg:px-4 py-2 rounded-lg font-medium transition text-sm lg:text-base ${activeTab === "messages"
                ? "bg-gradient-to-r from-cyan-500 to-green-500 text-white"
                : "bg-gray-800 text-white/70 hover:text-white"
                }`}
            >
              Messages
            </button>
            <button
              onClick={() => setActiveTab("poster")}
              className={`px-3 lg:px-4 py-2 rounded-lg font-medium transition text-sm lg:text-base ${activeTab === "poster"
                ? "bg-gradient-to-r from-cyan-500 to-green-500 text-white"
                : "bg-gray-800 text-white/70 hover:text-white"
                }`}
            >
              Poster
            </button>
          </div>

          {/* Profile Icon - Desktop Only - WORKING VERSION */}
          <div 
            className="hidden md:block"
            style={{ 
              position: 'relative',
              zIndex: 100000
            }}
            data-profile-dropdown="admin"
          >
            <div style={{ position: 'relative' }}>
              <button
                className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-green-500 flex items-center justify-center text-white font-semibold hover:scale-110 transition-transform shadow-lg shadow-cyan-500/30"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("🔴 PROFILE CLICKED!");
                  setExpandedItems(prev => ({
                    ...prev,
                    profileDropdown: !prev.profileDropdown
                  }));
                }}
                type="button"
                style={{
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: 100001,
                  pointerEvents: 'auto'
                }}
              >
                {adminUser?.email?.[0]?.toUpperCase() || "A"}
              </button>
              
              {expandedItems.profileDropdown && (
                <div 
                  className="bg-black/95 border border-white/20 rounded-lg shadow-xl"
                  style={{ 
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: '0',
                    width: '192px',
                    zIndex: 100002,
                    pointerEvents: 'auto'
                  }}
                >
                  <div className="px-4 py-2 text-sm text-white/80 border-b border-white/10">
                    {adminUser?.email || "admin@example.com"}
                  </div>
                  <div className="px-4 py-2 text-xs text-white/60 border-b border-white/10">
                    Administrator
                  </div>
                  {adminUser?.hasPassword && (
                    <Link
                      to="/change-password"
                      className="block px-4 py-2 text-white hover:bg-white/10 border-b border-white/10 transition-colors"
                      onClick={(e) => {
                        console.log("🔵 CHANGE PASSWORD CLICKED");
                        setExpandedItems(prev => ({ ...prev, profileDropdown: false }));
                      }}
                      style={{ 
                        cursor: 'pointer',
                        textDecoration: 'none',
                        pointerEvents: 'auto'
                      }}
                    >
                      Change Password
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("🔴 LOGOUT CLICKED");
                      setExpandedItems(prev => ({ ...prev, profileDropdown: false }));
                      
                      // Real logout logic
                      try {
                        await logoutUser();
                        await new Promise(resolve => setTimeout(resolve, 100));
                      } catch (err) {
                        console.error("Logout error:", err);
                      } finally {
                        const domain = window.location.hostname;
                        const cookies = [
                          "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT",
                          "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax",
                          "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure",
                          `token=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
                        ];
                        cookies.forEach(cookie => {
                          document.cookie = cookie;
                        });
                        window.location.replace("/?logout=true");
                      }
                    }}
                    className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors rounded-b-lg"
                    style={{ 
                      cursor: 'pointer',
                      pointerEvents: 'auto',
                      border: 'none',
                      outline: 'none'
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Hamburger Menu Button - Mobile Only */}
          <button
            onClick={() => {
              console.log("🍔 Hamburger clicked! Current state:", expandedItems.mobileMenu);
              setExpandedItems(prev => ({
                ...prev,
                mobileMenu: !prev.mobileMenu
              }));
            }}
            className="md:hidden text-cyan-400 hover:text-cyan-300 text-3xl font-bold p-3 bg-gray-800 rounded-lg"
            aria-label="Toggle mobile menu"
            style={{
              touchAction: 'manipulation',
              cursor: 'pointer',
              zIndex: 9999
            }}
            type="button"
          >
            {expandedItems.mobileMenu ? "✕" : "☰"}
          </button>

        </div>

        {/* Hamburger Menu - Styled like the image (mobile only) */}
        {expandedItems.mobileMenu && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden mobile-menu-panel">
            <div className="absolute right-0 top-0 h-full w-80 bg-gradient-to-br from-gray-900 via-black to-gray-900 border-l-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/20 overflow-y-auto">
              {/* Close button */}
              <div className="flex justify-end items-center p-6 border-b border-cyan-500/30">
                <button
                  onClick={() => setExpandedItems(prev => ({ ...prev, mobileMenu: false }))}
                  className="text-cyan-400 hover:text-cyan-300 text-3xl font-bold transition"
                >
                  ✕
                </button>
              </div>

              {/* User Profile Section */}
              <div className="p-6 border-b border-cyan-500/30">
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-cyan-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-green-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      {adminUser?.email?.[0]?.toUpperCase() || "A"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-lg truncate">
                        {adminUser?.name || "Admin"}
                      </h3>
                      <p className="text-white/70 text-sm truncate">
                        {adminUser?.email || "admin@example.com"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="p-4 space-y-2">
                <button
                  onClick={() => {
                    setActiveTab("dashboard");
                    setExpandedItems(prev => ({ ...prev, mobileMenu: false }));
                  }}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition text-left ${activeTab === "dashboard"
                    ? "bg-gradient-to-r from-cyan-500 to-green-500 text-white"
                    : "bg-gray-800/50 text-white/70 hover:bg-gray-800 hover:text-white border border-gray-700"
                    }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    setActiveTab("parent");
                    setExpandedItems(prev => ({ ...prev, mobileMenu: false }));
                  }}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition text-left ${activeTab === "parent"
                    ? "bg-gradient-to-r from-cyan-500 to-green-500 text-white"
                    : "bg-gray-800/50 text-white/70 hover:bg-gray-800 hover:text-white border border-gray-700"
                    }`}
                >
                  Parent
                </button>
                <button
                  onClick={() => {
                    setActiveTab("tutor");
                    setExpandedItems(prev => ({ ...prev, mobileMenu: false }));
                  }}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition text-left ${activeTab === "tutor"
                    ? "bg-gradient-to-r from-cyan-500 to-green-500 text-white"
                    : "bg-gray-800/50 text-white/70 hover:bg-gray-800 hover:text-white border border-gray-700"
                    }`}
                >
                  Tutor
                </button>
                <button
                  onClick={() => {
                    setActiveTab("messages");
                    setExpandedItems(prev => ({ ...prev, mobileMenu: false }));
                  }}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition text-left ${activeTab === "messages"
                    ? "bg-gradient-to-r from-cyan-500 to-green-500 text-white"
                    : "bg-gray-800/50 text-white/70 hover:bg-gray-800 hover:text-white border border-gray-700"
                    }`}
                >
                  Messages
                </button>
                <button
                  onClick={() => {
                    setActiveTab("poster");
                    setExpandedItems(prev => ({ ...prev, mobileMenu: false }));
                  }}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition text-left ${activeTab === "poster"
                    ? "bg-gradient-to-r from-cyan-500 to-green-500 text-white"
                    : "bg-gray-800/50 text-white/70 hover:bg-gray-800 hover:text-white border border-gray-700"
                    }`}
                >
                  Poster
                </button>
              </div>

              {/* Action Buttons */}
              <div className="p-4 space-y-2 border-t border-cyan-500/30 pt-4">
                {adminUser?.authProviders &&
                  adminUser.authProviders.includes("google") &&
                  !adminUser.hasPassword && (
                    <Link
                      to="/set-password"
                      className="block w-full px-4 py-3 rounded-lg font-medium transition text-left bg-gray-800/50 text-white/70 hover:bg-gray-800 hover:text-white border border-gray-700"
                    >
                      Set Password
                    </Link>
                  )}

                {adminUser?.hasPassword && (
                  <Link
                    to="/change-password"
                    className="block w-full px-4 py-3 rounded-lg font-medium transition text-left bg-gray-800/50 text-white/70 hover:bg-gray-800 hover:text-white border border-gray-700"
                  >
                    Change Password
                  </Link>
                )}

                <button
                  type="button"
                  onClick={async () => {
                    setExpandedItems(prev => ({ ...prev, mobileMenu: false }));
                    try {
                      await logoutUser();
                      await new Promise(resolve => setTimeout(resolve, 100));
                    } catch (err) {
                      console.error("Logout error:", err);
                    } finally {
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
                      window.location.replace("/?logout=true");
                    }
                  }}
                  className="w-full px-4 py-3 rounded-lg font-semibold bg-red-600 hover:bg-red-700 text-white transition shadow-lg"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {activeTab === "dashboard" && (
          <div className="bg-white text-gray-900 rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Dashboard</h2>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Recent Parent Applications */}
                <div>
                  <button
                    onClick={() => toggleExpand("parent", "recent")}
                    className="w-full flex items-center justify-between text-left p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    <span className="text-lg sm:text-xl font-semibold text-gray-900">
                      Recent Parent Applications
                    </span>
                    <span className="text-cyan-600">
                      {expandedItems["parent-recent"] ? "▼" : "▶"}
                    </span>
                  </button>
                  {expandedItems["parent-recent"] && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      {recentParentApps.length > 0 ? (
                        recentParentApps.map((request) => (
                          <div
                            key={request._id}
                            onClick={() => handleCardClick(request)}
                            className="bg-white text-gray-900 p-5 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
                          >
                            <div className="mb-3">
                              <h3 className="font-bold text-gray-900 text-lg mb-1">
                                {request.parentName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {request.parentEmail || "No email"}
                              </p>
                              <p className="text-sm text-gray-600">
                                📞 {request.parentPhone}
                              </p>
                            </div>
                            <div className="space-y-3 mb-3">
                              <div className="grid grid-cols-1 gap-2">
                                <p className="text-sm text-gray-700">
                                  <span className="font-semibold text-cyan-600">Grade:</span> {request.studentGrade}
                                </p>
                                <p className="text-sm text-gray-700">
                                  <span className="font-semibold text-cyan-600">Subjects:</span>{" "}
                                  {Array.isArray(request.subjects)
                                    ? request.subjects.slice(0, 2).join(", ")
                                    : request.subjects}
                                  {Array.isArray(request.subjects) && request.subjects.length > 2 && "..."}
                                </p>
                                {request.teacherExperience !== undefined && request.teacherExperience !== null && (
                                  <p className="text-sm text-gray-700">
                                    <span className="font-semibold text-cyan-600">Teacher Experience:</span> {request.teacherExperience} yr
                                  </p>
                                )}
                                <p className="text-sm text-gray-700">
                                  <span className="font-semibold text-cyan-600">Location:</span> {request.preferredLocation}
                                </p>
                                <p className="text-sm text-gray-700">
                                  <span className="font-semibold text-cyan-600">Budget:</span> {request.budget}
                                </p>
                                <p className="text-sm text-gray-700">
                                  <span className="font-semibold text-cyan-600">Frequency:</span> {request.frequency}
                                </p>
                              </div>
                              {request.appliedTutors && request.appliedTutors.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <p className="text-xs font-semibold text-purple-600 mb-1 flex items-center gap-1">
                                    <span>👥</span>
                                    Applied Tutors ({request.appliedTutors.length}) - Click to see details
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {request.appliedTutors.slice(0, 3).map((applied, idx) => (
                                      <span
                                        key={idx}
                                        className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full border border-purple-300"
                                        title={`${applied.tutorProfile?.fullName || applied.tutorId?.email || "Tutor"}${applied.tutorProfile?.phone ? ` - ${applied.tutorProfile.phone}` : ''}`}
                                      >
                                        {applied.tutorProfile?.fullName || applied.tutorId?.email || "Tutor"}
                                      </span>
                                    ))}
                                    {request.appliedTutors.length > 3 && (
                                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                        +{request.appliedTutors.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="pt-3 border-t border-gray-200 flex items-center justify-between gap-3">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${request.status === "posted"
                                  ? "bg-green-100 text-green-700 border border-green-300"
                                  : request.status === "pending"
                                    ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                                    : "bg-blue-100 text-blue-700 border border-blue-300"
                                  }`}
                              >
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmRequestDelete(request._id);
                                }}
                                className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-600 col-span-full">No recent parent applications</p>
                      )}
                      {pendingParentApps.length > 5 && (
                        <div className="col-span-full flex justify-center mt-4">
                          <button
                            onClick={() => setActiveTab("parent")}
                            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-green-500 text-white rounded-lg hover:from-cyan-600 hover:to-green-600 transition font-semibold shadow-lg"
                          >
                            See All Applications →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Recent Tutor Applications */}
                <div>
                  <button
                    onClick={() => toggleExpand("tutor-app", "recent")}
                    className="w-full flex items-center justify-between text-left p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    <span className="text-xl font-semibold text-gray-900">
                      Recent Tutor Applications
                    </span>
                    <span className="text-cyan-600">
                      {expandedItems["tutor-app-recent"] ? "▼" : "▶"}
                    </span>
                  </button>
                  {expandedItems["tutor-app-recent"] && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      {recentTutorApps.length > 0 ? (
                        recentTutorApps.map((profile) => {
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
                            <div
                              key={profile._id}
                              onClick={() => {
                                setSelectedTutorProfile({
                                  profile: profile,
                                  userId: profile.userId,
                                  email: profile.userId?.email
                                });
                              }}
                              className="bg-white text-gray-900 p-5 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded bg-gradient-to-r from-cyan-500 to-green-500 flex items-center justify-center text-white font-bold shadow-md">
                                  {getInitials(profile.fullName)}
                                </div>
                                <div>
                                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                                    {profile.fullName}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {profile.userId?.email}
                                  </p>
                                  {profile.phone && (
                                    <p className="text-sm text-gray-600">
                                      📞 {profile.phone}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="space-y-2 mb-3">
                                <p className="text-sm text-gray-700">
                                  <span className="font-semibold text-cyan-600">Subjects:</span>{" "}
                                  {profile.subjects.slice(0, 2).join(", ")}
                                  {profile.subjects.length > 2 && "..."}
                                </p>
                                <p className="text-sm text-gray-700">
                                  <span className="font-semibold text-cyan-600">Hourly Rate:</span> ₹{profile.hourlyRate || "0"}/hour
                                </p>
                                {profile.preferredTiming && (
                                  <p className="text-sm text-gray-700">
                                    <span className="font-semibold text-cyan-600">Timing:</span> {profile.preferredTiming}
                                  </p>
                                )}
                              </div>
                              <div className="pt-3 border-t border-gray-200">
                                <span
                                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${profile.isProfileComplete
                                    ? "bg-green-100 text-green-700 border border-green-300"
                                    : "bg-yellow-100 text-yellow-700 border border-yellow-300"
                                    }`}
                                >
                                  {profile.isProfileComplete ? "Complete" : "Incomplete"}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-gray-600 col-span-full">No tutor applications</p>
                      )}
                      {tutorApplications.length > 5 && (
                        <div className="col-span-full flex justify-center mt-4">
                          <button
                            onClick={() => setActiveTab("tutor")}
                            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-green-500 text-white rounded-lg hover:from-cyan-600 hover:to-green-600 transition font-semibold shadow-lg"
                          >
                            See All Applications →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Tutor Members */}
                <div>
                  <button
                    onClick={() => toggleExpand("members", "recent")}
                    className="w-full flex items-center justify-between text-left p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    <span className="text-lg sm:text-xl font-semibold text-gray-900">Tutor Members</span>
                    <span className="text-cyan-600">
                      {expandedItems["members-recent"] ? "▼" : "▶"}
                    </span>
                  </button>
                  {expandedItems["members-recent"] && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
                      {recentTutorMembers.length > 0 ? (
                        recentTutorMembers.map((tutor) => {
                          const getInitials = (name) => {
                            if (!name) return tutor.email?.[0]?.toUpperCase() || "T";
                            return name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2);
                          };
                          return (
                            <div
                              key={tutor._id}
                              onClick={() => setSelectedTutorProfile(tutor)}
                              className="flex flex-col items-center cursor-pointer group"
                            >
                              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-green-500 flex items-center justify-center text-white text-xl font-bold shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 mb-3">
                                {getInitials(tutor.profile?.fullName)}
                              </div>
                              <p className="text-sm font-semibold text-gray-900 text-center group-hover:text-cyan-600 transition">
                                {tutor.profile?.fullName || tutor.email?.split("@")[0]}
                              </p>
                              <p className="text-xs text-gray-600 text-center mt-1">
                                {tutor.profile?.phone || tutor.email}
                              </p>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-gray-600 col-span-full">No tutor members</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "poster" && (
          <div className="bg-white text-gray-900 rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">Poster Generator</h2>
                <p className="text-sm text-gray-600 mt-1">Create a hiring poster for each job post.</p>
              </div>
              <button
                onClick={downloadPoster}
                className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 text-white rounded-lg font-semibold shadow-lg transition"
              >
                Download PNG
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Class</label>
                  <input
                    type="text"
                    value={posterFields.classLevel}
                    onChange={(e) => updatePosterField("classLevel", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Board</label>
                  <input
                    type="text"
                    value={posterFields.board}
                    onChange={(e) => updatePosterField("board", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subjects</label>
                  <input
                    type="text"
                    value={posterFields.subjects}
                    onChange={(e) => updatePosterField("subjects", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
                  <input
                    type="text"
                    value={posterFields.time}
                    onChange={(e) => updatePosterField("time", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Teacher</label>
                  <input
                    type="text"
                    value={posterFields.teacher}
                    onChange={(e) => updatePosterField("teacher", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                  <textarea
                    rows={3}
                    value={posterFields.location}
                    onChange={(e) => updatePosterField("location", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-center">
                <div className="w-full max-w-[420px] aspect-[4/5] bg-white shadow-md rounded-lg overflow-hidden">
                  <div
                    ref={posterRef}
                    className="w-full h-full"
                    style={{ transform: "scale(1)", transformOrigin: "top left" }}
                    dangerouslySetInnerHTML={{
                      __html: buildPosterSvg({
                        data: posterData,
                        logoHref: logoDataUrl || "/logo.png",
                        mode: "preview"
                      })
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <div className="bg-white text-gray-900 rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Contact Messages</h2>

            {/* Messages List */}
            <div className="space-y-4">
              {loadingMessages && contactMessages.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-gray-600">
                  <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                  <span className="ml-3 text-sm sm:text-base">Loading messages...</span>
                </div>
              ) : contactMessages.length > 0 ? (
                contactMessages.map((message) => (
                  <div
                    key={message._id}
                    className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="flex-1">
                        <div className="mb-3">
                          <h3 className="font-semibold text-lg sm:text-xl text-gray-900 mb-2">{message.name}</h3>
                          <p className="text-sm text-gray-600 mb-1">{message.email}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(message.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <p className="text-gray-800 whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                            {message.message}
                          </p>
                        </div>
                      </div>
                      <div className="flex sm:flex-col gap-2 sm:gap-3">
                        <button
                          onClick={() => confirmDelete(message._id)}
                          className="px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center gap-2 shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg">No messages found</div>
                  <div className="text-gray-400 text-sm mt-2">
                    No contact messages have been submitted yet.
                  </div>
                </div>
              )}
            </div>

            {/* Load More Button */}
            {hasMoreMessages && contactMessages.length > 0 && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMoreMessages}
                  disabled={loadingMessages}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 disabled:cursor-not-allowed"
                >
                  {loadingMessages ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Load More Messages
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "parent" && (
          <div className="bg-white text-gray-900 rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">All Parent Applications</h2>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {pendingParentApps.slice(0, displayedParentApps).map((request) => {
                  return (
                    <div
                      key={request._id}
                      onClick={() => handleCardClick(request)}
                      className="bg-white text-gray-900 p-4 sm:p-6 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
                    >
                      <div className="space-y-3">
                        {/* Request Header */}
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg mb-1">
                            {request.parentName}
                          </h3>
                          <p className="text-sm text-gray-600 mb-1">
                            {request.parentEmail || "No email"}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            📞 {request.parentPhone}
                          </p>
                          <div className="grid grid-cols-1 gap-2 mb-3">
                            <p className="text-sm text-gray-700">
                              <span className="text-cyan-600 font-semibold">Grade:</span> {request.studentGrade}
                            </p>
                            <p className="text-sm text-gray-700">
                              <span className="text-cyan-600 font-semibold">Subjects:</span>{" "}
                              {Array.isArray(request.subjects)
                                ? request.subjects.slice(0, 2).join(", ")
                                : request.subjects}
                              {Array.isArray(request.subjects) && request.subjects.length > 2 && "..."}
                            </p>
                            <p className="text-sm text-gray-700">
                              <span className="text-cyan-600 font-semibold">Location:</span> {request.preferredLocation}
                            </p>
                            {request.teacherExperience !== undefined && request.teacherExperience !== null && (
                              <p className="text-sm text-gray-700">
                                <span className="text-cyan-600 font-semibold">Teacher Experience:</span> {request.teacherExperience} yr
                              </p>
                            )}
                            <p className="text-sm text-gray-700">
                              <span className="text-cyan-600 font-semibold">Budget:</span> {request.budget}
                            </p>
                            <p className="text-sm text-gray-700">
                              <span className="text-cyan-600 font-semibold">Frequency:</span> {request.frequency}
                            </p>
                          </div>
                          {request.appliedTutors && request.appliedTutors.length > 0 && (
                            <div className="mb-2 pt-2 border-t border-gray-200">
                              <p className="text-xs font-semibold text-purple-600 mb-1 flex items-center gap-1">
                                <span>👥</span>
                                Applied Tutors ({request.appliedTutors.length}) - Click card to see all details
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {request.appliedTutors.slice(0, 3).map((applied, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full border border-purple-300"
                                    title={`${applied.tutorProfile?.fullName || applied.tutorId?.email || "Tutor"}${applied.tutorProfile?.phone ? ` - ${applied.tutorProfile.phone}` : ''}`}
                                  >
                                    {applied.tutorProfile?.fullName || applied.tutorId?.email || "Tutor"}
                                  </span>
                                ))}
                                {request.appliedTutors.length > 3 && (
                                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                    +{request.appliedTutors.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          <p className="text-sm text-gray-500 mb-3">
                            Submitted: {new Date(request.createdAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}
                          </p>
                          <div className="pt-2 border-t border-gray-200 flex items-center justify-between gap-3">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${request.status === "posted"
                                ? "bg-green-100 text-green-700 border border-green-300"
                                : request.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                                  : "bg-blue-100 text-blue-700 border border-blue-300"
                                }`}
                            >
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmRequestDelete(request._id);
                              }}
                              className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {pendingParentApps.length === 0 && (
                  <p className="text-gray-600 text-center py-8 col-span-full">
                    No pending parent applications
                  </p>
                )}

                {/* See More Button */}
                {pendingParentApps.length > displayedParentApps && (
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={() => setDisplayedParentApps(displayedParentApps + 10)}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 rounded-lg font-semibold text-white"
                    >
                      See More ({pendingParentApps.length - displayedParentApps} remaining)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "tutor" && (
          <div className="bg-white text-gray-900 rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold">Tutor Applications & Members</h2>
              <button
                onClick={loadData}
                disabled={loading}
                className="px-4 py-2 rounded-lg font-medium transition bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Refresh tutor applications"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner />
              </div>
            ) : (
              <div>
                {/* Tutor Applications Section */}
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">Tutor Applications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
                  {tutorApplications.map((profile) => {
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
                      <div
                        key={profile._id}
                        onClick={() => {
                          setSelectedTutorProfile({
                            profile: profile,
                            userId: profile.userId,
                            email: profile.userId?.email,
                            appliedPosts: profile.appliedPosts || []
                          });
                        }}
                        className="bg-white text-gray-900 p-4 sm:p-6 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-cyan-500 to-green-500 flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow-md">
                            {getInitials(profile.fullName)}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-base sm:text-lg lg:text-xl mb-1">
                              {profile.fullName}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {profile.userId?.email}
                            </p>
                            {profile.phone && (
                              <p className="text-xs sm:text-sm text-gray-600">
                                📞 {profile.phone}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2 mb-3">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold text-cyan-600">Subjects:</span>{" "}
                            {profile.subjects.join(", ")}
                          </p>
                          {profile.appliedPosts && profile.appliedPosts.length > 0 && (
                            <p className="text-sm text-purple-700 font-semibold">
                              📝 Applied to {profile.appliedPosts.length} post{profile.appliedPosts.length !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                        <div className="pt-3 border-t border-gray-200">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${profile.isProfileComplete
                              ? "bg-green-100 text-green-700 border border-green-300"
                              : "bg-yellow-100 text-yellow-700 border border-yellow-300"
                              }`}
                          >
                            {profile.isProfileComplete ? "Complete" : "Incomplete"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {tutorApplications.length === 0 && (
                    <p className="text-gray-600 col-span-full text-center py-8">No tutor applications</p>
                  )}
                </div>

                {/* Tutor Members Section - Circular Avatars */}
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">Tutor Members</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
                  {tutorMembers.map((tutor) => {
                    const getInitials = (name) => {
                      if (!name) return tutor.email?.[0]?.toUpperCase() || "T";
                      return name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2);
                    };
                    return (
                      <div
                        key={tutor._id}
                        onClick={() => {
                          setSelectedTutorProfile(tutor);
                        }}
                        className="flex flex-col items-center cursor-pointer group"
                      >
                        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-r from-cyan-500 to-green-500 flex items-center justify-center text-white text-lg sm:text-xl lg:text-2xl font-bold shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 mb-2 sm:mb-3">
                          {getInitials(tutor.profile?.fullName)}
                        </div>
                        <p className="text-sm font-semibold text-gray-900 text-center group-hover:text-cyan-600 transition">
                          {tutor.profile?.fullName || tutor.email?.split("@")[0]}
                        </p>
                        <p className="text-xs text-gray-600 text-center mt-1">
                          {tutor.profile?.phone || tutor.email}
                        </p>
                      </div>
                    );
                  })}
                  {tutorMembers.length === 0 && (
                    <p className="text-gray-600 col-span-full text-center py-8">No tutor members</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal for Tutor Profile */}
      {selectedTutorProfile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white text-gray-900 rounded-xl shadow-2xl p-4 sm:p-6 lg:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">Tutor Profile</h2>
              <button
                onClick={() => setSelectedTutorProfile(null)}
                className="text-gray-600 hover:text-gray-900 text-2xl sm:text-3xl font-bold"
              >
                ×
              </button>
            </div>

            {selectedTutorProfile.profile ? (
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-gray-200">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-cyan-500 to-green-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg">
                    {(() => {
                      const name = selectedTutorProfile.profile?.fullName;
                      if (!name) return selectedTutorProfile.email?.[0]?.toUpperCase() || "T";
                      return name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2);
                    })()}
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                      {selectedTutorProfile.profile.fullName}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600">{selectedTutorProfile.email}</p>
                    {selectedTutorProfile.profile.phone && (
                      <p className="text-sm sm:text-base text-gray-600">📞 {selectedTutorProfile.profile.phone}</p>
                    )}
                  </div>
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h4 className="text-lg sm:text-xl font-semibold text-cyan-600 mb-3 sm:mb-4">Personal Information</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Full Name</p>
                        <p className="text-gray-900 font-medium">{selectedTutorProfile.profile.fullName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                        <p className="text-gray-900 font-medium">{selectedTutorProfile.profile.phone || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Gender</p>
                        <p className="text-gray-900 font-medium capitalize">{selectedTutorProfile.profile.gender || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Address</p>
                        <p className="text-gray-900 font-medium">{selectedTutorProfile.profile.address || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-semibold text-green-600 mb-4">Teaching Information</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Experience</p>
                        <p className="text-gray-900 font-medium">{selectedTutorProfile.profile.experience || 0} years</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Hourly Rate</p>
                        <p className="text-gray-900 font-medium">₹{selectedTutorProfile.profile.hourlyRate || "0"}/hour</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Preferred Timing</p>
                        <p className="text-gray-900 font-medium">{selectedTutorProfile.profile.preferredTiming || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subjects */}
                {selectedTutorProfile.profile.subjects && selectedTutorProfile.profile.subjects.length > 0 && (
                  <div>
                    <h4 className="text-xl font-semibold text-cyan-600 mb-3">Subjects</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTutorProfile.profile.subjects.map((subject, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-cyan-100 text-cyan-700 border border-cyan-300 rounded-full text-sm font-medium"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Classes */}
                {selectedTutorProfile.profile.classes && selectedTutorProfile.profile.classes.length > 0 && (
                  <div>
                    <h4 className="text-xl font-semibold text-green-600 mb-3">Classes</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTutorProfile.profile.classes.map((cls, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-green-100 text-green-700 border border-green-300 rounded-full text-sm font-medium"
                        >
                          {cls}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Locations */}
                {selectedTutorProfile.profile.availableLocations && selectedTutorProfile.profile.availableLocations.length > 0 && (
                  <div>
                    <h4 className="text-xl font-semibold text-purple-600 mb-3">Available Locations</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTutorProfile.profile.availableLocations.map((location, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-100 text-purple-700 border border-purple-300 rounded-full text-sm font-medium"
                        >
                          {location}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bio */}
                {selectedTutorProfile.profile.bio && (
                  <div>
                    <h4 className="text-xl font-semibold text-gray-800 mb-3">Bio</h4>
                    <p className="text-gray-700 leading-relaxed">{selectedTutorProfile.profile.bio}</p>
                  </div>
                )}

                {/* Achievements */}
                {selectedTutorProfile.profile.achievements && (
                  <div>
                    <h4 className="text-xl font-semibold text-gray-800 mb-3">Achievements</h4>
                    <p className="text-gray-700 leading-relaxed">{selectedTutorProfile.profile.achievements}</p>
                  </div>
                )}

                {/* Applied Posts */}
                {selectedTutorProfile.appliedPosts && selectedTutorProfile.appliedPosts.length > 0 && (
                  <div>
                    <h4 className="text-xl font-semibold text-purple-600 mb-3">
                      Applied Posts ({selectedTutorProfile.appliedPosts.length})
                    </h4>
                    <div className="space-y-3">
                      {selectedTutorProfile.appliedPosts.map((post) => (
                        <div
                          key={post._id}
                          className="p-4 bg-purple-50 border border-purple-200 rounded-lg"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-gray-900 mb-1">
                                {post.parentName} - Grade {post.studentGrade}
                              </p>
                              <p className="text-sm text-gray-700 mb-2">
                                <span className="font-semibold">Subjects:</span>{" "}
                                {Array.isArray(post.subjects) ? post.subjects.join(", ") : post.subjects}
                              </p>
                              <p className="text-xs text-gray-500">
                                Applied: {new Date(post.createdAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${post.status === "posted"
                                  ? "bg-green-100 text-green-700 border border-green-300"
                                  : post.status === "pending"
                                    ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                                    : "bg-gray-100 text-gray-700 border border-gray-300"
                                  }`}
                              >
                                {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                              </span>
                              <button
                                onClick={() => confirmRequestDelete(post._id)}
                                className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Profile not completed yet.</p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedTutorProfile(null)}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold text-gray-900 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Editing Request */}
      {selectedRequest && editFormData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-cyan-500/30 rounded-xl p-4 sm:p-6 lg:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Edit Request</h2>
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setEditFormData(null);
                }}
                className="text-white/70 hover:text-white text-2xl sm:text-3xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Parent Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 mb-2">Parent Name *</label>
                  <input
                    type="text"
                    value={editFormData.parentName}
                    onChange={(e) => handleEditChange("parentName", e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-white/80 mb-2">Email (Optional)</label>
                  <input
                    type="email"
                    value={editFormData.parentEmail}
                    onChange={(e) => handleEditChange("parentEmail", e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-white/80 mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={editFormData.parentPhone}
                    onChange={(e) => handleEditChange("parentPhone", e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-white/80 mb-2">Student Grade *</label>
                  <input
                    type="text"
                    value={editFormData.studentGrade}
                    onChange={(e) => handleEditChange("studentGrade", e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Subjects */}
              <div>
                <label className="block text-white/80 mb-2">Subjects *</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={editFormData.subjectInput || ""}
                    onChange={(e) => handleEditChange("subjectInput", e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSubject())}
                    placeholder="Add subject"
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubject}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg text-white font-semibold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editFormData.subjects.map((subject, index) => (
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

              {/* Location & Timing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 mb-2">Preferred Location *</label>
                  <input
                    type="text"
                    value={editFormData.preferredLocation}
                    onChange={(e) => handleEditChange("preferredLocation", e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-white/80 mb-2">Preferred Timing *</label>
                  <input
                    type="text"
                    value={editFormData.preferredTiming}
                    onChange={(e) => handleEditChange("preferredTiming", e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Frequency, Budget, Teacher Experience & Gender */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-white/80 mb-2">Frequency *</label>
                  <select
                    value={editFormData.frequency}
                    onChange={(e) => handleEditChange("frequency", e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/80 mb-2">Budget *</label>
                  <input
                    type="text"
                    value={editFormData.budget}
                    onChange={(e) => handleEditChange("budget", e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-white/80 mb-2">Teacher Experience (yr) *</label>
                  <input
                    type="number"
                    value={editFormData.teacherExperience}
                    onChange={(e) => handleEditChange("teacherExperience", e.target.value)}
                    min="0"
                    max="50"
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-white/80 mb-2">Tutor Gender</label>
                  <select
                    value={editFormData.preferredTutorGender}
                    onChange={(e) => handleEditChange("preferredTutorGender", e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="any">Any Gender</option>
                    <option value="male">Male Tutor</option>
                    <option value="female">Female Tutor</option>
                  </select>
                </div>
              </div>

              {/* Additional Requirements */}
              <div>
                <label className="block text-white/80 mb-2">Additional Requirements</label>
                <textarea
                  value={editFormData.additionalRequirements}
                  onChange={(e) => handleEditChange("additionalRequirements", e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Applied Tutors Section */}
              {selectedRequest.appliedTutors && selectedRequest.appliedTutors.length > 0 && (
                <div className="border-t border-cyan-500/30 pt-4">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span>👥</span>
                    Applied Tutors ({selectedRequest.appliedTutors.length})
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedRequest.appliedTutors.map((applied, idx) => (
                      <div
                        key={idx}
                        className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-semibold text-white text-sm mb-1">
                              {applied.tutorProfile?.fullName || applied.tutorId?.email || "Tutor"}
                            </p>
                            {applied.tutorProfile?.phone && (
                              <p className="text-xs text-white/70 mb-1">
                                📞 {applied.tutorProfile.phone}
                              </p>
                            )}
                            {applied.tutorId?.email && (
                              <p className="text-xs text-white/70 mb-1">
                                ✉️ {applied.tutorId.email}
                              </p>
                            )}
                            {applied.tutorProfile?.subjects && applied.tutorProfile.subjects.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {applied.tutorProfile.subjects.slice(0, 3).map((subject, sIdx) => (
                                  <span
                                    key={sIdx}
                                    className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded"
                                  >
                                    {subject}
                                  </span>
                                ))}
                                {applied.tutorProfile.subjects.length > 3 && (
                                  <span className="text-xs text-white/50">
                                    +{applied.tutorProfile.subjects.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-semibold ${applied.status === "accepted"
                                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                : applied.status === "rejected"
                                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                  : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                                }`}
                            >
                              {applied.status?.charAt(0).toUpperCase() + applied.status?.slice(1) || "Pending"}
                            </span>
                            {applied.appliedAt && (
                              <p className="text-xs text-white/50 mt-1">
                                Applied: {new Date(applied.appliedAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Field Visibility Controls */}
              <div className="border-t border-cyan-500/30 pt-4">
                <p className="text-white/80 font-semibold mb-3">Field Visibility (Show/Hide for tutors):</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {[
                    { key: "parentName", label: "Parent Name" },
                    { key: "parentEmail", label: "Email" },
                    { key: "parentPhone", label: "Phone" },
                    { key: "studentGrade", label: "Student Grade" },
                    { key: "subjects", label: "Subjects" },
                    { key: "preferredLocation", label: "Location" },
                    { key: "preferredTiming", label: "Timing" },
                    { key: "frequency", label: "Frequency" },
                    { key: "budget", label: "Budget" },
                    { key: "preferredTutorGender", label: "Tutor Gender" },
                    { key: "teacherExperience", label: "Teacher Experience" },
                    { key: "additionalRequirements", label: "Requirements" },
                  ].map((field) => (
                    <label
                      key={field.key}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={editFormData.fieldVisibility[field.key] !== false}
                        onChange={(e) =>
                          handleEditChange("fieldVisibility", {
                            ...editFormData.fieldVisibility,
                            [field.key]: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-cyan-500 rounded focus:ring-cyan-500"
                      />
                      <span className="text-xs text-white/80">{field.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-cyan-500/30">
                <button
                  onClick={handleSaveRequest}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 rounded-lg font-semibold text-white shadow-lg"
                >
                  Save Changes
                </button>
                {selectedRequest.status === "pending" && (
                  <button
                    onClick={() => handlePostRequest(selectedRequest._id)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg font-semibold text-white shadow-lg"
                  >
                    Save & Post
                  </button>
                )}
                <button
                  onClick={() => confirmRequestDelete(selectedRequest._id)}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-white"
                >
                  Delete Post
                </button>
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setEditFormData(null);
                  }}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, messageId: null })}
        onConfirm={handleConfirmedDelete}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
        confirmText="Delete Message"
        cancelText="Cancel"
        type="danger"
      />

      <ConfirmDialog
        isOpen={requestDeleteConfirm.isOpen}
        onClose={() => setRequestDeleteConfirm({ isOpen: false, requestId: null })}
        onConfirm={handleConfirmedRequestDelete}
        title="Delete Tutor Request"
        message="Are you sure you want to delete this tutor request? It will be removed from the tutor dashboard."
        confirmText="Delete Request"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
