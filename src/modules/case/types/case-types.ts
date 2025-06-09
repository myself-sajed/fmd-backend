import { Types } from "mongoose";

export enum CaseStatus {
    Pending = "pending",
    AwaitingConfirmation = "awaiting-confirmation",
    Scheduled = "scheduled",
    Resolved = "resolved",
    Cancelled = "cancelled",
}

export interface ICase extends Document {
    client: Types.ObjectId;
    client_raw_query: string;
    summary?: string; // AI-generated summary
    suggested_specializations?: string[]; // From AI
    urgency_level?: "low" | "medium" | "high"; // From AI triage
    assigned_doctor?: Types.ObjectId; // Doctor assigned to the case
    status: CaseStatus;
    preferred_time: string; // Preferred time for the appointment from the user
    scheduled_time?: Date;
    notes?: string; // Optional doctor/admin notes
    voice_note_url?: string; // Uploaded voice note from user
    voice_transcript?: string; // AI-generated transcript
    ai_response_log?: string[]; // Store any AI logs or message history
}
