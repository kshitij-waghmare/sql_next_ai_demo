const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true, maxlength: 20 },
  lastName: { type: String, required: false, maxlength: 20 },
  password: { type: String, required: true, minlength: 8 },
  role_id: { type: String, required: true },
  sys_creation_date: { type: Date, default: Date.now },
  sys_update_date: { type: Date, default: Date.now },
  user_created: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  user_updated: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('User', UserSchema);



