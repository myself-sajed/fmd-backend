import express, { Request, Response } from "express";
import { HttpError } from "http-errors";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

// index route
app.get("/", (req, res) => {
    res.send({
        status: "success",
        message: "Welcome to the API of Find My Doctor",
    });
});

// doctor outes
import doctorRoutes from "./modules/doctor/routes/doctor-crud-routes";
app.use("/api/v1/doctors", doctorRoutes);

import caseRoutes from "./modules/case/routes/case-crud-routes";
app.use("/api/v1/cases", caseRoutes);

// Global error handling
app.use((err: HttpError, req: Request, res: Response) => {
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
