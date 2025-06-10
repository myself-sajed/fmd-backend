import cohereai from "../config/cohere-ai";

// this function uses cohere to generate vector embeddings for a given text
async function getVectorEmbeddings(text: string): Promise<number[]> {
    try {
        const embed = await cohereai.v2.embed({
            texts: [text],
            model: "embed-english-v3.0",
            inputType: "classification",
            embeddingTypes: ["float"],
        });

        return embed.embeddings?.float?.[0] || [];
    } catch (error) {
        console.error("Cohere Embedding Error:", error);
        throw new Error("Failed to generate embedding.");
    }
}

export default getVectorEmbeddings;
