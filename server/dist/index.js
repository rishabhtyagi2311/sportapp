"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const onboardingRouter_1 = require("./routerUser/onboardingRouter");
const footballRouter_1 = require("./routerUser/footballRouter");
const client_1 = require("@prisma/client");
const app = (0, express_1.default)();
exports.prisma = new client_1.PrismaClient();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/v1/onboarding", onboardingRouter_1.router);
app.use("/api/v1/football", footballRouter_1.router);
app.listen(3000, () => {
    console.log("server is up at port 3000");
});
//# sourceMappingURL=index.js.map