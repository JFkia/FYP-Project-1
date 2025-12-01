// models/CardDelivery.js
const mongoose = require('mongoose');

const STATUS = ['Delivered', 'InTransit', 'Failed', 'Delayed', 'Pending'];

const cardDeliverySchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    cardId: {
      type: String,
      required: true,
      trim: true,
    },

    vendor: {
      type: String,
      required: true,
      trim: true,
    },

    trackingNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    dispatchDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: STATUS,
      default: 'Pending',
    },

    // Optional: link to courier user
    courier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Optional: any notes / exception reason
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

module.exports = mongoose.model('CardDelivery', cardDeliverySchema);
