export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  isEmailVerified?: boolean;
  isVerified?: boolean;
  aadhaarNumber?: string;
  aadhaarName?: string;
}

export interface Fund {
  _id: string;
  creatorId: string;
  title: string;
  category: string;
  description?: string;
  targetAmount: number;
  amountCollected: number;
  donorCount?: number;
  ngoName?: string;
  beneficiary?: {
    name: string;
    contact?: string;
    relation?: string;
  };
  documents?: { url: string; type: string }[];
  photos?: { url: string; alt?: string }[];
  location?: string;
  emergency: boolean;
  status: 'Pending' | 'Verified' | 'Active' | 'Completed' | 'Rejected';
  deadline?: string;
  breakdownItems?: {
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    image?: { url: string; alt?: string };
  }[];
  updates?: {
    _id: string;
    title: string;
    content: string;
    image?: { url: string };
    createdAt: string;
  }[];
  hospitalEscrow?: {
    hospitalName?: string;
    accountNumber?: string;
    ifscCode?: string;
    isDirectPayoutEnabled: boolean;
    disbursedAmount: number;
  };
  milestones?: {
    _id: string;
    title: string;
    targetAmount: number;
    description?: string;
    status: 'Locked' | 'Active' | 'Released';
    approvals: string[];
  }[];
  preVerifiedRegistryId?: string;
  parentFundId?: string;
  badges?: string[]; // e.g. ["Tax Benefit", "Assured", "Verified"]
  recentDonations?: Donation[];
  createdAt: string;
  updatedAt: string;
}

export interface Donation {
  _id: string;
  fundId: string;
  donorId?: string;
  donorName: string;
  donorEmail?: string;
  amount: number;
  currency: string;
  paymentStatus: 'pending' | 'success' | 'failed';
  comment?: string;
  isAnonymous?: boolean;
  isPrivateMode?: boolean;
  matchingPartner?: string;
  createdAt: string;
}

export interface Subscription {
  _id: string;
  userId: string;
  amount: number;
  status: 'Active' | 'Paused' | 'Cancelled';
  lastBillingDate: string;
  nextBillingDate: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  error: string;
  errors?: { field: string; message: string }[];
}
