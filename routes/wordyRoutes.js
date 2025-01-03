const express = require('express')
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')
const {
  getWordies,
  getWordyById,
  createWordy,
  updateWordy,
  deleteWordy,
  getWordysIds,
} = require('../controllers/wordyController')

const router = express.Router()

router.get('/', getWordies)
router.get('/:id', auth, getWordyById)
router.post('/', auth, createWordy)
router.put('/:id', auth, updateWordy)
router.delete('/:id', admin, deleteWordy)

module.exports = router
