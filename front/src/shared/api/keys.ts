export const qk = {
  bookings: (month: string) => ["bookings", month] as const,
  myBookings: ["bookings", "me"] as const,
  myWaitlist: ["waitlist", "me"] as const,
};  