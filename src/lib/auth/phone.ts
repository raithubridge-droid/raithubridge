const INDIA_COUNTRY_CODE = "91"

export function normalizeIndianMobileDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, 10)
}

export function isValidIndianMobileDigits(digits: string) {
  return /^\d{10}$/.test(digits)
}

export function toIndianE164(digits: string) {
  return `+${INDIA_COUNTRY_CODE}${digits}`
}

export function isValidOtpCode(value: string) {
  return /^\d{6}$/.test(value)
}

export function normalizeOtpCode(value: string) {
  return value.replace(/\D/g, "").slice(0, 6)
}
