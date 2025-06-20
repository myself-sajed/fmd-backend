import { config } from "dotenv";

config();

const {
    PORT,
    NODE_ENV,
    MONGO_URI,
    OPEN_AI_API_KEY,
    PINECONE_API_KEY,
    COHERE_API_KEY,
    GEMINI_AI_API_KEY,
} = process.env;

export const Config = {
    PORT,
    NODE_ENV,
    MONGO_URI,
    OPEN_AI_API_KEY,
    PINECONE_API_KEY,
    COHERE_API_KEY,
    GEMINI_AI_API_KEY,
};
