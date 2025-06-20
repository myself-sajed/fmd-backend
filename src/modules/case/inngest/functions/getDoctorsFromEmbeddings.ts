import { ICase, ICaseClientPreferences } from "../../types/case-types";
import { PineconeDoctorIndex } from "../../../../lib/pinecone-index";

const getDoctorsFromEmbeddings = async (
    clientQueryEmbeddings: number[],
    caseObject: ICase,
) => {
    const prefs: ICaseClientPreferences = caseObject.client_preferences;

    // Create the filter object safely
    const pineconeFilter: Record<
        string,
        string | number | { $eq?: string | number } | { $in?: string[] }
    > = {};

    if (prefs?.gender_preference) {
        pineconeFilter.gender = { $eq: prefs.gender_preference.toLowerCase() };
    }

    if (prefs?.language) {
        pineconeFilter.languages = { $in: [prefs.language.toLowerCase()] };
    }

    if (prefs?.consultation_type) {
        pineconeFilter.consultation_types = {
            $eq: prefs.consultation_type.toLowerCase(),
        };
    }

    if (prefs?.location) {
        pineconeFilter.city = { $eq: prefs.location.toLowerCase() };
    }

    // Only add filter if it's not empty
    const filterToSend =
        Object.keys(pineconeFilter).length > 0 ? pineconeFilter : undefined;

    const queryResult = await PineconeDoctorIndex.query({
        vector: clientQueryEmbeddings,
        topK: 3,
        filter: filterToSend,
        includeMetadata: true,
    });

    return queryResult.matches || [];
};

export default getDoctorsFromEmbeddings;
