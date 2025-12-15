import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.get("/signup", (req, res) => {
  if (req.session.userId) return res.redirect("/listings/dashboard");
  res.render("auth/signup", { title: "Sign Up", error: null });
});

router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const available = await User.findOne({ email });
    if (available) {
      return res.render("auth/signup", {
        title: "Sign Up",
        error: "Email is already in use."
      });
    }

    const user = new User({ email, name });
    await user.setPassword(password);
    await user.save();

    req.session.userId = user._id.toString();
    req.session.save(() => res.redirect("/listings/dashboard"));
  } catch (err) {
    console.error("Signup error:", err);
    res.render("auth/signup", {
      title: "Sign Up",
      error: "Please Try Again"
    });
  }
});

router.get("/login", (req, res) => {
  if (req.session.userId) return res.redirect("/listings/dashboard");
  res.render("auth/login", { title: "Login", error: null });
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.render("auth/login", {
        title: "Login",
        error: "No account found with that email."
      });
    }

    const valid = await user.validatePassword(password);
    if (!valid) {
      return res.render("auth/login", {
        title: "Login",
        error: "Incorrect password."
      });
    }

    req.session.userId = user._id.toString();
    req.session.save(() => res.redirect("/listings/dashboard"));
  } catch (err) {
    console.error("Login error:", err);
    res.render("auth/login", {
      title: "Login",
      error: "Please try again"
    });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/auth/login"));
});

export default router;
