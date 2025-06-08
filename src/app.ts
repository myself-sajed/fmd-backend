import express, { Request, Response, NextFunction } from "express";
import { HttpError } from "http-errors";

const app = express();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.get("/", (req, res) => {
    res.send({
        status: "success",
        message: "Welcome to the API of Find My Doctor",
    });
});

// routes
import doctorRoutes from "./modules/doctor/routes/doctor-crud-routes";
app.use("/api/v1/doctors", doctorRoutes);

// Global error handling
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
