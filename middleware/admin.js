const jwt = require('jsonwebtoken')
const User = require('../models/user')

const admin = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token,
    })
    if (!user) 
      return res.status(401).send({ error: 'Please authenticate.' })
    else if (user.role !== 'admin')
      return res.status(403).send({ error: 'Access denied.' })
    else if (user.role === 'admin') {
      next()
    } else {
      res.status(403).json({ error: 'Access denied, admin only' })
    }
  } catch (error) {
    res.status(500).send({ error: 'Internal server error.' })
  }
}

module.exports = admin
