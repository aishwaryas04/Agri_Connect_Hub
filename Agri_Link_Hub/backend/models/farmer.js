const mongoose = require("mongoose");

const FarmerProductSchema = new mongoose.Schema(
  {
    // farmerId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Farmer",
    //   ,
    // },

    // Basic Product Info
    productName: { type: String,  },
    productCategory: { type: String,  }, // Vegetable, Fruit, Grain, etc.
    varietyType: { type: String },
    description: { type: String },

    // Quantity & Units
    totalQuantity: { type: Number,  },
    unitType: {
      type: String,
      enum: ["kg", "ton", "liter", "bag", "crate", "packet", "piece", "other"],
    },
    minimumOrderQuantity: { type: Number },
    packagingType: {
      type: String,
      enum: ["Loose", "Bags", "Crates", "Customized"],
      default: "Loose",
    },

    // Quality & Grading
    grade: { type: String, enum: ["A", "B", "C"], default: "A" },
    qualityParameters: {
      freshness: { type: String },
      moisturePercentage: { type: String },
      sizeRange: { type: String },
    },
    // organicCertified: { type: Boolean, default: false },
    // organicCertificateUrl: { type: String },

    // Pricing
    pricePerUnit: { type: Number,  },

    // Location & Logistics
    farmAddress: {
      addressLine: { type: String,  },
      village: { type: String,  },
      district: { type: String,  },
      state: { type: String,  },
      pinCode: { type: String,  },
    },

    pickupLocation: {
      type: String,
      default: "Farm",
    },

    distanceFromMainRoad: { type: String },
    needLogisticsSupport: { type: Boolean, default: false },

    preferredDeliveryWindow: {
      startDate: { type: Date },
      endDate: { type: Date },
      preferredTime: { type: String },
    },

    // Availability
    harvestedDate: { type: Date },
    availabilityStartDate: { type: Date,  },
    availabilityEndDate: { type: Date },

    storageCondition: {
      type: String,
      enum: ["Normal", "Cold Storage", "Warehouse"],
      default: "Normal",
    },
  
    canDeliver: { type: String, enum: ["yes", "no"], default: "no" },

    deliveryCharges: { type: Number, default: 0 },

    // Status
    status: {
      type: String,
      enum: ["Available", "Sold", "Pending Pickup"],
      default: "Available",
    },

    // Time Stamps
  },
  { timestamps: true }
);

module.exports = mongoose.model("farmerProduct", FarmerProductSchema);
