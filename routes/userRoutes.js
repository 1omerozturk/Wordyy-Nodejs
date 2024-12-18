const express = require('express')
const auth = require('../middleware/auth')
const router = express.Router()
const userController = require('../controllers/userController')
const admin = require('../middleware/admin')

router.post('/register', userController.registerUser)
router.get('/users', admin, userController.getAllUsers)
router.post('/otocreate', auth, userController.otoCreateWordy)
router.get('/:id', auth, userController.getUser)
router.post('/login', userController.loginUser)
router.put('/update/:id', auth, userController.updateUser)
router.delete('/:id', admin, userController.deleteUser)

module.exports = router
