"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const matchSession_controller_1 = require("../../../controllers/user/matchSession/matchSession.controller");
const auth_middleware_1 = require("../../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get("/match-sessions", matchSession_controller_1.UserMatchSessionController.list);
router.get("/match-sessions/mine", auth_middleware_1.authenticateUser, matchSession_controller_1.UserMatchSessionController.mine);
router.get("/match-sessions/:sessionId", matchSession_controller_1.UserMatchSessionController.getById);
router.post("/match-sessions/:sessionId/join", auth_middleware_1.authenticateUser, matchSession_controller_1.UserMatchSessionController.join);
router.post("/match-sessions/:sessionId/leave", auth_middleware_1.authenticateUser, matchSession_controller_1.UserMatchSessionController.leave);
exports.default = router;
//# sourceMappingURL=matchSession.route.js.map