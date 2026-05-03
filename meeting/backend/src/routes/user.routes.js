const express = require("express");
const { patchMe, emailLogs } = require("../controllers/user.controller");
const { authRequired } = require("../middleware/auth");

const router = express.Router();
router.use(authRequired);

router.patch("/me", patchMe);
router.get("/me/email-logs", emailLogs);
router.get("/emails", emailLogs); // Alias for /api/users/emails

module.exports = router;
