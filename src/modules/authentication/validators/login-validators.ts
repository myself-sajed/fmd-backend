import { checkSchema } from "express-validator";

export default checkSchema({
    email: {
        isEmail: true,
        notEmpty: true,
        errorMessage: "Please enter a valid email",
    },
    password: {
        notEmpty: true,
        errorMessage: "Please enter a valid password",
    },
});
