export type Booking = {
  id: string;
  userId: number;
  username: string;
  startAt: string;
  endAt: string;
  description: string | null;
  background: string;
  createdAt: string;
};

export type CreateBookingPayload = {
  startAt: string;
  endAt: string;
  description?: string;
  background?: string;
};