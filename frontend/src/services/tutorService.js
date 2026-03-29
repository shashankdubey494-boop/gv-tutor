import { apiRequest } from "./api";

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

/**
 * CREATE/UPDATE TUTOR PROFILE
 */
export function createOrUpdateTutorProfile(formData) {
  const isFormData = typeof FormData !== "undefined" && formData instanceof FormData;
  return apiRequest("/api/tutor-profile", {
    method: "POST",
    body: isFormData ? formData : JSON.stringify(formData),
  });
}

/**
 * UPLOAD TUTOR RESUME ONLY
 */
export function uploadTutorResume(formData) {
  return apiRequest("/api/tutor-profile/resume", {
    method: "POST",
    body: formData,
  });
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


