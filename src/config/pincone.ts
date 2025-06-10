import { Pinecone } from "@pinecone-database/pinecone";
import { Config } from ".";

const API_KEY = Config.PINECONE_API_KEY;

const pinecone = new Pinecone({ apiKey: API_KEY! });

export default pinecone;
