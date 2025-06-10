import { PineconeDoctorIndex } from "../lib/pinecone-index";
import { DoctorModel } from "../modules/doctor/models/doctor-model";
import getVectorEmbeddings from "./getVectorEmbeddings";

export async function syncDoctorsToPinecone() {
    const doctors = await DoctorModel.find().populate("user");

    const vectors = await Promise.all(
        doctors.map(async (doc) => {
            const docText = `${doc.user.name} ${doc.specialization.join(
                ", ",
            )} ${doc.degree.join(", ")} ${doc.bio ?? ""}`;
            const embedding = await getVectorEmbeddings(docText);
            return {
                id: doc._id.toString(),
                values: embedding,
                metadata: {
                    userId: doc.user._id.toString(),
                    doctorId: doc._id.toString(),
                    name: doc.user.name,
                    specialization: doc.specialization,
                },
            };
        }),
    );

    await PineconeDoctorIndex.upsert(vectors);

    console.log(`✅ Synced ${vectors.length} doctors to Pinecone`);
}
