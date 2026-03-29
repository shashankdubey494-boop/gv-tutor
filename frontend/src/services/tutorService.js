import { apiRequest, apiFormDataRequest } from "./api";

/**
 * CREATE TUTOR REQUEST (Parent/Student - No auth required)
 */
export function createTutorRequest(formData) {
  return apiRequest("/api/tutor-requests", {
    method: "POST",
    body: JSON.stringify(formData),
  });
}

/**
 * GET POSTED TUTOR REQUESTS (Tutors - Auth required)
 */
export function getPostedTutorRequests() {
  return apiRequest("/api/tutor-requests/posted", {
    method: "GET",
  });
}

function buildTutorProfilePayload(data) {
  return {
    fullName: data.fullName,
    phone: data.phone,
    gender: typeof data.gender === "string" ? data.gender.toLowerCase() : data.gender,
    address: data.address,
    experience:
      typeof data.experience === "number" ? data.experience : parseInt(String(data.experience), 10),
    subjects: data.subjects,
    classes: data.classes,
    availableLocations: data.availableLocations,
    preferredTiming: data.preferredTiming,
    hourlyRate:
      typeof data.hourlyRate === "number" ? data.hourlyRate : parseFloat(String(data.hourlyRate)),
    bio: data.bio || "",
    achievements: data.achievements || "",
  };
}

/**
 * CREATE/UPDATE TUTOR PROFILE (fields only — no file in this request).
 */
export function createOrUpdateTutorProfile(data) {
  const payload = buildTutorProfilePayload(data);
  return apiRequest("/api/tutor-profile", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Upload or replace resume only (call after profile exists / is complete).
 */
export function uploadTutorResumeFile(file) {
  const fd = new FormData();
  fd.append("resume", file);
  return apiFormDataRequest("/api/tutor-profile/resume", fd, "POST");
}

/**
 * Saves profile first, then tries resume upload if a file was chosen.
 * Profile save is required; resume is best-effort — failures do not throw.
 * Returns { profileResponse, resumeUploaded, resumeError }.
 */
export async function saveTutorProfileWithOptionalResume(data, resumeFile) {
  const profileResponse = await createOrUpdateTutorProfile(data);
  if (!profileResponse?.success || !resumeFile) {
    return {
      profileResponse,
      resumeUploaded: false,
      resumeError: null,
    };
  }
  try {
    await uploadTutorResumeFile(resumeFile);
    return {
      profileResponse,
      resumeUploaded: true,
      resumeError: null,
    };
  } catch (err) {
    return {
      profileResponse,
      resumeUploaded: false,
      resumeError: err.message || "Resume could not be uploaded",
    };
  }
}

/**
 * GET TUTOR PROFILE
 */
export function getTutorProfile() {
  return apiRequest("/api/tutor-profile", {
    method: "GET",
  });
}

/**
 * APPLY TO TUTOR REQUEST (Tutor applies to a posted request)
 */
export function applyToTutorRequest(requestId) {
  return apiRequest(`/api/tutor-requests/${requestId}/apply`, {
    method: "POST",
  });
}

export function hideTutorRequest(requestId) {
  return apiRequest(`/api/tutor-requests/${requestId}/hide`, {
    method: "POST",
  });
}
