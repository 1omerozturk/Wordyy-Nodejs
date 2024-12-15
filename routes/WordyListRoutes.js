const express = require('express')
const auth = require('../middleware/auth')
const {
  getAllWordyList,
  getWordyListById,
  deleteWordyListById,
  updateWordyList,
  createWordyList,
  addWordyWordyList,
  getWordyListData,
} = require('../controllers/wordyListController')

const router = express.Router()
router.post('/:userId', auth, createWordyList)
router.get('/list/:id', auth, getWordyListData)
router.get('/:userId', auth, getAllWordyList)
router.get('/:userId/:wordyListId', auth, getWordyListById)
router.delete('/:userId/:wordyListId', auth, deleteWordyListById)
router.put('/:userId/:id', auth, updateWordyList)
router.post('/addWordy/:id', auth, addWordyWordyList)


module.exports = router
