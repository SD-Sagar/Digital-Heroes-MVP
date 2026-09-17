import mongoose from 'mongoose';

const winnerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  draw: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Draw',
    required: true
  },
  participation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DrawParticipation',
    required: true
  },
  matchType: {
    type: String,
    enum: ['5-match', '4-match', '3-match'],
    required: true
  },
  prizeAmount: {
    type: Number,
    required: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  proofUrl: {
    type: String
  },
  payoutStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  }
}, {
  timestamps: true
});

winnerSchema.index({ user: 1, draw: 1 });
winnerSchema.index({ verificationStatus: 1 });
winnerSchema.index({ payoutStatus: 1 });

export default mongoose.model('Winner', winnerSchema);
