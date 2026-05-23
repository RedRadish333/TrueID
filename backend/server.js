import express from "express";
import session from "express-session";
import cors from "cors";
import { SiweMessage } from "siwe";

const app = express();
const PORT = 3000;
const CITIZEN_SESSION_MINUTES = 5;
const VERIFIER_SESSION_MINUTES = 30;

app.use(express.json());
app.use(cors({
  origin: "http://127.0.0.1:5500",
  credentials: true
}));

app.use(session({
  name: "trueid_session",
  secret: "trueid-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: "lax",
    maxAge: VERIFIER_SESSION_MINUTES * 60 * 1000
  }
}));

app.get("/nonce", (req, res) => {
  const nonce = Math.random().toString(36).substring(2, 15);
  req.session.nonce = nonce;
  res.json({ nonce });
});

app.get("/message", (req, res) => {
  const { address } = req.query;
  const nonce = Math.random().toString(36).substring(2, 15);
  req.session.nonce = nonce;

  const message = new SiweMessage({
    domain: "127.0.0.1:5500",
    address,
    statement: "Sign in to TRUEID Citizen Portal.",
    uri: "http://127.0.0.1:5500",
    version: "1",
    chainId: 11155111,
    nonce
  });

  res.json({ message: message.prepareMessage() });
});

app.post("/verify", async (req, res) => {
  const { message, signature, type } = req.body;

  if (!message || !signature) {
    return res.status(400).json({ error: "Message and signature required." });
  }

  try {
    const siweMessage = new SiweMessage(message);
    const { data: fields } = await siweMessage.verify({
      signature,
      nonce: req.session.nonce
    });

    const duration = type === "verifier" ? VERIFIER_SESSION_MINUTES : CITIZEN_SESSION_MINUTES;

    req.session.address = fields.address;
    req.session.loggedInAt = Date.now();
    req.session.expiresAt = Date.now() + duration * 60 * 1000;

    res.json({
      success: true,
      address: fields.address,
      expiresAt: req.session.expiresAt
    });
  } catch (err) {
    console.error("SIWE verification failed:", err);
    res.status(401).json({ error: "Invalid signature." });
  }
});

app.get("/session", (req, res) => {
  if (!req.session.address) {
    return res.json({ loggedIn: false });
  }

  const remaining = req.session.expiresAt - Date.now();
  if (remaining <= 0) {
    req.session.destroy();
    return res.json({ loggedIn: false });
  }

  res.json({
    loggedIn: true,
    address: req.session.address,
    expiresAt: req.session.expiresAt,
    remainingMs: remaining
  });
});

app.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`TRUEID backend running at http://localhost:${PORT}`);
});