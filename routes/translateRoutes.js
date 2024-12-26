const express = require('express')
translateController = require('../controllers/translateController')

const router = express.Router()

router.post('/tr-en', translateController.translateTrToEn)
router.post('/en-tr', translateController.translateEnToTr)
router.post('/structure', translateController.structure)

module.exports = router
