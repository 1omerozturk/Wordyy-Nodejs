const WordyList = require('../models/wordyList')
const User = require('../models/user')
const Wordy = require('../models/wordy')
const { default: mongoose } = require('mongoose')

exports.getAllWordyList = async (req, res) => {
  try {
    const { userId } = req.params
    if (userId) {
      const user = await User.findById(userId).populate('wordyLists')
      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }
      const wordyLists = user.wordyLists
      return res.status(200).json({
        success: true,
        count: wordyLists.length,
        wordyLists,
      })
    }
  } catch (error) {
    console.error('Error fetching WordyLists:', error)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}

exports.createWordyList = async (req, res) => {
  try {
    const { userId } = req.params // Kullanıcı ID
    const { name, wordies } = req.body // Gelen name ve wordy ID listesi

    if (!name || !Array.isArray(wordies)) {
      return res.status(400).json({
        error: 'Name and wordies array are required.',
      })
    }

    // Kullanıcıyı bul
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }

    // Wordy ID'leri kullanarak ilgili Wordy belgelerini bul
    const wordyDocs = await Wordy.find({ _id: { $in: wordies } })
    if (wordyDocs.length !== wordies.length) {
      return res.status(400).json({
        error: 'Some Wordy items could not be found. Check the provided IDs.',
      })
    }

    // Yeni WordyList oluştur
    const newWordyList = new WordyList({
      name,
      wordies: wordyDocs.map((wordy) => wordy._id), // Wordy ID'leri ekle
    })

    // WordyList kaydet ve kullanıcıya ekle
    await newWordyList.save()
    user.wordyLists.push(newWordyList._id) // Kullanıcıya ekle
    await user.save()

    // Başarılı yanıt
    return res.status(201).json(newWordyList)
  } catch (error) {
    console.error('Error creating WordyList:', error)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}

exports.getWordyListById = async (req, res) => {
  try {
    const { userId, wordyListId } = req.params
    const wordyLists = await User.findById(userId).select('wordyLists')
    if (!wordyLists) {
      return res.status(404).json({ error: 'User not found.' })
    }
    const wordyListDoc = await WordyList.findById(wordyListId)
    if (!wordyListDoc) {
      return res.status(404).json({ error: 'WordyList not found.' })
    }
    return res.status(200).json(wordyListDoc)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getWordyListData = async (req, res) => {
  try {
    const { id } = req.params
    const wordyList = await WordyList.findById(id)
    if (!wordyList) {
      return res.status(404).json({ error: 'WordyList not found' })
    }
    const wordyIds = wordyList.wordies.map((wordyId) => wordyId.toString())
    const wordies = await Wordy.find({ _id: { $in: wordyIds } })
    return res.status(200).json(wordies)
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ error: error.message })
  }
}

exports.deleteWordyListById = async (req, res) => {
  try {
    const { userId, wordyListId } = req.params
    const user = await User.findById(userId).select('wordyLists')
    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }
    const wordyList = await WordyList.findById(wordyListId)
    if (!wordyList) {
      return res.status(404).json({ error: 'WordyList not found.' })
    }
    await WordyList.findByIdAndDelete(wordyListId)
    await user.wordyLists.pull(wordyListId)
    await user.save()
    return res
      .status(200)
      .json({ message: wordyList.name + ' WordyList deleted successfully.' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.updateWordyList = async (req, res) => {
  try {
    const wordyList = await WordyList.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    )
    if (!wordyList) {
      return res.status(404).json({ error: 'wordyList not found' })
    }
    res.status(201).json(wordyList)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.addWordyWordyList = async (req, res) => {
  try {
    const id = req.body.wordyId
    if (id !== null) {
      const wordyList = await WordyList.findById(req.params.id)
      if (!wordyList) {
        return res.status(404).json({ message: 'WordyList not found.' })
      }

      if (wordyList.wordies.includes(id)) {
        return res.status(409).json({ message: 'Already existing.' }) // 409 Conflict
      }

      wordyList.wordies.push(id)
      await wordyList.save()
      return res.status(201).json(wordyList)
    } else {
      return res.status(500).json({ message: 'Please select wordyList' })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
