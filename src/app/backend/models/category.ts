import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    names: {
      type: [String],
      required: true,
      length:4
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
