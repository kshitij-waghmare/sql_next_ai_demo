const mongoose = require('mongoose');

const deletionRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    firstName: { type: String, required: true }, // Store First Name
    lastName: { type: String, required: false }, // Store Last Name
    email: { type: String, required: true }, // Store Email
    role: { type: String, required: true }, // Store Role Name
    requestedAt: { type: Date, default: Date.now },
    deleteAt: { type: Date, required: true }, // Deletion time
    status: { type: String, enum: ['pending', 'deleted'], default: 'pending' }
});

const DeletionRequest = mongoose.model('DeletionRequest', deletionRequestSchema);
module.exports = DeletionRequest;
