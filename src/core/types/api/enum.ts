export enum UserTypeEnum {
    ADMIN = 'ADMIN',
    USER = 'USER',
}

export const UserSubscriptionStatus = {
  ACTIVE: 'ACTIVE', // Stripe: active
  TRIALING: 'TRIALING', // Stripe: trialing
  PAYMENT_PENDING: 'PAYMENT_PENDING', // Stripe: incomplete
  RETRYING_PAST_DUE: 'RETRYING_PAST_DUE', // Stripe: past_due
  CANCELED: 'CANCELED', // Stripe: canceled
  EXPIRED: 'EXPIRED', // Stripe: incomplete_expired
  SUSPENDED_UNPAID: 'SUSPENDED_UNPAID', // Stripe: unpaid
}

export const unvailableStatuses = [
  UserSubscriptionStatus.CANCELED,
  UserSubscriptionStatus.EXPIRED,
  UserSubscriptionStatus.SUSPENDED_UNPAID,
]
export const availableStatuses = [
  UserSubscriptionStatus.ACTIVE,
  UserSubscriptionStatus.TRIALING,
  UserSubscriptionStatus.PAYMENT_PENDING,
  UserSubscriptionStatus.RETRYING_PAST_DUE,
];