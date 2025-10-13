import express from "express";
import cors from "cors";
import session from "express-session";
import * as dotenv from "dotenv";
import passport from "./config/passport";
import authRoutes from "./modules/auth/auth.routes";
import postsRoutes from "./modules/posts/posts.routes";
import notificationsRoutes from "./modules/notifications/notifications.routes";
import reportsRoutes from "./modules/reports/reports.routes";
import { initializeDatabase } from "./config/db";

dotenv.config();

const app = express();
const corsOptions: cors.CorsOptions = {
  origin: ["http://localhost:8080", "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.use(express.json());

// Session middleware for OAuth (optional, chỉ cần nếu dùng session)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_session_secret_key_here",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set true nếu dùng HTTPS
  })
);

// Initialize Passport
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/reports", reportsRoutes);

// Health check for FE↔BE connectivity verification
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server chạy tại http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
