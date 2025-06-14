import { createAgent, gemini } from "@inngest/agent-kit";
import { Config } from "../../../../config";
import { IDoctor } from "../../../doctor/types/doctor-types";
import { ICase } from "../../types/case-types";
import { CASE_SYSTEM_PROMPT } from "../constants/case-prompts";

const analyseCase = async (caseObject: ICase, doctors: IDoctor[]) => {
    const caseAgent = createAgent({
        model: gemini({
            model: "gemini-1.5-flash-8b",
            apiKey: Config.GEMINI_AI_API_KEY,
        }),
        name: "AI Patient's Case Analyser",
        system: CASE_SYSTEM_PROMPT,
    });

    const response = await caseAgent.run(`
        Patient Case Details:
        
        Raw Query:
        "${caseObject.client_raw_query}"
        
        Preferences:
        - Language: ${caseObject.client_preferences.language ?? "No preference"}
        - Gender Preference: ${
            caseObject.client_preferences.gender_preference ?? "No preference"
        }
        - Consultation Type: ${
            caseObject.client_preferences.consultation_type ?? "No preference"
        }
        - Previous Conditions: ${
            caseObject.client_preferences.previous_conditions?.join(", ") ??
            "None"
        }
        - Location: ${caseObject.client_preferences.location ?? "Not specified"}
        
        Doctor Options:
        ${doctors
            .map(
                (doc, i) => `Doctor ${i + 1}:
        - doctorId: ${doc.user._id?.toString()}
        - Name: ${doc.user.name}
        - Specializations: ${doc.specialization.join(", ")}
        - Degrees: ${doc.degree.join(", ")}
        - Experience: ${doc.experience} years
        - Languages: ${doc.languages.join(", ")}
        - Consultation Types: ${doc.consultation_types}
        - Gender: ${doc.user.gender ?? "Not specified"}
        - Location: ${doc.location?.city ?? "Unknown"}, ${
            doc.location?.state ?? "Unknown"
        }
        - Bio: ${doc.bio ?? "No bio available."}`,
            )
            .join("\n\n")}
        
        Analyze the above case using your medical expertise, and return ONLY the final JSON.
        `);

    return response;
};

export default analyseCase;
