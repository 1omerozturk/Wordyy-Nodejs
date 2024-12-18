const Wordy = require('../models/wordy')
const WordyList = require('../models/wordyList')

exports.getData = async (req, res) => {
  try {
    const ids = req.body
    const wordies = await Wordy.find(
      { _id: { $in: ids } },
      { turkish: 1, english: 1 },
    )

    // Verileri dictionary formatına dönüştürüyoruz.
    const quizData = wordies.map((w) => ({
      turkish: w.turkish,
      english: w.english,
    }))

    res.json(quizData)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getQuizData = async (req, res) => {
  try {
    const wordies = await Wordy.find({}, { turkish: 1, english: 1 })
    if (wordies.length < 4) {
      return res.status(400).json({ message: "Don't find enough data" })
    }

    // Wordy'leri karıştır
    const shuffledWordies = wordies.sort(() => 0.5 - Math.random())

    const questions = []
    for (let i = 0; i < shuffledWordies.length; i++) {
      const correctWord = shuffledWordies[i]
      const wrongOptions = shuffledWordies
        .filter((w) => w._id.toString() !== correctWord._id.toString())
        .slice(0, 3)

      const options = [
        {
          label: 'a',
          value: correctWord.turkish,
        },
        ...wrongOptions.map((w, index) => ({
          label: String.fromCharCode(98 + index),
          value: w.turkish,
        })),
      ].sort(() => 0.5 - Math.random())

      const correctAnswer = options.find(
        (option) => option.value === correctWord.turkish,
      ).label

      questions.push({
        question: correctWord.english,
        options,
        correctAnswer,
      })
    }

    res.json(questions)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Diziyi karıştırmak için Fisher-Yates algoritması
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]] // Elemanları yer değiştir
  }
  return array
}

exports.getQuizDataId = async (req, res) => {
  try {
    const { id } = req.params

    // Wordy list'yi veritabanından bul
    const wordyList = await WordyList.findById(id)
    if (!wordyList) {
      return res.status(404).json({ message: 'Wordy list not found' })
    }

    // Wordy IDs ve içeriklerini al
    const wordyIds = wordyList.wordies.map((wordyId) => wordyId.toString())
    const wordies = await Wordy.find({ _id: { $in: wordyIds } })
    const allWordies=await Wordy.find({})

    // Kelimeleri karıştır
    const shuffledWordies = shuffleArray([...wordies])

    const questions = []

    for (let i = 0; i < shuffledWordies.length; i++) {
      const correctWord = shuffledWordies[i]

      const wrongOptions = shuffleArray(
        allWordies.filter(
          (w) => w._id.toString() !== correctWord._id.toString(),
        ),
      ).slice(0, 3) 

      const options = shuffleArray([
        { label: 'a', value: correctWord.turkish }, // Doğru cevap
        ...wrongOptions.map((w, index) => ({
          label: String.fromCharCode(98 + index), // b, c, d
          value: w.turkish,
        })),
      ])

      // Doğru cevabın label'ını bul
      const correctAnswer = options.find(
        (option) => option.value === correctWord.turkish,
      ).label

      // Soru oluştur ve ekle
      questions.push({
        question: correctWord.english,
        options,
        correctAnswer,
      })
    }

    // Oluşturulan soruları geri gönder
    res.json(questions)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
