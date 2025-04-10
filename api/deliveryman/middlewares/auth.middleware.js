const jwt = require('jsonwebtoken');
const models = require('../../../managers/models');
secretKey = process.env.SECRET_KEY

// This is a set of revoked tokens. In production, this should be a database table.

module.exports = {  
  authenticateToken:async (req, res, next) => {
    const authHeader = req.header('authorization');
    const token = authHeader && authHeader.split(' ')[1];
  
    if (token == null) return res.sendStatus(401);
    
    const revokedTokens = await models.UserModel.RevokedTokens.findOne({ token : token });

    // Check if the token is in the revokedTokens set
    if (revokedTokens) {
      // The token is in the database, indicating it's revoked
      return res.status(401).json({
        status: false,
        message: 'Session has expired. Please Login Again.',
      });
    }
  
    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          // You can handle token expiration here, e.g., refresh token logic
          return res.status(303).json({
            status: false,
            message: 'Session has expired. Please Login Again.',
          });
        } else {
          return res.status(403).json({
            status: false,
            message: 'Invalid token',
          });
        }
      }
  
      req.user = user;
      req.token = token;
      next();
    });
  },

  
  generateAccessToken: (user) => {
    const userObject = {
      userId: user._id, // Replace with the actual user ID property
      profile : user.deliveryman_image,
      first_name : user.fname,
      last_name : user.lname,
      email : user.email,
      phone : user.phone,
    };
    return jwt.sign(userObject , secretKey, { expiresIn: '7d' });
  },

  verifyAccessToken : (token) => {
    return jwt.verify(token, secretKey);
  },

  initializeRevokedTokens: async (user, token) => {
    const tokenData = new models.UserModel.RevokedTokens({ token: token, user : user})
    const result = await tokenData.save();

    console.log(result);
  }

};
