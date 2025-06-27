/* eslint-disable @typescript-eslint/no-unused-vars */
import express, { NextFunction, Request, Response } from "express";
import { serve } from "inngest/express";
import { HttpError } from "http-errors";
import bodyParser from "body-parser";
import { inngest } from "./config/inngest";
import onCaseCreation from "./modules/case/inngest/onCaseCreation";
import cors from "cors";
const app = express();
app.use(
    cors({
        origin: Config.FRONT_END_URL,
        credentials: true,
    }),
);
app.use(bodyParser.json());

// index route
app.get("/", (req, res) => {
    res.send({
        status: "success",
        message: "Welcome to the API of Find My Doctor",
    });
});

// doctor outes
import authRoutes from "./modules/authentication/routes/auth";
app.use("/api/v1/auth", authRoutes);

// doctor outes
import doctorRoutes from "./modules/doctor/routes/doctor-crud-routes";
app.use("/api/v1/doctors", doctorRoutes);

// case routes
import caseRoutes from "./modules/case/routes/case-crud-routes";
import { Config } from "./config";
app.use("/api/v1/cases", caseRoutes);

// serve inngest
app.use(
    "/api/inngest",
    serve({
        client: inngest,
        functions: [onCaseCreation],
    }) as express.RequestHandler,
);

// Global error handling
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                msg: err.message,
                path: "",
                location: "",
            },
        ],
    });
});

export default app;
