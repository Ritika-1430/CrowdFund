import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export const authApi = {
  signup: (data: { name: string; email: string; password: string }) =>
    axios.post(`${API_URL}/auth/signup`, data),
  login: (data: { email: string; password: string }) =>
    axios.post(`${API_URL}/auth/login`, data),
  me: () =>
    axios.get(`${API_URL}/auth/me`, { headers: authHeader() }),
};

export const fundApi = {
  create: (data: any) =>
    axios.post(`${API_URL}/funds`, data, { headers: authHeader() }),
  list: (params?: { category?: string; status?: string; page?: number; limit?: number }) =>
    axios.get(`${API_URL}/funds`, { params }),
  getUserFunds: () =>
    axios.get(`${API_URL}/funds/user/my-funds`, { headers: authHeader() }),
  getStatsSummary: () =>
    axios.get(`${API_URL}/funds/stats/summary`),
  get: (id: string) =>
    axios.get(`${API_URL}/funds/${id}`),
  addUpdate: (id: string, data: { title: string; content: string; image?: string }) =>
    axios.post(`${API_URL}/funds/${id}/updates`, data, { headers: authHeader() }),
  getPending: (status?: string, page = 1) =>
    axios.get(`${API_URL}/funds/admin/pending`, { params: { status, page }, headers: authHeader() }),
  updateStatus: (id: string, status: string) =>
    axios.post(`${API_URL}/funds/${id}/status`, { status }, { headers: authHeader() }),
  translate: (data: { title: string; description: string; targetLanguage: string }) =>
    axios.post(`${API_URL}/funds/translate`, data),
  optimize: (data: { title: string; description: string }) =>
    axios.post(`${API_URL}/funds/optimize`, data),
  preVerify: (registryId: string) =>
    axios.post(`${API_URL}/funds/pre-verify`, { registryId }),
  approveMilestone: (id: string, milestoneId: string) =>
    axios.post(`${API_URL}/funds/${id}/milestones/${milestoneId}/approve`, {}, { headers: authHeader() }),
};

export const donationApi = {
  donate: (data: { fundId: string; donorName?: string; amount: number; comment?: string; isAnonymous?: boolean; isPrivateMode?: boolean; matchingPartner?: string; request80G?: boolean; panNumber?: string; email?: string; mobile?: string }) =>
    axios.post(`${API_URL}/donations`, data, {
      headers: localStorage.getItem('token') ? authHeader() : {},
    }),
  initiateSecurePay: (data: { fundId: string; amount: number }) =>
    axios.post(`${API_URL}/donations/securepay/initiate`, data, {
      headers: localStorage.getItem('token') ? authHeader() : {},
    }),
  verifySecurePay: (data: {
    fundId: string;
    amount: number;
    orderId: string;
    signature: string;
    timestamp: string;
    donorName?: string;
    comment?: string;
    isAnonymous?: boolean;
    isPrivateMode?: boolean;
    matchingPartner?: string;
    request80G?: boolean;
    panNumber?: string;
    email?: string;
    mobile?: string;
  }) =>
    axios.post(`${API_URL}/donations/securepay/verify`, data, {
      headers: localStorage.getItem('token') ? authHeader() : {},
    }),
  getFundDonations: (fundId: string, page = 1) =>
    axios.get(`${API_URL}/donations/${fundId}`, { params: { page } }),
  getRecentGlobalDonations: () =>
    axios.get(`${API_URL}/donations/recent/global`),
  getTopDonors: () =>
    axios.get(`${API_URL}/donations/leaderboard/top`),
  getMyDonations: () =>
    axios.get(`${API_URL}/donations/my`, { headers: authHeader() }),
};

export const subscriptionApi = {
  subscribe: (amount: number) =>
    axios.post(`${API_URL}/subscriptions`, { amount }, { headers: authHeader() }),
  mySubscriptions: () =>
    axios.get(`${API_URL}/subscriptions/my`, { headers: authHeader() }),
  toggleStatus: (id: string, status: string) =>
    axios.put(`${API_URL}/subscriptions/${id}`, { status }, { headers: authHeader() }),
};

export const verifyApi = {
  verifyAadhaar: (data: { aadhaarNumber: string; name: string; phone: string; fileName?: string }) =>
    axios.post(`${API_URL}/verify/aadhaar`, data, { headers: authHeader() }),
  sendAadhaarOtp: (data: { aadhaarNumber: string; name: string; phone: string }) =>
    axios.post(`${API_URL}/verify/aadhaar/send-otp`, data, { headers: authHeader() }),
  verifyAadhaarOtp: (data: { verificationId: string; otp: string }) =>
    axios.post(`${API_URL}/verify/aadhaar/verify-otp`, data, { headers: authHeader() }),
};

export const adminApi = {
  // Dashboard analytics
  getStats: () =>
    axios.get(`${API_URL}/admin/stats`, { headers: authHeader() }),

  // User management
  listUsers: (params?: { search?: string; role?: string; page?: number; limit?: number }) =>
    axios.get(`${API_URL}/admin/users`, { params, headers: authHeader() }),
  getUser: (id: string) =>
    axios.get(`${API_URL}/admin/users/${id}`, { headers: authHeader() }),
  updateUser: (id: string, data: { name?: string; email?: string; role?: string; isVerified?: boolean; password?: string }) =>
    axios.put(`${API_URL}/admin/users/${id}`, data, { headers: authHeader() }),
  deleteUser: (id: string) =>
    axios.delete(`${API_URL}/admin/users/${id}`, { headers: authHeader() }),

  // Campaign management
  listCampaigns: (params?: { search?: string; status?: string; category?: string; page?: number; limit?: number }) =>
    axios.get(`${API_URL}/admin/campaigns`, { params, headers: authHeader() }),
  updateCampaign: (id: string, data: any) =>
    axios.put(`${API_URL}/admin/campaigns/${id}`, data, { headers: authHeader() }),
  deleteCampaign: (id: string) =>
    axios.delete(`${API_URL}/admin/campaigns/${id}`, { headers: authHeader() }),

  // Donation management
  listDonations: (params?: { search?: string; status?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) =>
    axios.get(`${API_URL}/admin/donations`, { params, headers: authHeader() }),
  deleteDonation: (id: string) =>
    axios.delete(`${API_URL}/admin/donations/${id}`, { headers: authHeader() }),

  // Excel export — returns blob
  exportUsers: () =>
    axios.get(`${API_URL}/admin/export/users`, { headers: authHeader(), responseType: 'blob' }),
  exportCampaigns: () =>
    axios.get(`${API_URL}/admin/export/campaigns`, { headers: authHeader(), responseType: 'blob' }),
  exportDonations: () =>
    axios.get(`${API_URL}/admin/export/donations`, { headers: authHeader(), responseType: 'blob' }),
};

