
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const inviteRoutes = require("./routes/invites");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/documents", require("./routes/documents"));
app.use("/api/invites", require("./routes/invites"));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ MongoDB connected");
  app.listen(process.env.PORT, () => {
    console.log(`🚀 Server running on port ${process.env.PORT}`);
  });
})
.catch((err) => {
  console.error("❌ MongoDB connection failed:", err);
});
app.use("/api/invites", require("./routes/invites"));
app.use("/api/invites", inviteRoutes);