const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const fileSchema = new mongoose.Schema({
    uniqueId: { type: String, default: uuidv4 },
    originalFileName: { type: String, required: true }, // ✅ Original file name
    storedFileName: { type: String, required: true },   // ✅ Actual stored name in B2
    tags: { type: [String], required: true },
    fileUrl: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('File', fileSchema);
