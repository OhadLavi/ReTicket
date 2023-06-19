const { verify } = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) 
    a = 1;
    //return res.status(401).json({ error: 'Authorization header missing' });
  else {
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Bearer token missing' });

    try {
      const decodedUser = verify(token, process.env.JWT_SECRET);
      req.user = decodedUser;
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }
  return next();
};
