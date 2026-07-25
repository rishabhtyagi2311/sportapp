"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const venue_route_1 = __importDefault(require("./routers/partner/venueManagement/venue.route"));
const slot_route_1 = __importDefault(require("./routers/partner/venueManagement/slot.route"));
const auth_route_1 = __importDefault(require("./routers/partner/auth/auth.route"));
const storage_route_1 = __importDefault(require("./routers/partner/storage/storage.route"));
const academy_route_1 = __importDefault(require("./routers/partner/academyManagement/academy.route"));
const auth_route_2 = __importDefault(require("./routers/user/auth/auth.route"));
const venue_route_2 = __importDefault(require("./routers/user/venue/venue.route"));
const booking_route_1 = __importDefault(require("./routers/user/booking/booking.route"));
const matchSession_route_1 = __importDefault(require("./routers/user/matchSession/matchSession.route"));
const academy_route_2 = __importDefault(require("./routers/user/academyManagement/academy.route"));
const event_route_1 = __importDefault(require("./routers/user/eventManagement/event.route"));
const football_route_1 = __importDefault(require("./routers/user/footballManagement/football.route"));
// Express app definition, kept separate from process startup (listen +
// cron scheduling in index.ts) so it can be imported by tests via
// supertest without binding a port or starting background jobs.
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} from ${req.ip}`);
    next();
});
app.use('/api/v1/partner', auth_route_1.default);
app.use('/api/v1/partner', storage_route_1.default);
app.use('/api/v1/partner', venue_route_1.default);
app.use('/api/v1/partner', slot_route_1.default);
app.use('/api/v1/partner', academy_route_1.default);
app.use('/api/v1/user', auth_route_2.default);
app.use('/api/v1/user', venue_route_2.default);
app.use('/api/v1/user', booking_route_1.default);
app.use('/api/v1/user', matchSession_route_1.default);
app.use('/api/v1/user', academy_route_2.default);
app.use('/api/v1/user', event_route_1.default);
app.use('/api/v1/user', football_route_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map