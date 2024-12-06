const express = require('express')
const auth = require('../middleware/auth')
const router = express.Router()
const userController = require('../controllers/userController')

router.post('/register', userController.registerUser)
router.get('/:id', auth, userController.getUser)
router.post('/login', userController.loginUser)
router.put('/update/:id', auth, userController.updateUser)

module.exports = router
