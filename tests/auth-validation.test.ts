import { describe, expect, it } from "vitest";
import {
  isValidNigerianPhone,
  normalizeNigerianPhone,
  passwordStrengthScore,
  validateEmailCredentials,
  validateOtp,
  validatePhoneInput,
} from "../lib/auth-validation";

describe("auth validation", () => {
  it("normalizes common Nigerian phone formats", () => {
    expect(normalizeNigerianPhone("0801 234 5678")).toBe("+2348012345678");
    expect(normalizeNigerianPhone("8012345678")).toBe("+2348012345678");
    expect(normalizeNigerianPhone("+234 801 234 5678")).toBe("+2348012345678");
    expect(isValidNigerianPhone("08012345678")).toBe(true);
  });

  it("rejects incomplete phone and otp values", () => {
    expect(validatePhoneInput("0801234").phone).toBeTruthy();
    expect(validateOtp("12345").otp).toBeTruthy();
    expect(validateOtp("123456")).toEqual({});
  });

  it("validates signup fields without requiring strong-password extras", () => {
    expect(validateEmailCredentials({ signup: true, name: "A", email: "bad", password: "short", confirmPassword: "other" })).toEqual({
      name: "Enter your full name.",
      email: "Enter a valid email address.",
      password: "Use at least 8 characters.",
      confirmPassword: "Passwords do not match.",
    });
  });

  it("scores password strength consistently", () => {
    expect(passwordStrengthScore("password")).toBe(1);
    expect(passwordStrengthScore("Password1!")).toBe(4);
  });
});
