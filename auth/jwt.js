const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || process.env.BETTER_AUTH_SECRET;

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, image: user.image },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { signToken, verifyToken };
