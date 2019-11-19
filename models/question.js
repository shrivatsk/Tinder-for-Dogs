var mongoose = require('mongoose')

var questionSchema = new mongoose.Schema({
  questionText: { type: String },
  author: { type: String },
  answer: { type: String },
})

module.exports = mongoose.model('Question', questionSchema)
