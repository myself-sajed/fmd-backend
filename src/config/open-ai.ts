import OpenAI from "openai";
import { Config } from ".";

const API_KEY = Config.OPEN_AI_API_KEY;

const openai = new OpenAI({
    apiKey: API_KEY!,
});

export default openai;
