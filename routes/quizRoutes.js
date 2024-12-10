const express = require('express')
const auth = require('../middleware/auth')
const { getQuizData } = require('../controllers/quizController')

const router = express.Router()

router.get('/', auth, getQuizData)

module.exports = router;
