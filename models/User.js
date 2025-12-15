import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: { type: String, trim: true },
  },
);

userSchema.methods.setPassword = async function (pass) {
  this.password = pass;
};

userSchema.methods.validatePassword = async function (pass) {
  return this.password === pass;
};

export default mongoose.model("User", userSchema);
