const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'farmerProduct', required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  deliveryCharges: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  farmerContact: { type: String },
  buyerName: { type: String },
  buyerContact: { type: String },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Pending' },
  logisticsBooked: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('order', OrderSchema);
