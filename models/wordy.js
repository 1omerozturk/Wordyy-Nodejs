const mongoose = require('mongoose')

const wordyTypes = [
  'Noun - İsim', // İsim
  'Verb - Fiil', // Fiil
  'Adjective - Sıfat', // Sıfat
  'Adverb - Zarf', // Zarf
  'Pronoun - Zamir', // Zamir
  'Preposition - Edat', // Edat
  'Conjunction - Bağlaç', // Bağlaç
  'Interjection - Ünlem', // Ünlem
]


const wordySchema = new mongoose.Schema({
  turkish: {
    type: String,
    required: true,
  },
  english: {
    type: String,
    required: true,
  },
  turkishExample: {
    type: String,
    required: false,
  },
  englishExample: {
    type: String,
    required: false,
  },
  image:{
    type: String,
    required: false,
  },
  type: {
    type: [String],
    enum: wordyTypes,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now
    },
})

const Wordy=mongoose.model("Wordy",wordySchema);

module.exports=Wordy;