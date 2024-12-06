const connectDb = require('./config/dbConnection')
require('dotenv').config()
const express =require("express")
const path = require('path')
const cors = require('cors')

// app conect to express
const app = express()

// database connection
connectDb()
app.use(cors())
app.use(express.json())

app.use('/api/uploads', express.static(path.join(__dirname, './uploads')))
app.use('/api/user', require('./routes/userRoutes'))
app.use('/api/wordy', require('./routes/wordyRoutes'))
app.use('/api/wordylist', require('./routes/WordyListRoutes'))
app.use('/api/quiz', require('./routes/quizRoutes'))

const PORT = process.env.PORT || 5050

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
