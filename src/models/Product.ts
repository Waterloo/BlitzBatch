import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  productName: { type: String, required: true, trim: true, minlength: 50, maxlength: 50 },
  price: { type: Number, required: true }
}, { 
  timestamps: true,
  indexes: [
    {  }
  ]
});


// Index for productName
ProductSchema.index({ productName: 1 });

export const Product = mongoose.model('Product', ProductSchema);
