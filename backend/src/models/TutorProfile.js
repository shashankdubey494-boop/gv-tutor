import mongoose from "mongoose";

const tutorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    
    // Personal Information
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    
    // Address
    address: {
      type: String,
      required: true,
      trim: true,
    },
    
    // Teaching Experience
    experience: {
      type: Number,
      required: true,
      min: 0,
    },
    subjects: {
      type: [String],
      required: true,
    },
    classes: {
      type: [String],
      required: true,
    },
    
    // Availability
    availableLocations: {
      type: [String],
      required: true,
    },
    preferredTiming: {
      type: String,
      required: true,
      trim: true,
    },
    
    // Pricing
    hourlyRate: {
      type: Number,
      required: true,
      min: 0,
    },
    
    // Additional Information
    bio: {
      type: String,
      default: "",
      trim: true,
    },
    achievements: {
      type: String,
      default: "",
      trim: true,
    },
    
    // Profile Status
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("TutorProfile", tutorProfileSchema);

