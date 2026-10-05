const { MongoClient } = require("mongodb");

const client = new MongoClient("mongodb://localhost:27017");

async function main() {
    try {
        await client.connect();

        const db = client.db("studentDB");
        const collection = db.collection("students");

        const result = await collection.aggregate([
            { $unwind: "$subjects" },
            {
                $group: {
                    _id: "$studentId",
                    name: { $first: "$name" },
                    department: { $first: "$department" },
                    totalMarks: { $sum: "$subjects.marks" },
                    averageMarks: { $avg: "$subjects.marks" },
                    highestMarks: { $max: "$subjects.marks" },
                    lowestMarks: { $min: "$subjects.marks" }
                }
            },
            {
                $project: {
                    _id: 0,
                    studentId: "$_id",
                    name: 1,
                    department: 1,
                    totalMarks: 1,
                    averageMarks: { $round: ["$averageMarks", 2] },
                    highestMarks: 1,
                    lowestMarks: 1
                }
            },
            { $sort: { averageMarks: -1 } }
        ]).toArray();

        console.table(result);

    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}

main();