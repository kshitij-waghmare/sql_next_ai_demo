const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  uniqueId: { type: String, required: true },
  sqlQuery: { type: String, required: true },
  created_by: String,
  created_on: String,
});

const Record = mongoose.model('Sql_records', recordSchema);

module.exports = Record;