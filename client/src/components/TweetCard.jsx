"use client"

// Plain React version for Vite projects.
// Removes TypeScript types and Next.js path aliases.
import React from "react"
import { Tweet } from "react-tweet"

// Very small fallbacks to avoid build errors without custom components
const DefaultSkeleton = () => (
  <div className="w-full rounded-lg border border-white/10 bg-white/5 p-4 text-white/60 text-sm">
    Loading tweet…
  </div>
)

const DefaultNotFound = ({ error }) => (
  <div className="w-full rounded-lg border border-white/10 bg-white/5 p-4 text-white/70 text-sm">
    Tweet unavailable{error ? `: ${String(error)}` : ""}
  </div>
)

export const ClientTweetCard = ({ id, className, fallback, components }) => {
  // Simplest and most reliable: let react-tweet handle fetching internally.
  // This avoids TypeScript-only useTweet wiring and custom API URLs.
  // If you need a skeleton, render it while id is missing.
  if (!id) return fallback || <DefaultSkeleton />

  // The library renders its own layout; we just wrap for styling consistency
  return (
    <div className={className}>
      <Tweet id={id} components={{ TweetNotFound: DefaultNotFound, ...(components || {}) }} />
    </div>
  )
}

export default ClientTweetCard
