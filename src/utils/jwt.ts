import jwt from "jsonwebtoken";

const SECRET = "crowd_mapping_secret";

export const generateToken = (id: number) => {
  return jwt.sign(
    { id },
    SECRET,
    {
      expiresIn: "7d",
    }
  );
};