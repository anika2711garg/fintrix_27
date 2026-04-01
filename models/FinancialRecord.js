const mongoose = require('mongoose');

const financialRecordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Please add an amount'],
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Please specify type (income/expense)'],
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      maxlength: [200, 'Description cannot be more than 200 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Query middleware for soft delete
financialRecordSchema.pre(/^find/, function () {
  this.where({ isDeleted: { $ne: true } });
});

// Indexing for faster filtering
financialRecordSchema.index({ type: 1, category: 1, date: -1 });
financialRecordSchema.index({ createdBy: 1 });

module.exports = mongoose.model('FinancialRecord', financialRecordSchema);
