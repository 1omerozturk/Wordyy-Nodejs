const User = require('../models/user')
const Wordy = require('../models/wordy')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const multer = require('multer')
require('dotenv').config()
const { GoogleGenerativeAI } = require('@google/generative-ai')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  },
})

const upload = multer({ storage }).single('profilePicture')

const uploadMiddleware = (req, res) => {
  return new Promise((resolve, reject) => {
    upload(req, res, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

exports.updateUser = async (req, res) => {
  try {
    // Dosyayı yükle
    await uploadMiddleware(req, res)

    // Kullanıcı bilgilerini al
    const userId = req.params.id
    const { email, password } = req.body
    let filePath = req.file ? req.file.path.replace(/\\/g, '/') : null

    // Kullanıcıyı kontrol et
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Şifre doğrulama
    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid password' })
    }

    // Kullanıcı bilgilerini güncelle
    user.email = email || user.email
    user.profilePicture = filePath

    // Veritabanına kaydet
    await user.save()

    return res.status(200).json({ message: 'Profile updated successfully.' })
  } catch (error) {
    console.error('Hata:', error)

    // Hata mesajını kontrol et
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size too large.' })
    }

    return res
      .status(500)
      .json({ message: 'Internal server error', error: error.message })
  }
}

exports.getUser = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    return res.status(200).json(user)
  } catch (error) {
    console.error('Hata:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

exports.loginUser = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = await user.generateAuthToken()
    res.status(200).json({ user, token })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
    res.status(200).json(users)
  } catch (error) {
    console.error('Hata:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

exports.otoCreateWordy = async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const { level, difficult } = req.body

    console.log('level:', level)
    console.log('difficult:', difficult)

    const prompt = `Can you give ${level} level and ${difficult} difficulty 10 data (a specific English word and its Turkish meaning example sentence in both languages) in JSON format suitable for this model: { turkish, english, turkishExample, englishExample, type (enum: wordyTypes): wordyTypes = ['Noun - İsim', 'Verb - Fiil', 'Adjective - Sıfat', 'Adverb - Zarf', 'Pronoun - Zamir', 'Preposition - Edat', 'Conjunction - Bağlaç', 'Interjection - Ünlem'] }`

    const result = await model.generateContent(prompt)

    // Metni düzenle ve fazlalıkları temizle
    let wordiesText = result.response.text().trim()
    if (wordiesText.includes('[') && wordiesText.includes(']')) {
      wordiesText = wordiesText.split('[')[1].split(']')[0]
    } else {
      throw new Error('Generated response is not in expected JSON format.')
    }

    // Karakterleri düzelt ve çift tırnakları kullan
    const correctedJson = `[${wordiesText
      .replace(/\n/g, '')
      .replace(/'/g, '"')
      .trim()}]`

    console.log('correctedJson:', correctedJson)

    // JSON'u ayrıştır
    let jsonData
    try {
      jsonData = JSON.parse(correctedJson)
    } catch (err) {
      console.error('JSON parse error:', err)
      throw new Error('Failed to parse corrected JSON.')
    }

    const existingWordies = await Wordy.find({ english: { $in: jsonData.map(wordy => wordy.english) } })
    .select('english')
    .lean();

    const existingWords = new Set(existingWordies.map(word => word.english));

    const newWordies = jsonData.filter(wordy => !existingWords.has(wordy.english));
    
    if (newWordies.length === 0) {
      return res.status(409).json({
        message: 'No new entries to add. All English words already exist in the database.',
      });
    }

    // Veritabanına kaydet
    const savedWordies = await Wordy.insertMany(newWordies)
    console.log(savedWordies)

    res.status(201).json({
      message: 'Wordy entry created successfully',
      data: savedWordies,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'An error occurred while creating the Wordy entry',
      error: error.message,
    })
  }
}

exports.registerUser = async (req, res) => {
  try {
    const { name, lastname, username, email, password } = req.body
    const file = req.file
    var user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ error: 'Email already exists' })
    }
    user = new User({ name, lastname, file, username, email, password })
    await user.save()

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: '1h',
    })
    res.status(201).json({ token })
  } catch (error) {
    res.status(400).json({ error: 'Invalid request' })
    console.log('User registration error.', error)
  }
}
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.status(200).json({ message: 'User deleted successfully' })
  } catch (error) {
    res.status(500).json({
      message: 'An error occurred while deleting the User',
      error: error.message,
    })
  }
}
