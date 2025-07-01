import { config } from "dotenv";

config();

const {
    PORT,
    NODE_ENV,
    MONGO_URI,
    FRONT_END_URL,
    OPEN_AI_API_KEY,
    PINECONE_API_KEY,
    COHERE_API_KEY,
    GEMINI_AI_API_KEY,
    JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET,
    INNGEST_SIGNING_KEY,
} = process.env;

export const Config = {
    PORT,
    NODE_ENV,
    FRONT_END_URL,
    MONGO_URI,
    OPEN_AI_API_KEY,
    PINECONE_API_KEY,
    COHERE_API_KEY,
    GEMINI_AI_API_KEY,
    JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET,
    INNGEST_SIGNING_KEY,
};
