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

export const googleLogin = (payload) => {
  return API.post("/google", payload)
}

export const verifyEmail = (token) => {
  return API.get(`/verify-email/${token}`);
};

export const getProfile = (role) => {
  if(role !== 'admin') return API.get(`/profile/${role}`);
  else return `admin`
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
export const inviteFreelancerToGig = (gigId, freelancerUserId) => {
  return API.patch(`/client/gig/${gigId}/invite`, { freelancerUserId });
};

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

// Assigned Gigs for freelancer and Active gigs for client
export const getAssignedGigs = () => {
  return API.get("/client/gig/freelancer/assigned-gigs");
};
export const getActiveGigs = () => {
  return API.get("/client/gig/client/active-gigs");
};

// Track progress
export const getGigProgress = (gigId) => {
  return API.get(`/client/gig/${gigId}/progress`);
};
export const updateMilestoneStatus = (gigId, milestoneId, status) => {
  return API.patch(`/client/gig/${gigId}/milestones/${milestoneId}`, {
    status,
  });
};

export const uploadProjectFile = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return API.post("/users/upload/file", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateMilestoneDeadline = (gigId, milestoneId, dueDate) => {
  return API.patch(`/client/gig/${gigId}/milestones/${milestoneId}/deadline`, {
    dueDate,
  });
};
export const addProgressLog = (gigId, payload) => {
  return API.post(`/client/gig/${gigId}/logs`, payload);
};
export const getProgressLogs = (gigId) => {
  return API.get(`/client/gig/${gigId}/logs`);
};

// Reviews
export const submitReview = (reviewData) => {
  return API.post("/reviews", reviewData);
};
export const getUserReviews = (userId) => {
  return API.get(`/reviews/user/${userId}`);
};

export const getGigReviewStatus = (gigId) => {
  return API.get(`/reviews/review/${gigId}`);
};
export const getReviewAnalytics = (userId) => {
  return API.get(`/reviews/analytics/${userId}`);
};

//Search
export const searchFreelancers = (params) => {
  return API.get("/profile/freelancer/search", { params });
};
export const searchGigs = (params) => {
  return API.get("/client/gig/search", { params });
};

// Chat
export const startConversation = (receiverId) => {
  return API.post("/chat/start", { receiverId });
};
export const getConversations = () => {
  return API.get("/chat/conversations");
};
export const getMessages = (conversationId) => {
  return API.get(`/chat/messages/${conversationId}`);
};
export const markMessagesAsRead = (conversationId) => {
  return API.put(`/chat/read/${conversationId}`);
};
export const uploadChatFile = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return API.post("/users/upload/chatFile", formData, { 
    headers: { "Content-Type": "multipart/form-data" },
    },
  );
};

// Notification
export const getNotifications = () => {
  return API.get("/notifications");
};

export const getUnreadCount = () => {
  return API.get("/notifications/unread-count");
};

export const markAsRead = (id) => {
  return API.put(`/notifications/${id}/read`);
};

export const markAllAsRead = () => {
  return API.put("/notifications/read-all");
};

export const deleteNotification = (id) => {
  return API.delete(`/notifications/${id}`);
};


// Payment

export const createPaymentOrder = (gigId, milestoneId) =>{
  return API.post("/payments/create-order", { gigId, milestoneId });
}
export const verifyPayment = (data) => {
  return API.post("/payments/verify", data);
}
export const releaseMilestone = (paymentId) =>{
  return API.patch(`/payments/${paymentId}/release`);
}
export const refundPayment = (paymentId, reason) =>{
  return API.patch(`/payments/${paymentId}/refund`, { reason });
}
export const getMyTransactions = (params) =>{
  return API.get("/payments/my-transactions", { params });
}
export const getGigPayments = (gigId) => {
  return API.get(`/payments/gig/${gigId}`);
}


// Admin Dashboard
export const getAdminUsers = (params) => {
  return API.get("/admin/users", { params });
}
export const suspendUser = (id, reason) => {
  return API.patch(`/admin/users/${id}/suspend`, { reason });
}
export const unsuspendUser = (id) => {
  return API.patch(`/admin/users/${id}/unsuspend`);
}
export const verifyFreelancer = (id) => {
  return API.patch(`/admin/users/${id}/verify`);
}

export const getPendingGigs = (params) => {
  return API.get("/admin/gigs/pending", {params});
}
export const approveGig = (id) => {
  return API.patch(`/admin/gigs/${id}/approve`);
}
export const rejectGig = (id, reason) => {
  return API.patch(`/admin/gigs/${id}/reject`, { reason });
}

export const getAdminPayments = (params) => {
  return API.get("/admin/payments", { params });
}
export const getFraudFlags = () => {
  return API.get("/admin/payments/fraud-flags");
}

export const getAnalytics = () => {
  return API.get("/admin/analytics");
}
export const getAdminFreelancerById = (id) => {
  return API.get(`/admin/freelancer/${id}`);
};


// Availability(Booking system)

export const addAvailabilitySlots = (slots) =>{
  return API.post("/availability/slots", { slots });
}
export const getMySchedule = () =>{
  return API.get("/availability/my-schedule");
}
export const cancelMySlot = (slotId) =>{
  return API.patch(`/availability/my-schedule/slots/${slotId}/cancel`);
}

export const bookFreelancerSlot = (freelancerUserId, slotId) =>{
  return API.post(`/availability/${freelancerUserId}/slots/${slotId}/book`);
}
export const cancelBooking = (freelancerUserId, slotId) =>{
  return API.patch(`/availability/${freelancerUserId}/slots/${slotId}/cancel`);
}