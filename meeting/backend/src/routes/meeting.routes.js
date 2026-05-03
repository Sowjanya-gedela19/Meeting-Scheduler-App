const express = require("express");
const meeting = require("../controllers/meeting.controller");
const { authRequired } = require("../middleware/auth");

const router = express.Router();
router.use(authRequired);

router.get("/conflicts", meeting.conflicts);
router.get("/", meeting.list);
router.post("/", meeting.create);
router.get("/:id", meeting.getOne);
router.patch("/:id", meeting.update);
router.post("/:id/invitees", meeting.appendInvitees);
router.post("/:id/cancel", meeting.cancel);
router.post("/:id/restore", meeting.restore);
router.delete("/:id", meeting.remove);

module.exports = router;
