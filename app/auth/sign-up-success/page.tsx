"use client"

import Link from "next/link"

export default function SignUpSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
          </div>

          <p className="text-muted-foreground mb-6">
            We've sent you a confirmation link. Click the link in your email to verify your account.
          </p>

          <p className="text-sm text-muted-foreground mb-8">
            Once confirmed, you'll be able to sign in and start learning.
          </p>

          <Link
            href="/auth/login"
            className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 transition"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
