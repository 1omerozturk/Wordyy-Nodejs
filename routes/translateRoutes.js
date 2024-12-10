const express = require('express')
translateController = require('../controllers/translateController')

const router = express.Router()

router.post('/tr-en', translateController.translateTrToEn)
router.post('/en-tr', translateController.translateEnToTr)

module.exports = router
