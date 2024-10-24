// This file is auto-generated by @hey-api/openapi-ts

import { createClient, createConfig, type Options } from '@hey-api/client-axios';
import type {
  GetUserSubscriptionsSubscriptionsGetData,
  GetUserSubscriptionsSubscriptionsGetError,
  GetUserSubscriptionsSubscriptionsGetResponse,
  SubscribeHoldSubscriptionPostData,
  SubscribeHoldSubscriptionPostError,
  SubscribeHoldSubscriptionPostResponse,
  UnsubscribeHoldSubscriptionDeleteData,
  UnsubscribeHoldSubscriptionDeleteError,
  UnsubscribeHoldSubscriptionDeleteResponse,
  RefreshActiveHoldSubscriptionsHoldRefreshPostError,
  RefreshActiveHoldSubscriptionsHoldRefreshPostResponse,
  HoldSubscriptionMessagesHoldMessageGetData,
  HoldSubscriptionMessagesHoldMessageGetError,
  HoldSubscriptionMessagesHoldMessageGetResponse,
  RefreshSubsRefreshPostError,
  RefreshSubsRefreshPostResponse,
  SubscribeVouchersSubscriptionPostData,
  SubscribeVouchersSubscriptionPostError,
  SubscribeVouchersSubscriptionPostResponse,
  CancelVouchersSubscriptionsVouchersSubscriptionDeleteData,
  CancelVouchersSubscriptionsVouchersSubscriptionDeleteError,
  CancelVouchersSubscriptionsVouchersSubscriptionDeleteResponse,
  RefreshActiveVouchersSubscriptionsVouchersRefreshPostError,
  RefreshActiveVouchersSubscriptionsVouchersRefreshPostResponse,
} from './types.gen';

export const client = createClient(createConfig());

/**
 * Get User Subscriptions
 */
export const getUserSubscriptionsSubscriptionsGet = <ThrowOnError extends boolean = false>(
  options: Options<GetUserSubscriptionsSubscriptionsGetData, ThrowOnError>,
) => {
  return (options?.client ?? client).get<
    GetUserSubscriptionsSubscriptionsGetResponse,
    GetUserSubscriptionsSubscriptionsGetError,
    ThrowOnError
  >({
    ...options,
    url: '/subscriptions',
  });
};

/**
 * Subscribe
 * Subscribe to a plan
 */
export const subscribeHoldSubscriptionPost = <ThrowOnError extends boolean = false>(
  options: Options<SubscribeHoldSubscriptionPostData, ThrowOnError>,
) => {
  return (options?.client ?? client).post<
    SubscribeHoldSubscriptionPostResponse,
    SubscribeHoldSubscriptionPostError,
    ThrowOnError
  >({
    ...options,
    url: '/hold/subscription',
  });
};

/**
 * Unsubscribe
 * Unsubscribe of an existing subscription
 */
export const unsubscribeHoldSubscriptionDelete = <ThrowOnError extends boolean = false>(
  options: Options<UnsubscribeHoldSubscriptionDeleteData, ThrowOnError>,
) => {
  return (options?.client ?? client).delete<
    UnsubscribeHoldSubscriptionDeleteResponse,
    UnsubscribeHoldSubscriptionDeleteError,
    ThrowOnError
  >({
    ...options,
    url: '/hold/subscription',
  });
};

/**
 * Refresh Active Hold Subscriptions
 * Delete existing active hold subscriptions if not enough tokens held in the wallet
 */
export const refreshActiveHoldSubscriptionsHoldRefreshPost = <ThrowOnError extends boolean = false>(
  options?: Options<unknown, ThrowOnError>,
) => {
  return (options?.client ?? client).post<
    RefreshActiveHoldSubscriptionsHoldRefreshPostResponse,
    RefreshActiveHoldSubscriptionsHoldRefreshPostError,
    ThrowOnError
  >({
    ...options,
    url: '/hold/refresh',
  });
};

/**
 * Hold Subscription Messages
 * Returns the messages to sign to authenticate other actions
 */
export const holdSubscriptionMessagesHoldMessageGet = <ThrowOnError extends boolean = false>(
  options: Options<HoldSubscriptionMessagesHoldMessageGetData, ThrowOnError>,
) => {
  return (options?.client ?? client).get<
    HoldSubscriptionMessagesHoldMessageGetResponse,
    HoldSubscriptionMessagesHoldMessageGetError,
    ThrowOnError
  >({
    ...options,
    url: '/hold/message',
  });
};

/**
 * Refresh
 * Cancel existing unpaid subscriptions and creating newly paid ones
 */
export const refreshSubsRefreshPost = <ThrowOnError extends boolean = false>(
  options?: Options<unknown, ThrowOnError>,
) => {
  return (options?.client ?? client).post<RefreshSubsRefreshPostResponse, RefreshSubsRefreshPostError, ThrowOnError>({
    ...options,
    url: '/subs/refresh',
  });
};

/**
 * Subscribe
 * Create one or multiple vouchers subscriptions
 */
export const subscribeVouchersSubscriptionPost = <ThrowOnError extends boolean = false>(
  options: Options<SubscribeVouchersSubscriptionPostData, ThrowOnError>,
) => {
  return (options?.client ?? client).post<
    SubscribeVouchersSubscriptionPostResponse,
    SubscribeVouchersSubscriptionPostError,
    ThrowOnError
  >({
    ...options,
    url: '/vouchers/subscription',
  });
};

/**
 * Cancel Vouchers Subscriptions
 * Stop some vouchers subscriptions
 */
export const cancelVouchersSubscriptionsVouchersSubscriptionDelete = <ThrowOnError extends boolean = false>(
  options: Options<CancelVouchersSubscriptionsVouchersSubscriptionDeleteData, ThrowOnError>,
) => {
  return (options?.client ?? client).delete<
    CancelVouchersSubscriptionsVouchersSubscriptionDeleteResponse,
    CancelVouchersSubscriptionsVouchersSubscriptionDeleteError,
    ThrowOnError
  >({
    ...options,
    url: '/vouchers/subscription',
  });
};

/**
 * Refresh Active Vouchers Subscriptions
 * Check existing vouchers subscriptions to stop if the end_date is passed
 */
export const refreshActiveVouchersSubscriptionsVouchersRefreshPost = <ThrowOnError extends boolean = false>(
  options?: Options<unknown, ThrowOnError>,
) => {
  return (options?.client ?? client).post<
    RefreshActiveVouchersSubscriptionsVouchersRefreshPostResponse,
    RefreshActiveVouchersSubscriptionsVouchersRefreshPostError,
    ThrowOnError
  >({
    ...options,
    url: '/vouchers/refresh',
  });
};