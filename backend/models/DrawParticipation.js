import mongoose from 'mongoose';

const drawParticipationSchema = new mongoose.Schema({
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
  userNumbers: {
    type: [Number],
    required: true,
    validate: {
      validator: function(arr) {
        return arr.length === 5;
      },
      message: 'Participation must have exactly 5 numbers'
    }
  },
  matchCount: {
    type: Number,
    default: 0
  },
  prizeAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

drawParticipationSchema.index({ user: 1, draw: 1 });
drawParticipationSchema.index({ draw: 1, matchCount: -1 });

export default mongoose.model('DrawParticipation', drawParticipationSchema);
