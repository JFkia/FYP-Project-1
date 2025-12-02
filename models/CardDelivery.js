// models/CardDelivery.js
const mongoose = require('mongoose');

const STATUS = ['Pending', 'Shipped', 'Delivered', 'Failed'];

const cardDeliverySchema = new mongoose.Schema(
  {
    card_number: {
      type: String,
      required: true,
      trim: true,
    },

    recipient_name: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    courier: {
      type: String,
      trim: true,
      default: "-",
    },

    status: {
      type: String,
      enum: STATUS,
      default: 'Pending',
    },

    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false }
    // We manually manage updated_at
  }
);

module.exports = mongoose.model("CardDelivery", cardDeliverySchema);
