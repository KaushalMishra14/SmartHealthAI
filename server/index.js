require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const connectDB = require("./config/db");
const History = require("./models/History");
const protect = require("./middleware/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const app = express();
connectDB()

app.use(cors())
app.use(express.json())

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

app.get("/", (req, res) => {
  res.json({
    message: "Smart Health AI Backend Running"
  })
})

app.get("/api/symptoms", async (req, res) => {
  try {
    const response = await axios.get("http://localhost:8000/symptoms")
    res.json(response.data)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch symptoms"
    })
  }
})

app.post("/api/predict", protect, async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No symptoms selected",
      });
    }

    const mlResponse = await axios.post("http://localhost:8000/predict", {
      symptoms,
    });

    if (mlResponse.data.success) {
      await History.create({
        user: req.user,
        disease: mlResponse.data.disease,
        symptoms: mlResponse.data.selected_symptoms || symptoms,
        confidence: mlResponse.data.confidence,
      });
    }

    res.json(mlResponse.data);
  } catch (error) {
    console.log("Prediction error:", error.message);

    res.status(500).json({
      success: false,
      message: "Prediction service failed",
      error: error.message,
    });
  }
});


app.post("/api/chat", async (req, res) => {
  try {
    const { message, disease } = req.body

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      })
    }

    const prompt = `
          You are an AI health assistant for an educational medical recommendation project.

          Rules:
          - Give simple and safe health guidance.
          - Do not claim to diagnose.
          - Do not replace doctors.
          - Encourage doctor consultation for serious symptoms.
          - Keep the answer short and understandable.

          Predicted disease context: ${disease || "Not provided"}

          User question:
          ${message}
          `

    const models = [
      "gemini-2.5-flash-lite",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite"
    ]

    let reply = null
    let lastError = null

    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName
        })

        const result = await model.generateContent(prompt)
        reply = result.response.text()
        break
      } catch (err) {
        lastError = err
        console.log(`Model failed: ${modelName}`, err.message)
      }
    }

    if (!reply) {
      return res.status(503).json({
        success: false,
        message: "AI service is busy. Please try again after some time.",
        error: lastError?.message
      })
    }

    res.json({
      success: true,
      reply
    })

  } catch (error) {
    console.log("Chat error full:", error)

    res.status(500).json({
      success: false,
      message: "AI chat failed",
      error: error.message
    })
  }
})


app.get("/api/history", protect, async(req,res)=>{
    try{
      const history = await History.find({
        user: req.user,
      }).sort({ createdAt: -1 });

      res.json({success:true,history
      })
    }
    catch(error){
      res.status(500).json({success:false
    })
  }
})


app.delete("/api/history/:id", protect, async (req, res) => {
  try {
    await History.findOneAndDelete({
      _id: req.params.id,
      user: req.user,
    });
    res.json({ success: true, message: "History deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

app.delete("/api/history", protect, async (req, res) => {
  try {
    await History.deleteMany({
      user: req.user,
    });
    res.json({ success: true, message: "All history cleared" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Clear failed" });
  }
});


app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});


const PORT = 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})