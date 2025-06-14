import { ICase, ICaseClientPreferences } from "../../types/case-types";
import { PineconeDoctorIndex } from "../../../../lib/pinecone-index";

const getDoctorsFromEmbeddings = async (
    clientQueryEmbeddings: number[],
    caseObject: ICase,
) => {
    const prefs: ICaseClientPreferences = caseObject.client_preferences;

    const pineconeFilter: Record<
        string,
        string | { $contains?: string; $eq?: string }
    > = {};

    if (prefs.gender_preference) {
        pineconeFilter.gender = prefs.gender_preference.toLowerCase();
    }

    if (prefs.language) {
        pineconeFilter.languages = { $contains: prefs.language.toLowerCase() };
    }

    if (prefs.consultation_type) {
        pineconeFilter.consultation_types = {
            $eq: prefs.consultation_type.toLowerCase(),
        };
    }

    if (prefs.location) {
        pineconeFilter.city = { $eq: prefs.location.toLowerCase() };
    }

    const queryResult = await PineconeDoctorIndex.query({
        vector: clientQueryEmbeddings,
        topK: 3,
        filter: pineconeFilter,
        includeMetadata: true,
    });

    return queryResult.matches || [];
};

export default getDoctorsFromEmbeddings;
