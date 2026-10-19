import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Limits for creating a new complaint: 5 submissions per 10 minutes, per IP
export const createTicketLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  prefix: "ratelimit:create-ticket",
});

// Limits for the track/lookup endpoint: 20 lookups per 10 minutes, per IP
// (higher than ticket creation, since legitimately checking status repeatedly is normal)
export const trackLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "10 m"),
  prefix: "ratelimit:track",
});

// Helper: gets the visitor's IP from the request, with a safe fallback
export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "unknown";
}
