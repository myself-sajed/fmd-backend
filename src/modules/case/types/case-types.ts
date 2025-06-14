import { Types } from "mongoose";
import { Gender } from "../../authentication/types/user-types";
import { IDoctorConsultationTypes } from "../../doctor/types/doctor-types";

export interface ICase {
    _id: Types.ObjectId | string;
    client: Types.ObjectId | string;
    client_raw_query: string;
    client_preferences: ICaseClientPreferences;
    ai_summary?: string;
    suggested_specializations?: string[];
    urgency_level?: "low" | "medium" | "high";
    assigned_doctor?: Types.ObjectId;
    doctor_notes?: string;
    status: CaseStatus;
    preferred_time: string;
    scheduled_time?: Date;
    voice_note_url?: string;
    voice_transcript?: string;
    ai_response_log?: string[];
    case_errors?: ICaseErrors;
}

export enum CaseStatus {
    Pending = "pending",
    InProgress = "in progress",
    SuggestingDoctors = "suggesting doctors",
    FailedSuggestingDoctors = "failed suggesting doctors",
    Analysing = "analysing",
    Analysed = "analysed",
    FailedToAnalyse = "failed to analyse",
    ScheduleRequested = "schedule requested",
    AwaitingScheduleConfirmation = "awaiting schedule confirmation",
    Scheduled = "scheduled",
    DoctorDeclined = "doctor declined",
    DoctorNoShow = "doctor no show",
    Resolved = "resolved",
    Cancelled = "cancelled",
}

export enum CaseUrgencyLevel {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
}

export interface ICaseClientPreferences {
    language?: string;
    gender_preference?: Gender | null;
    consultation_type?: IDoctorConsultationTypes | null;
    previous_conditions?: string[];
    location?: string;
}

export type ICaseErrors = {
    [key in CaseStatus]: string[];
};
