"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeAuthToken = makeAuthToken;
exports.authHeader = authHeader;
exports.makeUserAuthToken = makeUserAuthToken;
exports.userAuthHeader = userAuthHeader;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/** Mints a real JWT the same way AuthService does, so tests exercise the
 * actual `authenticatePartner` middleware instead of bypassing it. */
function makeAuthToken(partnerId) {
    return jsonwebtoken_1.default.sign({ id: partnerId, type: 'partner' }, process.env.JWT_SECRET, { expiresIn: '1h' });
}
function authHeader(partnerId) {
    return { Authorization: `Bearer ${makeAuthToken(partnerId)}` };
}
/** Mints a real JWT the same way UserAuthService does, so tests exercise the
 * actual `authenticateUser` middleware instead of bypassing it. */
function makeUserAuthToken(userId) {
    return jsonwebtoken_1.default.sign({ id: userId, type: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
}
function userAuthHeader(userId) {
    return { Authorization: `Bearer ${makeUserAuthToken(userId)}` };
}
//# sourceMappingURL=auth.js.map