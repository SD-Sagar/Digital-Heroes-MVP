import mongoose from 'mongoose';

const drawSchema = new mongoose.Schema({
  drawDate: {
    type: Date,
    required: true
  },
  drawType: {
    type: String,
    enum: ['random', 'algorithmic'],
    required: true
  },
  winningNumbers: {
    type: [Number],
    required: true,
    validate: {
      validator: function(arr) {
        return arr.length === 5;
      },
      message: 'Draw must have exactly 5 numbers'
    }
  },
  prizePool: {
    type: Number,
    required: true,
    default: 0
  },
  jackpotRollover: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'simulated', 'published'],
    default: 'draft'
  },
  prizeDistribution: {
    fiveMatch: { amount: Number, winners: Number },
    fourMatch: { amount: Number, winners: Number },
    threeMatch: { amount: Number, winners: Number }
  },
  newJackpot: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

drawSchema.index({ drawDate: -1 });
drawSchema.index({ status: 1 });

export default mongoose.model('Draw', drawSchema);
