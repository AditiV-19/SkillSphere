import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000/api/v1",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;

export const registerUser = (userData) => {
  return API.post("/register", userData);
};

export const loginUser = (userData) => {
  return API.post("/login", userData);
};

export const verifyEmail = (token) => {
  return API.get(`/verify-email/${token}`);
};

export const getProfile = (role) => {
  return API.get(`/profile/${role}`);
};

export const updateProfile = (profileData, role) => {
  return API.put(`/profile/${role}`, profileData);
};

export const uploadProfileImage = (imageFile) => {
  const formData = new FormData();

  formData.append("image", imageFile);
  
  return API.post("/users/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const uploadResumeToServer = (file) => {
  const formData = new FormData();
  formData.append("resume", file);
  return API.post("/users/upload/resume", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};


//Gigs
export const createGig = (gigData) => {
  return API.post(`/client/gig`, gigData);
};
export const getGigs = () => {
  return API.get(`/client/gig`);
};
export const getGigById = (id) => {
  return API.get(`/client/gig/${id}`);
};
export const updateGig = (gigData, id) => {
  return API.put(`/client/gig/${id}`, gigData);
};
export const deleteGig = (id) => {
  return API.delete(`/client/gig/${id}`);
};


//Browse Freelancer

export const getAllFreelancers = () => {
  return API.get("/profile/client/all-freelancers");
};
export const getFreelancerById = (id) => {
  return API.get(`/profile/client/freelancer/${id}`);
};

// invite freelancer
export const inviteFreelancerToGig = (gigId, freelancerUserId) =>{
  return API.patch(`/client/gig/${gigId}/invite`, { freelancerUserId });
}

// invitations on freelancer side
export const getFreelancerInvitations = () => {
  return API.get("/client/gig/freelancer/invitations");
};


// Apply to gig/ Gig Proposals
export const submitGigProposal = (gigId, proposalData) => {
  return API.post(`/client/gig/${gigId}/apply`, proposalData);
};
export const updateFreelancerProposal = (proposalId, updatedData) => {
  return API.put(`/client/gig/proposals/${proposalId}`, updatedData);
};
export const getFreelancerApplications = () => {
  return API.get("/client/gig/freelancer/applications/all"); 
};
export const updateProposalStatus = (proposalId, status) => {
  return API.patch(`/client/gig/proposals/${proposalId}/status`, { status });
};
export const getCompanyApplicationsDeck = () => {
  return API.get("/client/gig/applications/all"); 
};

// Assigned Gigs for freelancer
export const getAssignedGigs = () => {
  return API.get("/client/gig/freelancer/assigned-gigs");
};

// Track progress
export const getGigProgress = (gigId) => api.get(`/gigs/${gigId}/progress`);
export const updateMilestoneStatus = (gigId, milestoneId, status) =>
  api.patch(`/gigs/${gigId}/milestones/${milestoneId}`, { status });