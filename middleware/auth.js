const jwt = require('jsonwebtoken');
const config = require('../environment/config');

exports.isAuthenticated = (req, res, next) => {
  // console.log(req)
  // console.log(req)
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, config.jwt.secretKey, (err, decoded) => {
    console.log(err,token)
    if (err) {
      return res.status(500).json({ message: 'Failed to authenticate token' });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role; // Ensure user role is available for authorization checks
    next();
  });
};

