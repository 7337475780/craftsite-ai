import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import crypto from "crypto";
import {
  signAuthToken,
  setAuthCookie,
  clearAuthCookie,
  getSafeUser,
} from "../lib/auth.js";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-me";

const registerSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.format(),
      });
      return;
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        authProvider: "credentials",
      },
    });

    // Generate JWT & Set cookie
    const token = signAuthToken(user);
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      data: getSafeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.format(),
      });
      return;
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.passwordHash) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Check password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Generate JWT & Set cookie
    const token = signAuthToken(user);
    setAuthCookie(res, token);

    res.json({
      success: true,
      data: getSafeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout
router.post("/logout", (_req: Request, res: Response) => {
  clearAuthCookie(res);
  res.json({ success: true, message: "Logged out successfully" });
});

// GET /api/auth/me
router.get("/me", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.craftsite_token;
    if (!token) {
      res.status(401).json({ success: false, message: "Unauthenticated" });
      return;
    }

    let payload: { userId: string; email: string };
    try {
      payload = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    } catch {
      res.status(401).json({ success: false, message: "Invalid session token" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      res.status(401).json({ success: false, message: "User not found" });
      return;
    }

    res.json({
      success: true,
      data: getSafeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

// Helper for temporary OAuth State verification
const setOauthStateCookie = (res: Response, state: string) => {
  res.cookie("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60 * 1000, // 10 minutes
  });
};

// GET /api/auth/google
router.get("/google", (req: Request, res: Response) => {
  const state = crypto.randomBytes(16).toString("hex");
  setOauthStateCookie(res, state);

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.append("client_id", process.env.GOOGLE_CLIENT_ID || "");
  googleAuthUrl.searchParams.append("redirect_uri", process.env.GOOGLE_REDIRECT_URI || "");
  googleAuthUrl.searchParams.append("response_type", "code");
  googleAuthUrl.searchParams.append("scope", "openid email profile");
  googleAuthUrl.searchParams.append("state", state);

  res.redirect(googleAuthUrl.toString());
});

// GET /api/auth/google/callback
router.get("/google/callback", async (req: Request, res: Response) => {
  const errorRedirect = process.env.FRONTEND_AUTH_ERROR_URL || "http://localhost:3000/sign-in?error=oauth_failed";
  const successRedirect = process.env.FRONTEND_AUTH_SUCCESS_URL || "http://localhost:3000/dashboard";

  try {
    const { code, state } = req.query;
    const savedState = req.cookies?.oauth_state;

    // Verify State
    if (!state || !savedState || state !== savedState) {
      res.redirect(errorRedirect);
      return;
    }

    // Clear state cookie
    res.clearCookie("oauth_state");

    if (!code) {
      res.redirect(errorRedirect);
      return;
    }

    // Exchange code for token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: code as string,
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: process.env.GOOGLE_REDIRECT_URI || "",
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      res.redirect(errorRedirect);
      return;
    }

    // Get user info
    const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userinfo = await userinfoRes.json();
    if (!userinfoRes.ok || !userinfo.email) {
      res.redirect(errorRedirect);
      return;
    }

    const googleId = userinfo.sub;
    const email = userinfo.email.toLowerCase().trim();
    const name = userinfo.name || userinfo.given_name || null;
    const image = userinfo.picture || null;

    // Find or Create User
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId },
          { email }
        ]
      }
    });

    if (user) {
      // Update Google ID/image if missing or changed
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId,
          image: user.image || image,
          name: user.name || name,
        }
      });
    } else {
      user = await prisma.user.create({
        data: {
          email,
          name,
          image,
          googleId,
          authProvider: "google",
        }
      });
    }

    // Sign Token and set HttpOnly cookie
    const token = signAuthToken(user);
    setAuthCookie(res, token);

    res.redirect(successRedirect);
  } catch (err) {
    console.error("Google OAuth Error:", err);
    res.redirect(errorRedirect);
  }
});

// GET /api/auth/github
router.get("/github", (req: Request, res: Response) => {
  const state = crypto.randomBytes(16).toString("hex");
  setOauthStateCookie(res, state);

  const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
  githubAuthUrl.searchParams.append("client_id", process.env.GITHUB_CLIENT_ID || "");
  githubAuthUrl.searchParams.append("redirect_uri", process.env.GITHUB_REDIRECT_URI || "");
  githubAuthUrl.searchParams.append("scope", "read:user user:email");
  githubAuthUrl.searchParams.append("state", state);

  res.redirect(githubAuthUrl.toString());
});

// GET /api/auth/github/callback
router.get("/github/callback", async (req: Request, res: Response) => {
  const errorRedirect = process.env.FRONTEND_AUTH_ERROR_URL || "http://localhost:3000/sign-in?error=oauth_failed";
  const successRedirect = process.env.FRONTEND_AUTH_SUCCESS_URL || "http://localhost:3000/dashboard";

  try {
    const { code, state } = req.query;
    const savedState = req.cookies?.oauth_state;

    // Verify State
    if (!state || !savedState || state !== savedState) {
      res.redirect(errorRedirect);
      return;
    }

    // Clear state cookie
    res.clearCookie("oauth_state");

    if (!code) {
      res.redirect(errorRedirect);
      return;
    }

    // Exchange code for token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID || "",
        client_secret: process.env.GITHUB_CLIENT_SECRET || "",
        code: code as string,
        redirect_uri: process.env.GITHUB_REDIRECT_URI || "",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      res.redirect(errorRedirect);
      return;
    }

    const accessToken = tokenData.access_token;

    // Get GitHub profile info
    const profileRes = await fetch("https://api.github.com/user", {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "User-Agent": "CraftSite-AI",
      },
    });

    const profile = await profileRes.json();
    if (!profileRes.ok || !profile.id) {
      res.redirect(errorRedirect);
      return;
    }

    const githubId = String(profile.id);
    const name = profile.name || profile.login || null;
    const image = profile.avatar_url || null;
    let email = profile.email ? profile.email.toLowerCase().trim() : null;

    // Fetch verified emails if email is not public
    if (!email) {
      const emailsRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "User-Agent": "CraftSite-AI",
        },
      });

      if (emailsRes.ok) {
        const emails = await emailsRes.json();
        const primaryVerified = emails.find((e: any) => e.primary && e.verified);
        const anyVerified = emails.find((e: any) => e.verified);
        const anyEmail = emails[0];
        
        const finalEmailObj = primaryVerified || anyVerified || anyEmail;
        if (finalEmailObj) {
          email = finalEmailObj.email.toLowerCase().trim();
        }
      }
    }

    if (!email) {
      res.redirect(`${errorRedirect}&reason=no_email`);
      return;
    }

    // Find or Create User
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { githubId },
          { email }
        ]
      }
    });

    if (user) {
      // Update GitHub ID/image if missing or changed
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          githubId,
          image: user.image || image,
          name: user.name || name,
        }
      });
    } else {
      user = await prisma.user.create({
        data: {
          email,
          name,
          image,
          githubId,
          authProvider: "github",
        }
      });
    }

    // Sign Token and set HttpOnly cookie
    const token = signAuthToken(user);
    setAuthCookie(res, token);

    res.redirect(successRedirect);
  } catch (err) {
    console.error("GitHub OAuth Error:", err);
    res.redirect(errorRedirect);
  }
});

export const authRouter = router;
