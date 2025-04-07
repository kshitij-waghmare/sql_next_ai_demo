const mongoose = require('mongoose');
const ActivityTypeSchema = new mongoose.Schema({
    activity_name: { type: String, required: true, unique: true, maxlength: 20 },       
    sys_creation_date: { type: Date, default: Date.now },
    sys_update_date: { type: Date, default: Date.now },
    //user_created: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    //user_updated: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  });
  
  module.exports = mongoose.model('ActivityType', ActivityTypeSchema);
  