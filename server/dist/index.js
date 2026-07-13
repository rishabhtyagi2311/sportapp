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
const venue_route_1 = __importDefault(require("./routers/partner/venueManagement/venue.route"));
const slot_route_1 = __importDefault(require("./routers/partner/venueManagement/slot.route"));
const auth_route_1 = __importDefault(require("./routers/partner/auth/auth.route"));
const storage_route_1 = __importDefault(require("./routers/partner/storage/storage.route"));
const academy_route_1 = __importDefault(require("./routers/partner/academyManagement/academy.route"));
const slotCleanup_1 = require("./jobs/slotCleanup");
const slotGeneration_1 = require("./jobs/slotGeneration");
const app = (0, express_1.default)();
exports.prisma = new client_1.PrismaClient();
(0, slotCleanup_1.scheduleSlotCleanup)(exports.prisma);
(0, slotGeneration_1.scheduleSlotGeneration)(exports.prisma);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} from ${req.ip}`);
    next();
});
app.use('/api/v1/onboarding', onboardingRouter_1.router);
app.use('/api/v1/football', footballRouter_1.router);
app.use('/api/v1/partner', auth_route_1.default);
app.use('/api/v1/partner', storage_route_1.default);
app.use('/api/v1/partner', venue_route_1.default);
app.use('/api/v1/partner', slot_route_1.default);
app.use('/api/v1/partner', academy_route_1.default);
app.listen(3000, () => {
    console.log('server is up at port 3000');
});
//# sourceMappingURL=index.js.map