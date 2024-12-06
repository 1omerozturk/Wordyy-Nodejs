const mongoose = require('mongoose')

const wordyListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  wordies: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Wordy' }],
  },
  created: {
    type: Date,
    default: Date.now,
  },
})

const WordyList = mongoose.model('WordyList', wordyListSchema)
module.exports = WordyList
