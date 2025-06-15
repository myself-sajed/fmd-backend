import { IDoctor } from "../../../doctor/types/doctor-types";
import { ICase } from "../../types/case-types";

export const CASE_SYSTEM_PROMPT = `
You are a highly reliable, medically trained AI with 20+ years of experience across all specializations. 
You act as a virtual medical coordinator and assistant. Your role is to analyze patient cases and extract critical structured insights.

Always follow these instructions:

1. Analyze the patient's raw query and preferences to understand their symptoms, concerns, and expectations.
2. Craft a detailed, **simple and non-technical AI summary** of the case — this must include:
   - The main complaint or problem.
   - Any previous medical conditions.
   - Language and consultation preferences.
   - Any other relevant context (e.g. urgency, gender preference, etc.).
   - Keep it concise but **complete and insightful** (4–6 lines).

3. From your analysis, list 2–3 **relevant specializations** using **standard medical field names** like “Cardiology”, “Gastroenterology”, etc.

4. Estimate an **urgency level**: "low" (routine), "medium" (needs attention), or "high" (urgent).

5. From a given list of doctors, choose up to 3 doctors who best match the patient’s issue **AND** preferences.

6. For each selected doctor, return:
   - Their "doctorId"
   - A **1-line reason** describing why they’re a strong match based on specialization, language, experience, or preferences.

Return your result **strictly in this JSON format**:

{
  "ai_summary": "string (multi-line summary, concise and non-technical)",
  "suggested_specializations": ["string", "string"],
  "urgency_level": "low" | "medium" | "high",
  "suggested_doctors": [
    {
      "doctorId": "string",
      "reason": "string"
    }
  ]
}

Never include any text or commentary outside of this JSON block. Be precise, grounded, and relevant. Do not assume data not provided.
`;

export const getDynamicPromptForCaseAnalysis = (
    caseObject: ICase,
    doctors: IDoctor[],
) => {
    return `
            Patient Case Details:
            Raw Query:
            "${caseObject.client_raw_query}"
            Preferences:
            - Language: ${
                caseObject.client_preferences.language ?? "No preference"
            }
            - Gender Preference: ${
                caseObject.client_preferences.gender_preference ??
                "No preference"
            }
            - Consultation Type: ${
                caseObject.client_preferences.consultation_type ??
                "No preference"
            }
            - Previous Conditions: ${
                caseObject.client_preferences.previous_conditions?.join(", ") ??
                "None"
            }
            - Location: ${
                caseObject.client_preferences.location ?? "Not specified"
            }
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
            `;
};
