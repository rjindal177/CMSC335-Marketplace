import express from "express";
import axios from "axios";
import Listing from "../models/Listing.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.get("/dashboard", requireAuth, async (req, res) => {
  try {
    const myListings = await Listing.find({ owner: req.session.userId }).sort({ createdAt: -1 });
    res.render("dashboard", {
      title: "My Dashboard",
      myListings,
      message: null,
      error: null,
    });
  } catch (err) {
    console.error("Dashboard load error:", err);
    res.render("dashboard", {
      title: "My Dashboard",
      myListings: [],
      error: "Unable to load your listings at the moment.",
      message: null,
    });
  }
});

router.get("/", requireAuth, async (req, res) => {
  try {
    const listings = await Listing.find({ owner: { $ne: req.session.userId } })
      .populate("owner", "email name")
      .sort({ createdAt: -1 });

    res.render("listings/index", {
      title: "Browse Listings",
      listings,
      error: null,
      message: null,
    });
  } catch (err) {
    console.error("Browse listings error:", err);
    res.render("listings/index", {
      title: "Browse Listings",
      listings: [],
      error: "Unable to fetch listings. Please try again later.",
      message: null,
    });
  }
});

router.get("/new", requireAuth, (req, res) => {
  res.render("listings/new", { title: "Add Listing", error: null });
}); 

router.post("/", requireAuth, async (req, res) => {
  try {
    const {
      title,
      price,
      category,
      description,
      city,
      contact,
      imageUrl,
      pickupAvailable,
      pickupLocation,
    } = req.body;

    const listing = new Listing({
      owner: req.session.userId,
      title,
      price: Number(price),
      category,
      description,
      city,
      contact,
      imageUrl,
      pickupAvailable: pickupAvailable === "on",
      pickupLocation,
    });

    await listing.save();

    const myListings = await Listing.find({ owner: req.session.userId }).sort({ createdAt: -1 });
    res.render("dashboard", {
      title: "My Dashboard",
      myListings,
      message: "Listing created successfully!",
      error: null,
    });
  } catch (err) {
    console.error("Listing create error:", err);
    res.render("listings/new", {
      title: "Add Listing",
      error: "Could not create listing. Please try again.",
    });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate("owner", "email name");

    if (!listing) {
      return res.render("listings/index", {
        title: "Browse Listings",
        listings: [],
        error: "Listing not found.",
        message: null,
      });
    }

    const weather = null;

    let pickupMapEmbedUrl = null;
    let pickupDirectionsUrl = null;

    if (listing.pickupAvailable) {
      const location = listing.pickupLocation || listing.city;
      if (location) {
        const encoded = encodeURIComponent(location);
        pickupDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;

        pickupMapEmbedUrl = `https://www.google.com/maps?q=${encoded}&output=embed`;
        
      }
    }

    res.render("listings/show", {
      title: listing.title,
      listing,
      weather,
      pickupMapEmbedUrl,
      pickupDirectionsUrl,
      error: null,
      message: null,
    });
  } catch (err) {
    console.error("Show listing error:", err);
    res.render("listings/index", {
      title: "Browse Listings",
      listings: [],
      error: "Error loading listing details.",
      message: null,
    });
  }
});

router.post("/:id/delete", requireAuth, async (req, res) => {
  try {
    const result = await Listing.deleteOne({ _id: req.params.id, owner: req.session.userId });

    const myListings = await Listing.find({ owner: req.session.userId }).sort({ createdAt: -1 });
    const message =
      result.deletedCount > 0
        ? "Listing deleted successfully."
        : "Could not delete listing (you might not be the owner).";

    res.render("dashboard", {
      title: "My Dashboard",
      myListings,
      message,
      error: null,
    });
  } catch (err) {
    console.error("Delete error:", err);
    const myListings = await Listing.find({ owner: req.session.userId }).sort({ createdAt: -1 });
    res.render("dashboard", {
      title: "My Dashboard",
      myListings,
      error: "Error deleting listing. Please try again.",
      message: null,
    });
  }
});

export default router;
