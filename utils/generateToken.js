// Generate JWT token and set it as a cookie
const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();

  // Cookie options
  const isProd = process.env.NODE_ENV === "production";

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    // Cross-origin (Render ↔ Netlify): needs sameSite=none + secure=true
    // Local dev (same origin via Vite proxy): lax is fine
    sameSite: isProd ? "none" : "lax",
    secure:   isProd,
  };

  // Remove password from output
  const userData = user.toObject();
  delete userData.password;

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    user: userData,
  });
};

module.exports = sendToken;
