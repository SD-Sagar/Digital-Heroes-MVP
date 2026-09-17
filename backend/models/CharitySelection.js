import mongoose from 'mongoose';

const charitySelectionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  charity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Charity',
    required: true
  },
  contributionPercentage: {
    type: Number,
    required: true,
    min: 10,
    max: 100,
    default: 10
  }
}, {
  timestamps: true
});

export default mongoose.model('CharitySelection', charitySelectionSchema);
