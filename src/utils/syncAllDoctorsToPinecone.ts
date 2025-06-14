import { PineconeDoctorIndex } from "../lib/pinecone-index";
import { DoctorModel } from "../modules/doctor/models/doctor-model";
import getVectorEmbeddings from "./getVectorEmbeddings";

export async function syncAllDoctorsToPinecone() {
    const doctors = await DoctorModel.find().populate("user").lean();

    const vectors = await Promise.all(
        doctors.map(async (doc) => {
            const docText = `
                ${doc.user.name}
                ${doc.specialization.join(", ")}
                ${doc.degree.join(", ")}
                ${doc.experience} years experience
                ${doc.bio ?? ""}
                prefers ${doc.consultation_types ?? ""} consultation
            `.toLowerCase(); // embedding text

            const embedding = await getVectorEmbeddings(docText);

            return {
                id: doc._id.toString(),
                values: embedding,
                metadata: {
                    doctorId: doc._id.toString(),
                    userId: doc.user._id.toString(),
                    name: doc.user.name.toLowerCase(),
                    specialization: doc.specialization.map((s) =>
                        s.toLowerCase(),
                    ),
                    degrees: doc.degree.map((d) => d.toLowerCase()),
                    gender: doc.user.gender?.toLowerCase(),
                    languages: doc.languages.map((l) => l.toLowerCase()),
                    consultation_types: doc.consultation_types?.toLowerCase(),
                    city: doc.location?.city?.toLowerCase() ?? "",
                    state: doc.location?.state?.toLowerCase() ?? "",
                    country: doc.location?.country?.toLowerCase() ?? "",
                    experience: doc.experience,
                },
            };
        }),
    );

    await PineconeDoctorIndex.upsert(vectors);
    console.log(`✅ Synced ${vectors.length} doctors to Pinecone`);
}
