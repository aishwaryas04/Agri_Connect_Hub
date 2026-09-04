const FarmerProduct = require('../models/farmer');
const Order = require('../models/order');
const { sendNotification } = require('../messaging/twilio');

// Handle buying a product: create order, decrement inventory, notify farmer, emit socket event
const handleBuyProduct = async (req, res) => {
  try {
    const { productId, quantity, buyerName, buyerContact, deliveryCharges } = req.body;
    if (!productId || !quantity) return res.status(400).json({ message: 'productId and quantity are required' });

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) return res.status(400).json({ message: 'Invalid quantity' });

    // Find product
    const product = await FarmerProduct.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.totalQuantity < qty) return res.status(400).json({ message: 'Insufficient quantity available' });

    // Update inventory
    product.totalQuantity = product.totalQuantity - qty;
    if (product.totalQuantity === 0) product.status = 'Sold';
    await product.save();

    // Create order
    const order = new Order({
      productId: product._id,
      productName: product.productName,
      quantity: qty,
      unitPrice: product.pricePerUnit,
      totalPrice: qty * product.pricePerUnit + (deliveryCharges || 0),
      farmerContact: product.farmerContact || product.farmerPhone || process.env.PHONE_NUMBER,
      buyerName: buyerName || 'SmallScaleIndustry',
      buyerContact: buyerContact || '',
      status: 'Confirmed',
    });

    const savedOrder = await order.save();

    // Notify farmer via SMS (if phone available)
    try {
      const farmerPhone = order.farmerContact || process.env.PHONE_NUMBER;
      if (farmerPhone) {
        const body = `New order received: ${order.productName} x ${order.quantity}. Buyer: ${order.buyerName} ${order.buyerContact || ''}`;
        await sendNotification({ to: farmerPhone, body });
      }
    } catch (notifyErr) {
      console.error('Failed to notify farmer:', notifyErr);
    }

    // Emit socket events
    try {
      const io = req.app && req.app.get && req.app.get('io');
      if (io) io.emit('orderPlaced', savedOrder);
    } catch (emitErr) {
      console.error('Failed to emit orderPlaced:', emitErr);
    }

    return res.status(201).json({ message: 'Order placed', order: savedOrder });
  } catch (err) {
    console.error('handleBuyProduct error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Handle cancel: mark order cancelled, restock product, notify farmer and buyer, emit socket
const handleCancelProduct = async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    if (!orderId) return res.status(400).json({ message: 'orderId is required' });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status === 'Cancelled') return res.status(400).json({ message: 'Order already cancelled' });

    // Restore inventory
    const product = await FarmerProduct.findById(order.productId);
    if (product) {
      product.totalQuantity = (product.totalQuantity || 0) + order.quantity;
      product.status = 'Available';
      await product.save();
    }

    order.status = 'Cancelled';
    await order.save();

    // Notify farmer and buyer
    try {
      const farmerPhone = order.farmerContact || process.env.PHONE_NUMBER;
      if (farmerPhone) {
        const body = `Order cancelled: ${order.productName} x ${order.quantity}. Reason: ${reason || 'Not specified'}`;
        await sendNotification({ to: farmerPhone, body });
      }

      const buyerPhone = order.buyerContact;
      if (buyerPhone) {
        const body2 = `Your order ${order.productName} x ${order.quantity} has been cancelled.`;
        await sendNotification({ to: buyerPhone, body: body2 });
      }
    } catch (notifyErr) {
      console.error('Notification on cancel failed:', notifyErr);
    }

    // Emit socket event
    try {
      const io = req.app && req.app.get && req.app.get('io');
      if (io) io.emit('orderCancelled', order);
    } catch (emitErr) {
      console.error('Failed to emit orderCancelled:', emitErr);
    }

    return res.status(200).json({ message: 'Order cancelled', order });
  } catch (err) {
    console.error('handleCancelProduct error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get orders - supports query params ?farmerContact= or ?buyerContact=
const getOrders = async (req, res) => {
  try {
    const { farmerContact, buyerContact } = req.query;
    const filter = {};
    if (farmerContact) filter.farmerContact = farmerContact;
    if (buyerContact) filter.buyerContact = buyerContact;

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ message: 'Orders fetched', orders });
  } catch (err) {
    console.error('getOrders error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Book logistics for an order
const handleBookLogistics = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ message: 'orderId is required' });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.logisticsBooked) return res.status(400).json({ message: 'Logistics already booked' });

    order.logisticsBooked = true;
    await order.save();

    // Emit socket event
    try {
      const io = req.app && req.app.get && req.app.get('io');
      if (io) io.emit('logisticsBooked', order);
    } catch (emitErr) {
      console.error('Failed to emit logisticsBooked:', emitErr);
    }

    return res.status(200).json({ message: 'Logistics booked', order });
  } catch (err) {
    console.error('handleBookLogistics error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { handleBuyProduct, handleCancelProduct, getOrders };
