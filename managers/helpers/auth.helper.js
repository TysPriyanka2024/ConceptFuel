module.exports = {

  /**
   * Get the role details attached with the user
   */
  getFilteredUserDetails: async (user) => {
    const { otp, loginToken, ...innerUser } = { ...user };
    return innerUser;
  }
};
