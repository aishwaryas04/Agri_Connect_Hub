const { sendNotification } = require('../messaging/twilio');
const FarmerProduct = require("../models/farmer");

// CREATE LISTING
const handleListings = async (req, res) => {
  try {
    const {
      farmerId,
      productName,
      productCategory,
      varietyType,
      description,
      totalQuantity,
      unitType,
      minimumOrderQuantity,
      packagingType,
      grade,
      qualityParameters,
      pricePerUnit,
      farmAddress,
      pickupLocation,
      distanceFromMainRoad,
      needLogisticsSupport,
      preferredDeliveryWindow,
      harvestedDate,
      availabilityStartDate,
      availabilityEndDate,
      storageCondition,
      canDeliver,
      deliveryCharges,
      status,
      to // mobile number sent in request
    } = req.body;

    // Required validation
    if (
      !productName ||
      !productCategory ||
      !totalQuantity ||
      !unitType ||
      !pricePerUnit ||
      !farmAddress ||
      !availabilityStartDate
    ) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // Create new product listing
    const newListing = new FarmerProduct({
      farmerId,
      productName,
      productCategory,
      varietyType,
      description,
      totalQuantity,
      unitType,
      minimumOrderQuantity,
      packagingType: packagingType || "Loose",
      grade: grade || "A",
      qualityParameters,
      pricePerUnit,
      farmAddress,
      pickupLocation: pickupLocation || "Farm",
      distanceFromMainRoad,
      needLogisticsSupport: needLogisticsSupport || false,
      preferredDeliveryWindow,
      harvestedDate,
      availabilityStartDate,
      availabilityEndDate,
      storageCondition: storageCondition || "Normal",
      canDeliver,
      deliveryCharges,
      status: status || "Available",
    });

    const savedListing = await newListing.save();

    // Send SMS Notification after saving
    try {
      const receiver = to || process.env.PHONE_NUMBER;
      if (receiver) {
        const bodyText = `Your product "${productName}" has been listed successfully on Agri-Link Hub.`;
        await sendNotification({ to: receiver, body: bodyText });
      } else {
        console.warn('No recipient phone number; skipping notification.');
      }
    } catch (notifyErr) {
      console.error('Notification failed:', notifyErr);
    }

    // Emit socket event so connected clients receive real-time update
    try {
      const io = req.app && req.app.get && req.app.get('io');
      if (io) io.emit('productAdded', savedListing);
    } catch (emitErr) {
      console.error('Failed to emit socket event:', emitErr);
    }

    return res.status(201).json({
      message: "Product listing created successfully",
      listing: savedListing,
    });
  } catch (error) {
    console.error("Error creating listing:", error);
    return res.status(500).json({
      message: "Error creating product listing",
      error: error.message,
    });
  }
};

// GET ALL LISTINGS
const getListings = async (req, res) => {
  try {
    const rawListings = await FarmerProduct.find();
    const listings = rawListings.map((doc) => {
      const obj = doc.toObject ? doc.toObject() : doc;
      return {
        ...obj,
        canDeliver: obj.canDeliver !== undefined ? obj.canDeliver : 'no',
        deliveryCharges: obj.deliveryCharges !== undefined ? obj.deliveryCharges : 0,
      };
    });

    return res.status(200).json({
      message: "Listings fetched successfully",
      listings,
    });
  } catch (error) {
    console.error("Error fetching listings:", error); // <-- check logs here
    return res.status(500).json({
      message: "Error fetching listings",
      error: error.message,
    });
  }
};
const handleDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await FarmerProduct.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Emit socket event for real-time update
    try {
      const io = req.app && req.app.get && req.app.get("io");
      if (io) io.emit("productDeleted", { id });
    } catch (emitErr) {
      console.error("Failed to emit socket event:", emitErr);
    }

    return res.status(200).json({
      message: "Product deleted successfully",
      id,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({
      message: "Error deleting product",
      error: error.message,
    });
  }
};

module.exports = { handleListings, getListings, handleDeleteProduct };
