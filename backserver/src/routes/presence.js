const express = require("express");
const { markActive, markInactive, getOnlineUsers } = require("../controllers/presenceController");

const router = express.Router();

router.post("/", markActive);
router.delete("/", markInactive);
router.get("/", getOnlineUsers);

module.exports = router;
