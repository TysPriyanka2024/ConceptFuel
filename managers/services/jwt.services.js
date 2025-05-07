const jwt = require('jsonwebtoken');

const JwtService = {

  /**
   * Create new jsonwebtoken
   */
  createNewToken: ({
    id, 
  }) => jwt.sign(
    {
      sub: id
    },
    process.env.SecretKey,
    { expiresIn: '7d' }
  ),

  /**
   * Get the token with the user data
   */
  getJwtTokenWithUserData: async (user, deviceToken) => {
    const token = JwtService.createNewToken(user);
    return token;
  }

};

module.exports = JwtService;
