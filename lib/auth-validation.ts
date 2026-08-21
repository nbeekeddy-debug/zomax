export type AuthFieldErrors = Partial<
  Record<"name" | "email" | "password" | "confirmPassword" | "phone" | "otp", string>
>;

export function normalizeNigerianPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("234")) return `+${digits}`;
  if (digits.startsWith("0")) return `+234${digits.slice(1)}`;
  return `+234${digits}`;
}

export function isValidNigerianPhone(value: string) {
  return /^\+234\d{10}$/.test(normalizeNigerianPhone(value));
}

export function passwordStrengthScore(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

export function validateEmailCredentials(input: {
  signup: boolean;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): AuthFieldErrors {
  const errors: AuthFieldErrors = {};
  if (input.signup && input.name.trim().length < 2) errors.name = "Enter your full name.";
  if (!/^\S+@\S+\.\S+$/.test(input.email.trim())) errors.email = "Enter a valid email address.";
  if (input.password.length < 8) errors.password = "Use at least 8 characters.";
  if (input.signup && input.password !== input.confirmPassword) errors.confirmPassword = "Passwords do not match.";
  return errors;
}

export function validatePhoneInput(value: string): AuthFieldErrors {
  return isValidNigerianPhone(value)
    ? {}
    : { phone: "Enter a valid Nigerian mobile number, e.g. 0801 234 5678." };
}

export function validateOtp(value: string): AuthFieldErrors {
  return /^\d{6}$/.test(value) ? {} : { otp: "Enter the 6-digit code." };
}
