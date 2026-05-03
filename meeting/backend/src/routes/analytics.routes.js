const express = require("express");
const { getAnalytics } = require("../controllers/analytics.controller");
const { authRequired } = require("../middleware/auth");

const router = express.Router();
router.use(authRequired);

router.get("/", getAnalytics);

module.exports = router;
