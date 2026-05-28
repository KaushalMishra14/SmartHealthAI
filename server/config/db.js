const mongoose = require("mongoose")

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...")

    await mongoose.connect(process.env.MONGO_URI)

    console.log("MongoDB Connected")
  } catch (error) {
    console.log("MongoDB connection failed")
    console.log("Error name:", error.name)
    console.log("Error message:", error.message)
    console.log("Full error:", error)

    process.exit(1)
  }
}

module.exports = connectDB