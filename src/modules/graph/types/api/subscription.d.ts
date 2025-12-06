export type SubscriptionData = {
  _id: string;
  createdAt: string;
  credits: number;
  duration: number;
  name: string;
  pricing: number;
  updatedAt: string;
  details: string[];
  isPopular: boolean;
  subtitle: string;
};

export type UserSubscriptionData = {
  _id: string;
  userId: string;
  creditsRemaining: number;
  subscriptionId: string;
  subscription: SubscriptionData;
  updatedAt: string;
  createdAt: string;
};
