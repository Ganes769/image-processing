import { createSecretKey } from "crypto";
import { jwtVerify, SignJWT } from "jose";

export const generateToken = (paylaod) => {
  const secret = process.env.secret;
  const secretKey = createSecretKey(secret, "utf-8");
  return new SignJWT(paylaod)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(process.env.JWT_EXPIRES_IN || "7d")
    .sign(secretKey);
};
export const verifyToken = async (token: string) => {
  const secretKey = createSecretKey(process.env.JWT_SECRET, "utf-8");
  const { payload } = await jwtVerify(token, secretKey);
  return payload;
};
