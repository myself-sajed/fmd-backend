import { CohereClient } from "cohere-ai";
import { Config } from ".";

const API_KEY = Config.COHERE_API_KEY;

const cohereai = new CohereClient({
    token: API_KEY,
});

export default cohereai;
