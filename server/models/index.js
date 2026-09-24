const mongoose = require('mongoose');

const { Schema } = mongoose;
const objectId = Schema.Types.ObjectId;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

const categorySchema = new Schema({ name: { type: String, required: true, unique: true, trim: true } });

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    category_id: { type: objectId, ref: 'Category', default: null },
    image_url: { type: String, default: '' },
    rating: { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

const reviewSchema = new Schema(
  {
    product_id: { type: objectId, ref: 'Product', required: true },
    user_id: { type: objectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

const cartItemSchema = new Schema(
  {
    user_id: { type: objectId, ref: 'User', required: true, index: true },
    product_id: { type: objectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { timestamps: false }
);
cartItemSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

const orderItemSchema = new Schema(
  {
    product_id: { type: objectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    user_id: { type: objectId, ref: 'User', required: true, index: true },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['processing', 'paid', 'shipped', 'delivered', 'cancelled'],
      default: 'processing',
    },
    stripe_payment_intent_id: { type: String, default: null },
    shipping_address: { type: String, default: '' },
    items: { type: [orderItemSchema], default: [] },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

const toApi = (document) => {
  if (!document) return document;
  const value = document.toObject ? document.toObject() : document;
  const { _id, __v, ...rest } = value;
  return { id: String(_id), ...rest };
};

module.exports = {
  User: mongoose.models.User || mongoose.model('User', userSchema),
  Category: mongoose.models.Category || mongoose.model('Category', categorySchema),
  Product: mongoose.models.Product || mongoose.model('Product', productSchema),
  Review: mongoose.models.Review || mongoose.model('Review', reviewSchema),
  CartItem: mongoose.models.CartItem || mongoose.model('CartItem', cartItemSchema),
  Order: mongoose.models.Order || mongoose.model('Order', orderSchema),
  toApi,
};
