const express = require("express");
const meeting = require("../controllers/meeting.controller");

const router = express.Router();
router.get("/meetings/:code", meeting.publicByCode);

module.exports = router;
