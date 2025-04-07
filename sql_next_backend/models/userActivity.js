const mongoose = require('mongoose');
const UserActivitySchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    activity_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ActivityType', required: true },
    timestamp: { type: Date, default: Date.now },
    sys_creation_date: { type: Date, default: Date.now },
    sys_update_date: { type: Date, default: Date.now },
    user_created: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    user_updated: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  });
  
  module.exports = mongoose.model('UserActivity', UserActivitySchema);
  