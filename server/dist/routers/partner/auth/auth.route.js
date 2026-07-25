"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../../../controllers/partner/auth/auth.controller");
const auth_middleware_1 = require("../../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post("/auth/register", auth_controller_1.AuthController.register);
router.post("/auth/login", auth_controller_1.AuthController.login);
router.get("/auth/me", auth_middleware_1.authenticatePartner, auth_controller_1.AuthController.me);
router.put("/auth/me", auth_middleware_1.authenticatePartner, auth_controller_1.AuthController.updateProfile);
exports.default = router;
//# sourceMappingURL=auth.route.js.map