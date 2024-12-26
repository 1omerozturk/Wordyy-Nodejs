require('dotenv').config()
const { GoogleGenerativeAI } = require('@google/generative-ai')

const translate = async (lang, text) => {
  try {
    if (text) {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
      })
      if (!['en', 'tr'].includes(lang)) {
        return { error: 'Invalid language' }
      }
      const prompt =
        lang === 'en'
          ? `Translate the following text into ${lang}:\n\n"${text}"`
          : `Aşağıdaki metni ${lang} çeviriniz:\n\n"${text}"`

      const result = await model.generateContent(prompt)
      let translatedText = result.response.text()

      if (translatedText.includes(':')) {
        translatedText = translatedText.split(':')[1].trim()
      }

      if (translatedText.includes('**')) {
        const translatedTextArray = translatedText
          .split('**')
          .map((item) => item.trim())
          .filter((item) => item)
        return translatedTextArray
      }

      return [translatedText]
    }
  } catch (error) {
    console.error(`Error in translation to ${lang}:`, error.message)
    throw error
  }
}

const structureText = async (text) => {
  try {
    if (text) {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
      })
      const prompt = `Can you give this text structure by dividing it into sentences and sentences into elements?:\n\n"${text}"`
      const result = await await model.generateContent(prompt)
      let structuredText = result.response.text()
      return structuredText;
    }
  } catch (error) {
    console.error(`Error in structuring text:`, error.message)
    throw error
  }
}

// Türkçe'den İngilizce'ye çeviri endpointi
exports.translateTrToEn = async (req, res) => {
  const text = req.body.text
  if (text?.length > 1) {
    try {
      const result = await translate('en', text)
      res.json({ translatedText: result })
    } catch (error) {
      res
        .status(500)
        .json({ error: 'Translation failed', details: error.message })
    }
  }
}

// İngilizce'den Türkçe'ye çeviri endpointi
exports.translateEnToTr = async (req, res) => {
  const text = req.body.text
  if (text?.length > 0) {
    try {
      const result = await translate('tr', text)
      res.json({ translatedText: result })
    } catch (error) {
      res
        .status(500)
        .json({ error: 'Translation failed', details: error.message })
    }
  }
}

exports.structure = async (req, res) => {
  const text = req.body.text
  if (text?.length > 0) {
    try {
      const result = await structureText(text)
      res.json({ structuredText: result })
    } catch (error) {
      res
        .status(500)
        .json({ error: 'Structure failed', details: error.message })
    }
  }
}
