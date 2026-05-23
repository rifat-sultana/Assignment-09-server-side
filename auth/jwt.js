const jwt = require("jsonwebtoken");

function getJwtSecret() {
  const secret = process.env.JWT_SECRET || process.env.BETTER_AUTH_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET or BETTER_AUTH_SECRET is required");
  }

  return secret;
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, image: user.image },
    getJwtSecret(),
    { expiresIn: "7d" }
  );
}

function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

module.exports = { signToken, verifyToken };
