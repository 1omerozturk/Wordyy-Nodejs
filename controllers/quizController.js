const Wordy = require('../models/wordy')

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
    const wordies = await Wordy.find({}, { turkish: 1, english: 1 });
    if (wordies.length < 4) {
      return res.status(400).json({ message: "Don't find enough data" });
    }

    // Wordy'leri karıştır
    const shuffledWordies = wordies.sort(() => 0.5 - Math.random());

    const questions = [];
    for (let i = 0; i < shuffledWordies.length; i++) {
      const correctWord = shuffledWordies[i];
      const wrongOptions = shuffledWordies
        .filter((w) => w._id.toString() !== correctWord._id.toString())
        .slice(0, 3);

      const options = [
        {
          label: 'a',
          value: correctWord.turkish,
        },
        ...wrongOptions.map((w, index) => ({
          label: String.fromCharCode(98 + index),
          value: w.turkish,
        })),
      ].sort(() => 0.5 - Math.random());

      const correctAnswer = options.find(
        (option) => option.value === correctWord.turkish
      ).label;

      questions.push({
        question: correctWord.english,
        options,
        correctAnswer,
      });
    }

    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};