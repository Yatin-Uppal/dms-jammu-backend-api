const bcrypt = require("bcryptjs");
const db = require('../models');

async function verifyAccessToken(req, res, next) {
  const user_id = req.header('user_id');
  const password = req.header('password');

  if (!user_id || !password) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    // Check if the user with the given user_id exists
    const user = await db.User.findOne({
      where: { id : user_id , password},
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

   

    // If both user_id and password match, you can optionally set the user in the request object
    req.user = user;

    next();
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

module.exports = {
  verifyAccessToken
};
