import apiClient from "@/common/api/client";
import type { ApiResponse } from "@/types";

export type PaymentOrderStatus = "PENDING" | "PAID" | "FAILED" | "CANCELED";

export interface TravelerRequest {
  fullName: string;
  birthDate: string;
  gender: "M" | "F";
  passportNumber: string;
  passportExpiry: string;
  phone?: string;
  representative: boolean;
}

export interface CreatePaymentOrderRequest {
  savedTripId: number;
  adultCount: number;
  travelers: TravelerRequest[];
}

export interface PaymentOrderItemResponse {
  itemType: "FLIGHT" | "HOTEL";
  unitPrice: number | null;
  quantity: number | null;
  amount: number;
  title: string | null;
}

export interface PaymentTravelerResponse {
  fullName: string;
  birthDate: string;
  gender: string;
  passportNumber: string;
  passportExpiry: string;
  phone: string | null;
  representative: boolean;
}

export interface PaymentOrderResponse {
  orderId: string;
  savedTripId: number;
  adultCount: number;
  totalAmount: number;
  status: PaymentOrderStatus;
  paymentKey: string | null;
  cardId: number | null;
  failReason: string | null;
  paidAt: string | null;
  items: PaymentOrderItemResponse[];
  travelers: PaymentTravelerResponse[];
}

export interface ConfirmPaymentRequest {
  cardId: number;
}

export const paymentOrderApi = {
  createOrder: (body: CreatePaymentOrderRequest) =>
    apiClient.post<ApiResponse<PaymentOrderResponse>>("/payments/orders", body),

  getOrder: (orderId: string) =>
    apiClient.get<ApiResponse<PaymentOrderResponse>>(
      `/payments/orders/${orderId}`,
    ),

  confirmOrder: (orderId: string, body: ConfirmPaymentRequest) =>
    apiClient.post<ApiResponse<PaymentOrderResponse>>(
      `/payments/orders/${orderId}/confirm`,
      body,
    ),
};
