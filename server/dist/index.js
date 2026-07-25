"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const app_1 = __importDefault(require("./app"));
const slotCleanup_1 = require("./jobs/slotCleanup");
const slotGeneration_1 = require("./jobs/slotGeneration");
exports.prisma = new client_1.PrismaClient();
// Only bind the port / start background jobs when this file is the actual
// process entry point — not when it's required indirectly (e.g. by tests
// importing the app, or by any other module reaching for `prisma`).
if (require.main === module) {
    (0, slotCleanup_1.scheduleSlotCleanup)(exports.prisma);
    (0, slotGeneration_1.scheduleSlotGeneration)(exports.prisma);
    const PORT = process.env.PORT || 3000;
    app_1.default.listen(PORT, () => {
        console.log(`server is up at port ${PORT}`);
    });
}
//# sourceMappingURL=index.js.map