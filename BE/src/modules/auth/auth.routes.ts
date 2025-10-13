import { Router } from "express";
import { loginController, registerController, getProfileController, updateProfileController, oauthCallbackController } from "./auth.controller";
import { authenticateToken } from "../../middleware/auth";
import passport from "../../config/passport";

const router = Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.get("/profile", authenticateToken, getProfileController);
router.put("/profile", authenticateToken, updateProfileController);

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { 
    scope: ["profile", "email"],
    session: false 
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_failed`
  }),
  oauthCallbackController
);

// Facebook OAuth routes
router.get(
  "/facebook",
  passport.authenticate("facebook", { 
    scope: ["email"],
    session: false 
  })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=facebook_failed`
  }),
  oauthCallbackController
);

export default router;
