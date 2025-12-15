import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, trim: true },
    description: { type: String, trim: true, maxlength: 1000 },
    city: { type: String, trim: true },
    contact: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    pickupAvailable: { type: Boolean, default: false },
    pickupLocation: { type: String, trim: true, maxlength: 200 }
  },
  { timestamps: true }
);

export default mongoose.model("Listing", listingSchema);
