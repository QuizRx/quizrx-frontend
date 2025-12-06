import { jwtDecode } from "jwt-decode";
import { CookieValueTypes } from "cookies-next";
import { DecodedJwtTokenType } from "../types/api/auth";
import { JwtDecodeError } from "../errors/jwt";

export const getTokenInfo = async (token: CookieValueTypes) => {
  try {
    const decoded = jwtDecode<DecodedJwtTokenType>(token?.toString()!);
    return decoded;
  } catch (error) {
    if (error instanceof JwtDecodeError) {
      console.error("JWT decode error:", error.message);
    } else {
      console.error("Unexpected error:", error);
    }
  }
};
