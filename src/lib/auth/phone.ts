const INDIA_COUNTRY_CODE = "91"

export function normalizeIndianMobileDigits(value: string) {
  let digits = value.replace(/\D/g, "")

  if (digits.startsWith(INDIA_COUNTRY_CODE) && digits.length >= 12) {
    digits = digits.slice(INDIA_COUNTRY_CODE.length)
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1)
  }

  return digits.slice(0, 10)
}

export function isValidIndianMobileDigits(digits: string) {
  return /^[6-9]\d{9}$/.test(digits)
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
