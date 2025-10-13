import express from "express";
import cors from "cors";

import authRoutes from "./src/modules/auth/auth.routes";

const app: express.Express = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

export default app;
