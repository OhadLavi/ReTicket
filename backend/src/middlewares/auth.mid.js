const { verify } = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.access_token;
  if (!token) return res.status(401).send();

  try {
    const decodedUser = verify(token, process.env.JWT_SECRET);
    req.user = decodedUser;
  } catch (error) {
    res.status(401).send();
  }

  return next();
};
