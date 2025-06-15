import { NonRetriableError } from "inngest";
import { inngest } from "../../../config/inngest";
import { caseService } from "../routes/case-crud-routes";
import { CaseStatus, ICase, ICaseErrors } from "../types/case-types";
import createClientQueryEmbeddings from "./functions/createClientQueryEmbeddings";
import getDoctorsFromEmbeddings from "./functions/getDoctorsFromEmbeddings";
import { doctorService } from "../../doctor/routes/doctor-crud-routes";
import analyseCase from "./agents/analyseCase";
import { IDoctor } from "../../doctor/types/doctor-types";

const onCaseCreation = inngest.createFunction(
    // argument 1: function metadata
    { id: "on-case-creation", name: "On Case Creation", retries: 2 },

    // argument 2: event name
    { event: "case/created" },

    // argument 3: function handler
    async ({ event, step }) => {
        try {
            const caseId = (event.data as Record<string, string>)?.caseId;

            // check if case id is provided
            if (!caseId) {
                throw new NonRetriableError(
                    "Case ID was not found in the event data",
                );
            }

            // step 1: fetch the case data from the database
            const caseObject = await step.run("fetch-case", async () => {
                try {
                    return await caseService.getCaseById(caseId);
                } catch (error) {
                    throw new NonRetriableError(
                        "Case was not found in the database",
                    );
                }
            });

            // step 2: check the validity of the case
            await step.run("case-validity", async () => {
                const validCaseStatuses = [
                    CaseStatus.Pending,
                    CaseStatus.FailedToAnalyse,
                    CaseStatus.Cancelled,
                ];
                const hasQuery = caseObject.client_raw_query.trim();

                if (!validCaseStatuses.includes(caseObject.status)) {
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
            });

            // step 3: change the status of the case to "in-progress"
            await step.run("update-status-to-in-progress", async () => {
                await caseService.updateCase(caseId, {
                    status: CaseStatus.InProgress,
                });
            });

            // step 4: create embeddings of the client query
            const clientQueryEmbeddings = await step.run(
                "create-query-embeddings",
                async () => {
                    try {
                        return await createClientQueryEmbeddings(
                            caseObject as ICase,
                        );
                    } catch (error) {
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

            // step 5: change the status to searching for doctors if we get the embeddings
            await step.run("update-status-to-in-progress", async () => {
                await caseService.updateCase(caseId, {
                    status: CaseStatus.SuggestingDoctors,
                });
            });

            // step 6: query pinecone to get top 3 doctors
            const doctorMatches = await step.run(
                "get-top-3-doctors-from-pinecone",
                async () => {
                    return getDoctorsFromEmbeddings(
                        clientQueryEmbeddings,
                        caseObject as ICase,
                    );
                },
            );

            // step 6.1 : handle no doctor was matched
            if (!doctorMatches || doctorMatches.length === 0) {
                await step.run("change-status-to-no-doctors", async () => {
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

            // step: 6.2 change the status to analysing
            await step.run("change-status-to-analysing", async () => {
                await caseService.updateCase(caseId, {
                    status: CaseStatus.Analysing,
                });
            });

            // step 6.2 get the doctors from the db
            const doctors = await step.run("get-doctors-from-db", async () => {
                const doctorIds = doctorMatches.map(
                    (i) => i.metadata?.doctorId,
                );
                return await doctorService.getAllByIds(doctorIds as string[]);
            });

            // step 7: analyse case
            const response = await step.run("analyse-case", async () => {
                return analyseCase(
                    caseObject as ICase,
                    doctors as unknown as IDoctor[],
                );
            });

            console.log(response);
        } catch (error) {
            return;
        }
    },
);

export default onCaseCreation;
