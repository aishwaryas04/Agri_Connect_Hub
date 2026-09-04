const mongoose = require("mongoose");

/* ------------------------------------------------------------------
   1. FARMER SCHEMA
-------------------------------------------------------------------*/
const FarmerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    contactNumber: { type: String, required: true },

    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    location: {
      village: { type: String, required: true },
      district: { type: String, required: true },
      state: { type: String, required: true },
      pinCode: { type: String, required: true },
    },

    farmingType: { type: String }, // organic / conventional
  },
  { timestamps: true }
);

/* ------------------------------------------------------------------
   2. SMALL SCALE INDUSTRY SCHEMA
-------------------------------------------------------------------*/
const IndustrySchema = new mongoose.Schema(
  {
    industryName: { type: String, required: true },
    ownerName: { type: String, required: true },
    contactNumber: { type: String, required: true },

    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    industryType: { type: String, required: true },

    address: {
      street: String,
      village: String,
      city: String,
      district: String,
      state: String,
      pinCode: String,
    },

    licenseNumber: String,
    gstNumber: String,
  },
  { timestamps: true }
);

/* ------------------------------------------------------------------
   3. LOGISTIC SERVICES SCHEMA
-------------------------------------------------------------------*/
const LogisticSchema = new mongoose.Schema(
  {
    serviceName: { type: String, required: true },
    ownerName: { type: String },
    contactNumber: { type: String, required: true },

    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    vehicleTypes: [
      {
        type: String,
        capacity: String, // "500kg", "2 tons"
      },
    ],

    serviceAreas: [
      {
        district: String,
        state: String,
        pinCode: String,
      },
    ],

    pricingModel: {
      baseFare: Number,
      pricePerKm: Number,
      loadingCharge: Number,
    },

    availability: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/* ------------------------------------------------------------------
   EXPORT MODELS
-------------------------------------------------------------------*/
module.exports = {
  Farmer: mongoose.model("Farmer", FarmerSchema),
  Industry: mongoose.model("Industry", IndustrySchema),
  LogisticService: mongoose.model("LogisticService", LogisticSchema),
};
