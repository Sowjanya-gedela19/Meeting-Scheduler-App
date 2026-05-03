const express = require("express");
const { getCalendar } = require("../controllers/calendar.controller");
const { authRequired } = require("../middleware/auth");

const router = express.Router();
router.use(authRequired);

router.get("/", getCalendar);

module.exports = router;
