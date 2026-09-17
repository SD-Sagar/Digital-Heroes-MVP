import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/digital-heroes').then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({email: String, role: String}, {strict:false}));
  await User.updateOne({email: 'admin@sudharafinance.com'}, {$set: {role: 'admin'}});
  console.log('Updated to admin');
  process.exit(0);
});
