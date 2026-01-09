const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/https");
const admin = require("firebase-admin");
const crypto = require("crypto");

admin.initializeApp();
const db = admin.firestore();

// Limit concurrency (cost control)
setGlobalOptions({ maxInstances: 10 });

/**
 * Enrich session with geo data using IP
 * URL: https://REGION-PROJECT_ID.cloudfunctions.net/enrichSessionGeo
 */
exports.enrichSessionGeo = onRequest(async (req, res) => {
  try {
    const sessionId = req.query.sessionId;

    if (!sessionId) {
      return res.status(400).send("Missing sessionId");
    }

    // Get client IP (Firebase-aware)
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress;

    if (!ip) {
      return res.status(200).send("No IP");
    }

    // Hash IP (privacy-safe)
    const ipHash = crypto
      .createHash("sha256")
      .update(ip)
      .digest("hex");

    // Geo lookup (free, no key)
    const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
    const geo = await geoRes.json();

    if (!geo || geo.error) {
      return res.status(200).send("Geo lookup failed");
    }

    // Update Firestore session
    await db.collection("sessions").doc(sessionId).set(
      {
        location: {
          country: geo.country_name || null,
          countryCode: geo.country_code || null,
          city: geo.city || null,
        },
        ipHash,
      },
      { merge: true }
    );

    return res.status(200).send("OK");
  } catch (err) {
    console.error("Geo enrichment error:", err);
    return res.status(500).send("Error");
  }
});
