"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticatePartner = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticatePartner = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: "Access Denied: No Token Provided" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.partner = decoded;
        next();
    }
    catch (error) {
        res.status(403).json({ success: false, message: "Invalid or Expired Token" });
    }
};
exports.authenticatePartner = authenticatePartner;
//# sourceMappingURL=auth.middleware.js.map