const express = require('express')
const auth = require('../middleware/auth')
const { getQuizData, getQuizDataId } = require('../controllers/quizController')

const router = express.Router()

router.get('/', auth, getQuizData)
router.get('/:id', auth, getQuizDataId)

module.exports = router
