import { DecodedJwtTokenType } from "@/core/types/api/auth";
import { deleteCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import { redirect } from "next/navigation";

export class JwtDecodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JwtDecodeError";
  }
}

const handleAuthFailure = () => {
  deleteCookie("token");
  deleteCookie("refreshToken");
  deleteCookie("user");
  redirect("/");
};

const validateDecodedToken = (decoded: any): decoded is DecodedJwtTokenType => {
  if (!decoded || typeof decoded !== "object") return false;

  // Required string fields
  const requiredStringFields: (keyof DecodedJwtTokenType)[] = [
    "name",
    "picture",
    "email",
    "user_id",
  ];

  if (
    !requiredStringFields.every(
      (field) => typeof decoded[field] === "string" && decoded[field].length > 0
    )
  ) {
    return false;
  }

  // Boolean field
  if (typeof decoded.email_verified !== "boolean") {
    return false;
  }

  // Firebase object validation
  if (!decoded.firebase || typeof decoded.firebase !== "object") {
    return false;
  }

  // Firebase identities validation
  if (
    !decoded.firebase.identities ||
    typeof decoded.firebase.identities !== "object" ||
    !Array.isArray(decoded.firebase.identities["google.com"]) ||
    !Array.isArray(decoded.firebase.identities.email)
  ) {
    return false;
  }

  // Sign in provider validation
  if (
    typeof decoded.firebase.sign_in_provider !== "string" ||
    decoded.firebase.sign_in_provider.length === 0
  ) {
    return false;
  }

  return true;
};

export const decodeJwt = (token: string): DecodedJwtTokenType => {
  if (!token?.trim()) {
    handleAuthFailure();
    throw new JwtDecodeError("No token provided");
  }

  try {
    const decoded = jwtDecode(token);

    if (!validateDecodedToken(decoded)) {
      handleAuthFailure();
      throw new JwtDecodeError("Invalid token structure");
    }

    // Check if token is expired (if exp claim exists)
    if ("exp" in decoded && typeof decoded.exp === "number") {
      if (decoded.exp * 1000 < Date.now()) {
        handleAuthFailure();
        throw new JwtDecodeError("Token has expired");
      }
    }

    return decoded;
  } catch (error) {
    handleAuthFailure();

    if (error instanceof JwtDecodeError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new JwtDecodeError(`Failed to decode token: ${error.message}`);
    }

    throw new JwtDecodeError(
      "An unexpected error occurred while decoding the token"
    );
  }
};
