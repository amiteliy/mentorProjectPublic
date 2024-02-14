
const mongoose = require('mongoose');

const CodeBlockSchema = new mongoose.Schema({
  codeBlockId: { type: String, required: true, unique: true }, 
  title: String,
  code: String,
  solution: String,
});
 
const CodeBlock = mongoose.model('CodeBlock', CodeBlockSchema);

module.exports = { CodeBlock };
