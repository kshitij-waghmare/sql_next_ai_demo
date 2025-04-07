const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
    role_name: { type: String, required: true, unique: true, maxlength: 50 }, 
    description: { type: String, maxlength: 255 }, 
    sys_creation_date: { type: Date, default: Date.now },
    sys_update_date: { type: Date, default: Date.now },
    user_created: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    user_updated: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Role', RoleSchema);
