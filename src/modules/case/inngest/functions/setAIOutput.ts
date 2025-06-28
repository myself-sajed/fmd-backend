import {
    CaseStatus,
    IAIDoctorSummary,
    IAIParsedOutput,
    ICase,
    ICaseErrors,
} from "../../types/case-types";
import { caseService } from "../../routes/case-crud-routes";

export interface AIAgentResult {
    output: [
        {
            content: string;
        },
    ];
}

const setAIOutput = async (
    ai_result: AIAgentResult,
    caseObject: ICase,
): Promise<{ success: boolean; error?: string }> => {
    try {
        const content = ai_result?.output?.[0]?.content;

        if (!content || typeof content !== "string") {
            const msg = "AI result content is missing or invalid.";
            return { success: false, error: msg };
        }

        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);

        if (!jsonMatch || !jsonMatch[1]) {
            const msg = "Failed to match valid JSON block from AI result.";
            return { success: false, error: msg };
        }

        let parsed: IAIParsedOutput;

        try {
            parsed = JSON.parse(jsonMatch[1]) as IAIParsedOutput;
        } catch (parseError) {
            const msg = "JSON parsing failed.";
            return { success: false, error: msg };
        }

        const {
            ai_summary,
            ai_case_name,
            suggested_specializations,
            urgency_level,
            suggested_doctors,
            tips,
        } = parsed;

        // Validate parsed types
        if (
            typeof ai_summary !== "string" ||
            !Array.isArray(suggested_specializations) ||
            !["low", "medium", "high"].includes(urgency_level) ||
            !Array.isArray(suggested_doctors)
        ) {
            const msg = "Parsed AI output does not match expected schema.";
            return { success: false, error: msg };
        }

        const doctorObjectIds = suggested_doctors
            .filter((doc) => typeof doc.doctorId === "string")
            .map((doc) => doc.doctorId);

        const aiDoctorSummary: IAIDoctorSummary = suggested_doctors.reduce(
            (acc, doc) => {
                acc[doc.doctorId] = {
                    suitability_score: doc?.suitability_score,
                    follow_up_recommendation: doc?.follow_up_recommendation,
                    reason: doc?.reason,
                    next_steps: doc?.next_steps,
                };
                return acc;
            },
            {} as IAIDoctorSummary,
        );

        const dataToUpdate = {
            ai_summary,
            ai_case_name: ai_case_name || `Case - ${caseObject._id.toString()}`,
            suggested_specializations,
            urgency_level,
            suggested_doctors: doctorObjectIds,
            ai_doctor_summary: aiDoctorSummary,
            tips,
            status: CaseStatus.Analysed,
        };

        await caseService.updateCase(caseObject._id.toString(), dataToUpdate);

        return { success: true };
    } catch (err) {
        await caseService.updateCase(caseObject._id.toString(), {
            status: CaseStatus.FailedToAnalyse,
            case_errors: {
                ...(caseObject?.case_errors || {}),
                [CaseStatus.FailedToAnalyse]: [
                    "The system could not analyse the AI response, try again.",
                ],
            } as ICaseErrors,
        });
        return { success: false, error: "Unexpected error in setAIOutput" };
    }
};

export default setAIOutput;
