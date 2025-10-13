import bcrypt from "bcryptjs";
import { createUser, findUserByEmail } from "./auth.model";
import type { UserRecord } from "./auth.model";
import { signJwt } from "../../utils/jwt";

export const register = async (name: string, email: string, password: string) => {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error("EMAIL_EXISTS");
  }
  const hash = await bcrypt.hash(password, 10);
  const userId = await createUser(name, email, hash);
  const token = signJwt({ user_id: userId, email });
  return { user_id: userId, name, email, token };
};

export const login = async (email: string, password: string) => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    throw new Error("INVALID_CREDENTIALS");
  }
  const token = signJwt({ user_id: user.user_id, email: user.email, role: user.role });
  const { password: _pw, ...safe } = user as UserRecord & { password: string };
  return { ...safe, token };
};
