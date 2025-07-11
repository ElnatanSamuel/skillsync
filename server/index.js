const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const sessionRoutes = require("./routes/session");
const goalRoutes = require("./routes/goal");

dotenv.config();
const app = express();

// Updated CORS to allow both local development and production URLs
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://skillsync-client.vercel.app",
      "https://skillsync.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/goals", goalRoutes);

app.get("/", (req, res) => {
  res.send("API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
