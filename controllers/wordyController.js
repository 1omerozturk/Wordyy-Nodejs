const Wordy = require('../models/wordy')

// Get All Wordies
exports.getWordies = async (req, res) => {
  try {
    const wordies = await Wordy.find().sort({ createdAt: -1 })
    res.json(wordies)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get One Wordy By Id
exports.getWordyById = async (req, res) => {
  try {
    const wordy = await Wordy.findById(req.params.id)
    if (!wordy) {
      return res.status(404).json({ error: 'Wordy not found' })
    }
    res.json(wordy)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.createWordy = async (req, res) => {
  try {
    const newWordy = new Wordy(req.body)
    console.log(newWordy)
    await newWordy.save()
    return res.status(201).json(newWordy)
  } catch (error) {
    console.error('Error saving wordy:', error)
    res.status(500).json({ error: 'Server Error' })
  }
}

// Update One Wordy By Id
exports.updateWordy = async (req, res) => {
  try {
    const wordy = await Wordy.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
    if (!wordy) {
      return res.status(404).json({ error: 'Wordy not found' })
    }
    res.status(200).json(wordy)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Delete One Wordy By Id
exports.deleteWordy = async (req, res) => {
  try {
    const id=req.params.id
    const wordy = await Wordy.findByIdAndDelete(id)
    if (!wordy) {
      return res.status(404).json({ error: 'Wordy not found' })
    }
    res.json({ message: `${wordy.english} deleted.` })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
