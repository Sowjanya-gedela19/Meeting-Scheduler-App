const express = require("express");
const { getAvailability, updateAvailability } = require("../controllers/availability.controller");
const { authRequired } = require("../middleware/auth");

const router = express.Router();
router.use(authRequired);

router.get("/", getAvailability);
router.post("/", updateAvailability);

module.exports = router;
