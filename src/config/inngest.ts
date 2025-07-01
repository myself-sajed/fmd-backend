import { Inngest } from "inngest";
import { Config } from "./index";

export const inngest = new Inngest({
    id: "find-my-doctor",
    signingKey: Config.INNGEST_SIGNING_KEY,
});
