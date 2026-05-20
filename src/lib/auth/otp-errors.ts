export function getFriendlyOtpError(error: unknown) {
  const message = error instanceof Error ? error.message : ""
  const normalized = message.toLowerCase()

  if (normalized.includes("invalid login") || normalized.includes("invalid otp")) {
    return "Invalid OTP. Check the code and try again."
  }

  if (normalized.includes("expired")) {
    return "This OTP has expired. Send a new code."
  }

  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "Too many attempts. Please wait a few minutes and try again."
  }

  if (normalized.includes("phone")) {
    return "Unable to send OTP to this number. Check the number and try again."
  }

  if (normalized.includes("signup") || normalized.includes("signups not allowed")) {
    return "Phone sign-in is not enabled for this project. Contact support."
  }

  return message || "Something went wrong. Please try again."
}
