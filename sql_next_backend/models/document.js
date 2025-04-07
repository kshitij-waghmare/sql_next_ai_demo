const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  createDate: { type: Date, default: Date.now },
  updateDate: { type: Date, default: Date.now },
  user: { type: String, required: true },
  pathInputFile: { type: String, required: true },
  interactionId: { type: String, required: true, unique: true },
  fileUploaded: { type: String, enum: ['Y', ''], default: '' },
  documentInProcess: { type: String, enum: ['Y', ''], default: '' },
  sqlCreation: { type: String, enum: ['Y', ''], default: '' },
  pathSqlFile: { type: String, default: '' },
  sqlStatus: { type: String, enum: ['Success', 'Fail'] },
  status: { type: String }
}, { collection: 'requirement-documents' });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;