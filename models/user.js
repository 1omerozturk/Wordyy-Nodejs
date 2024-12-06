const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: false },
  lastname: { type: String, required: true, unique: false },
  username: { type: String, required: true, unique: true },
  profilePicture:{type:String},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  wordyLists: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WordyList' }],
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'admin'],
    default: 'user',
  },
  tokens: [{ token: { type: String, required: true } }],
})

// JWT token careating
userSchema.methods.generateAuthToken = async function () {
  const user = this
  const token = jwt.sign(
    { _id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '7 d' },
  )
  user.tokens = user.tokens.concat({ token })
  await user.save()
  return token
}

// Password hashing
userSchema.pre('save', async function (next) {
  const user = this
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }
  next()
})

const User = mongoose.model('User', userSchema)
module.exports = User
