import { createAgent, gemini } from "@inngest/agent-kit";
import { Config } from "../../../../config";
import { IDoctor } from "../../../doctor/types/doctor-types";
import { ICase } from "../../types/case-types";
import {
    CASE_SYSTEM_PROMPT,
    getDynamicPromptForCaseAnalysis,
} from "../constants/case-prompts";

const analyseCase = async (caseObject: ICase, doctors: IDoctor[]) => {
    try {
        const caseAgent = createAgent({
            model: gemini({
                model: "gemini-1.5-flash-8b",
                apiKey: Config.GEMINI_AI_API_KEY,
            }),
            name: "AI Patient's Case Analyser",
            system: CASE_SYSTEM_PROMPT,
        });
        const AGENT_PROMPT = getDynamicPromptForCaseAnalysis(
            caseObject,
            doctors,
        );
        const response = await caseAgent.run(AGENT_PROMPT);
        return response;
    } catch (error) {
        console.log("error in analyse case catch block :", error);
        return false;
    }
};

export default analyseCase;
