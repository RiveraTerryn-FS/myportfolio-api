import jwt from "jsonwebtoken";
import crypto from "crypto";

export const refreshCookieOptions = {
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
	sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
	path: "/api/v1/auth/refresh",
};
export const signAccessToken = (user) =>
	jwt.sign(
		{ id: user._id, username: user.username, role: user.role },
		process.env.JWT_SECRET,
		{ expiresIn: "15m" }
	);
export const signRefreshToken = (user, jti) =>
	jwt.sign(
		{ id: user._id, role: user.role, jti },
		process.env.REFRESH_SECRET,
		{ expiresIn: "7d" }
	);

export const newJti = () => crypto.randomUUID();