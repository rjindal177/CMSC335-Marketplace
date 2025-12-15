import express from "express";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import session from "express-session";
import methodOverride from "method-override";

import authRouter from "./routes/auth.js";
import listingsRouter from "./routes/listings.js";

dotenv.config();
const app = express();

mongoose
  .connect(process.env.MONGO_CONNECTION_STRING, { dbName: "marketplace" })
  .then(() => console.log("Database Connected"))
  .catch((err) => console.error("Database Connection Error:", err));

app.set("view engine", "ejs");
app.set("views", path.resolve("views"));

app.use(express.static(path.resolve("public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride("_method"));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use((req, res, next) => {
  res.locals.currentUserId = req.session.userId || null;
  next();
});

app.use("/auth", authRouter);
app.use("/listings", listingsRouter);

app.get("/", (req, res) => {
  if (req.session.userId) return res.redirect("/listings/dashboard");
  return res.redirect("/auth/login");
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
