import mongoose from 'mongoose';

const charitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  website: {
    type: String,
    trim: true
  },
  logo: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    trim: true
  },
  images: [{
    type: String
  }],
  upcomingEvents: [{
    title: String,
    date: Date,
    description: String
  }]
}, {
  timestamps: true
});

export default mongoose.model('Charity', charitySchema);
