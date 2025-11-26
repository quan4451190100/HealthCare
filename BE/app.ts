import express from "express";
import cors from "cors";

import authRoutes from "./src/modules/auth/auth.routes";
import aiAssistantRoutes from "./src/modules/ai-assistant/ai-assistant.routes";

const app: express.Express = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/ai-assistant", aiAssistantRoutes);

export default app;
