// Generate JWT token and set it as a cookie
const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();

  // Cookie options
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
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
