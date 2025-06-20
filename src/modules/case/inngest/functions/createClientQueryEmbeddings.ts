import getVectorEmbeddings from "../../../../utils/getVectorEmbeddings";
import { ICase } from "../../types/case-types";

async function createClientQueryEmbeddings(c: ICase) {
    const queryText = `
    ${c.client_raw_query}
    ${(c.client_preferences?.previous_conditions || [])?.join(", ") ?? ""}
    ${c.client_preferences?.consultation_type ?? ""}
    `;

    const embeddings = await getVectorEmbeddings(queryText);

    return embeddings;
}

export default createClientQueryEmbeddings;
