import { inngest } from "../../../config/inngest";

const onCaseCreation = inngest.createFunction(
    // argument 1: function metadata
    {id: 'on-case-creation', name: 'On Case Creation', retries:2},

    // argument 2: event name 
    {event: "case/created"}, 

    // argument 3: function handler
    async ({event, step})=>{
        try {
            const caseId = (event.data as Record<string, string>)?.caseId;

            if (!caseId) {
                throw new ;
            }
        } catch (error) {
            return {success: false}
        }
    }
)

export default onCaseCreation;