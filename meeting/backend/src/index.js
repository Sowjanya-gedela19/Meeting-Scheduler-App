const express = require("express");
const cors = require("cors");
const config = require("./config");
const connectDB = require("../config/db");
const mongoose = require("mongoose");
const User = require("./models/User");

const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/auth.routes");
const meetingRoutes = require("./routes/meeting.routes");
const userRoutes = require("./routes/user.routes");
const publicRoutes = require("./routes/public.routes");
const availabilityRoutes = require("./routes/availability.routes");
const calendarRoutes = require("./routes/calendar.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const { startReminderJob } = require("./services/reminder.cron");

async function main() {
  await connectDB();

  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: [config.appOrigin, "http://localhost:3000"],
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    }
  });

  io.on("connection", (socket) => {
    socket.on("join_meeting", (code) => {
      socket.join(code);
      socket.to(code).emit("participant_joined", { id: socket.id });
    });
  });

  app.use(
    cors({
      origin: [config.appOrigin, "http://localhost:3000"],
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  app.use(express.json());
  
  app.use((req, res, next) => {
    req.io = io;
    next();
  });

  app.get("/", (_req, res) => {
    res.json({ message: "API is running, use /api/health" });
  });
  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.get("/api/db-test", async (_req, res) => {
    try {
      const userCount = await User.countDocuments();
      res.json({
        ok: true,
        dbState: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        users: userCount,
      });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/meetings", meetingRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/emails", userRoutes); // Alias for email logs
  app.use("/api/public", publicRoutes);
  app.use("/api/availability", availabilityRoutes);
  app.use("/api/calendar", calendarRoutes);
  app.use("/api/analytics", analyticsRoutes);

  startReminderJob();

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  });

  server.listen(config.port, () => {
    console.log(`API listening on http://localhost:${config.port}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
