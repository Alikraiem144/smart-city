import jwt from "jsonwebtoken";

const PRIVATE_KEY = process.env.PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY is missing");
}

export const generateToken = (id: number) => {
  return jwt.sign(
    { id },
    PRIVATE_KEY,
    {
      algorithm: "RS256",
      expiresIn: "7d",
    }
  );
};