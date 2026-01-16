import mongoose from "mongoose";

const FavouriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    page: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Page",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Same user same blog ko 2 baar favourite nahi kar sakta
FavouriteSchema.index({ user: 1, page: 1 }, { unique: true });

export default mongoose.model("Favourite", FavouriteSchema);
