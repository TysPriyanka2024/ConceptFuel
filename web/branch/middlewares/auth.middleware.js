const jwt = require('jsonwebtoken');
const models = require('../../../managers/models');
const express = require("express");
const cookieParser = require('cookie-parser');
secretKey = process.env.SECRET_KEY
const app = express();



// This is a set of revoked tokens. In production, this should be a database table.

module.exports = {  

  authenticateToken: (requiredRole) => {
    return (req, res, next) => {
      // Skip authentication for static assets
      if (req.path.startsWith('/images')) {
        return next();
      }

      const token = req.cookies.jwt;
      if (!token) {
        console.log("Token not provided.");
        return res.redirect('/branch/auth/login');
      }

      jwt.verify(token, secretKey, (err, user) => {
        if (err) {
          console.log("Token verification failed:", err.message);
          return res.redirect('/branch/auth/login');
        }

        req.user = user;

        // Check user role
        if (user.usertype === "Branch") {
          next();
        } else {
          res.status(404).render('partials/404', { user });
        }
      });
    };
  },
  
  generateAccessToken: (user) => {
    const userObject = {
      role: "Branch",
      userId: user._id, // Replace with the actual user ID property
      name : user.name,
      usertype : "Branch",
      email : user.email,
      phone : user.phone,
      profile : user.image,
      city : user.city
    };
    return jwt.sign(userObject , secretKey, { expiresIn: '4h' });
  },
};
