"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const index_1 = require("../index");
const types_1 = require("../types");
exports.router = (0, express_1.Router)();
exports.router.post("/basicInfo", async (req, res) => {
    console.log("request arrived");
    const parsedData = types_1.basicOnboardingInfo.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({ message: "Invalid data format" });
        return;
    }
    try {
        const user = await index_1.prisma.userInfo.findFirst({
            where: {
                contact: parsedData.data.contact
            }
        });
        if (user) {
            res.status(403).json({ message: "User Already Exists" });
            return;
        }
        const newUser = await index_1.prisma.userInfo.create({
            data: {
                firstname: parsedData.data.firstname,
                lastname: parsedData.data.lastname,
                dob: parsedData.data.dob,
                city: parsedData.data.city,
                email: parsedData.data.email,
                contact: parsedData.data.contact
            }
        });
        if (newUser) {
            res.status(200).json({ id: newUser.id, firstname: newUser.firstname, lastname: newUser.lastname,
            });
            return;
        }
        res.status(400).json({ message: "Cannot create new user" });
        return;
    }
    catch (e) {
        res.status(500).json({ message: "Server Error" });
        return;
    }
});
//# sourceMappingURL=onboardingRouter.js.map