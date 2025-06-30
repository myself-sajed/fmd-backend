import { NonRetriableError } from "inngest";
import { inngest } from "../../../config/inngest";
import { caseService } from "../routes/case-crud-routes";
import { CaseStatus, ICase, ICaseErrors } from "../types/case-types";
import createClientQueryEmbeddings from "./functions/createClientQueryEmbeddings";
import getDoctorsFromEmbeddings from "./functions/getDoctorsFromEmbeddings";
import { doctorService } from "../../doctor/routes/doctor-crud-routes";
import analyseCase from "./agents/analyseCase";
import { IDoctor } from "../../doctor/types/doctor-types";
import setAIOutput, { AIAgentResult } from "./functions/setAIOutput";

const onCaseCreation = inngest.createFunction(
    // argument 1: function metadata
    { id: "on-case-creation", name: "On Case Creation", retries: 2 },

    // argument 2: event name
    { event: "case/created" },

    // argument 3: function handler
    async ({ event, step }) => {
        console.log("req came here in case creation");
        try {
            const caseId = (event.data as Record<string, string>)?.caseId;
            if (!caseId) {
                throw new NonRetriableError(
                    "Case ID was not found in the event data",
                );
            }

            // Step 1: Fetch the case from DB
            const caseObject = await step.run("fetch-case", async () => {
                try {
                    return await caseService.getCaseById(caseId);
                } catch {
                    throw new NonRetriableError(
                        "Case was not found in the database",
                    );
                }
            });

            // Step 2: Validate case
            await step.run("case-validity", async () => {
                const validStatuses = [
                    CaseStatus.Pending,
                    CaseStatus.FailedToAnalyse,
                    CaseStatus.Cancelled,
                ];
                const hasQuery = caseObject.client_raw_query.trim();

                if (!validStatuses.includes(caseObject.status)) {
                    throw new NonRetriableError(
                        "Cannot process the case as it is already analysed",
                    );
                }

                if (!hasQuery) {
                    await caseService.updateCase(caseId, {
                        status: CaseStatus.FailedToAnalyse,
                        case_errors: {
                            ...(caseObject?.case_errors || {}),
                            [CaseStatus.FailedToAnalyse]: [
                                "Could not process because client query was empty.",
                            ],
                        } as ICaseErrors,
                    });
                    throw new NonRetriableError(
                        "Cannot process on empty client query",
                    );
                }

                return { isValid: true };
            });

            // Step 3: Update status to InProgress
            await step.run("update-status-to-in-progress", async () => {
                return await caseService.updateCase(caseId, {
                    status: CaseStatus.InProgress,
                });
            });

            // Step 4: Create embeddings from client query
            const clientQueryEmbeddings = await step.run(
                "create-query-embeddings",
                async () => {
                    try {
                        return await createClientQueryEmbeddings(
                            caseObject as ICase,
                        );
                    } catch {
                        await caseService.updateCase(caseId, {
                            status: CaseStatus.FailedToAnalyse,
                            case_errors: {
                                ...(caseObject?.case_errors || {}),
                                [CaseStatus.FailedToAnalyse]: [
                                    "Internal Server Error, try again...",
                                ],
                            } as ICaseErrors,
                        });
                        throw new NonRetriableError(
                            "Could not create embeddings from the client query",
                        );
                    }
                },
            );

            // Step 5: Update status to SuggestingDoctors
            await step.run("update-status-to-suggesting-doctors", async () => {
                return await caseService.updateCase(caseId, {
                    status: CaseStatus.SuggestingDoctors,
                });
            });

            // Step 6: Get top doctors from embeddings
            const doctorMatches = await step.run(
                "get-top-doctors-from-pinecone",
                async () => {
                    return await getDoctorsFromEmbeddings(
                        clientQueryEmbeddings,
                        caseObject as ICase,
                    );
                },
            );

            if (!doctorMatches || doctorMatches.length === 0) {
                await step.run("handle-no-doctors-found", async () => {
                    await caseService.updateCase(caseId, {
                        status: CaseStatus.FailedSuggestingDoctors,
                        case_errors: {
                            ...(caseObject?.case_errors || {}),
                            [CaseStatus.FailedSuggestingDoctors]: [
                                "No matching doctor found",
                            ],
                        } as ICaseErrors,
                    });
                    throw new NonRetriableError(
                        "Could not find any doctor matching the query embeddings and filters",
                    );
                });
            }

            // Step 7: Update status to Analysing
            await step.run("update-status-to-analysing", async () => {
                return await caseService.updateCase(caseId, {
                    status: CaseStatus.Analysing,
                });
            });

            // Step 8: Fetch doctors by ID from DB
            const doctors = await step.run(
                "fetch-doctors-from-db",
                async () => {
                    const doctorIds = doctorMatches
                        .map((i) => i.metadata?.doctorId)
                        .filter(Boolean);
                    const list = await doctorService.getAllByIds(
                        doctorIds as string[],
                    );

                    if (!list || list.length === 0) {
                        throw new NonRetriableError(
                            "Doctor records not found in DB for matched IDs",
                        );
                    }
                    return list;
                },
            );

            // Step 9: Analyse case using LLM agent
            const analysisResult = await analyseCase(
                caseObject as ICase,
                doctors as unknown as IDoctor[],
            );
            if (!analysisResult) {
                throw new Error("LLM agent returned no result");
            }

            // Step 10: Update case status to Analysed
            await step.run("update-status-to-analysed", async () => {
                return await caseService.updateCase(caseId, {
                    status: CaseStatus.Analysed,
                });
            });

            // Step 11: Parse and store AI output
            await step.run("store-ai-output", async () => {
                try {
                    await setAIOutput(
                        analysisResult as unknown as AIAgentResult,
                        caseObject as ICase,
                    );
                } catch (e) {
                    throw new Error(
                        "Failed to persist AI output to case record",
                    );
                }
            });

            return {
                status: "success",
                data: analysisResult,
            };
        } catch (error) {
            const caseId = (event.data as Record<string, string>)?.caseId;
            await caseService.updateCase(caseId, {
                status: CaseStatus.FailedToInitiate,
                case_errors: {
                    [CaseStatus.FailedToInitiate]: ["Case failed"],
                } as ICaseErrors,
            });
            return {
                status: "error",
                error,
            };
        }
    },
);

export default onCaseCreation;
