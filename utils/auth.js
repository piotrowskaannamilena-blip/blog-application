const jwt = require('jsonwebtoken');

const secret = 'mysecretssshhhhhhh';
const expiration = '2h';

const authMiddleware = (req, res, next) => {
  let token = req.headers.authorization?.split(" ").pop() || null;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const { data } = jwt.verify(token, secret);
    req.user = data;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token", error: err.message });
  }
};

const signToken = (user) => {

  const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
  };
  return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
}

module.exports = { authMiddleware, signToken };
