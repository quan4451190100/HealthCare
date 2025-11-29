import express from "express";
import cors from "cors";
import session from "express-session";
import * as dotenv from "dotenv";
import passport from "./config/passport";
import authRoutes from "./modules/auth/auth.routes";
import postsRoutes from "./modules/posts/posts.routes";
import notificationsRoutes from "./modules/notifications/notifications.routes";
import reportsRoutes from "./modules/reports/reports.routes";
import aiAssistantRoutes from "./modules/ai-assistant/ai-assistant.routes";
import { initializeDatabase } from "./config/db";
import AIConversationModel from "./modules/ai-assistant/ai-assistant.model";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:5173",
  "http://192.168.1.2:8080",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:5173"
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || origin.match(/^http:\/\/192\.168\.\d+\.\d+:\d+$/)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_session_secret_key_here",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, 
  })
);

app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/ai-assistant", aiAssistantRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;

initializeDatabase()
  .then(async () => {
    await AIConversationModel.createTable();
    
    app.listen(PORT, () => {
      console.log(`Server chạy tại http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
