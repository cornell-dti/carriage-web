import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
async function main() {
    // add yourself!
    const you = await prisma.admin.upsert({
        where: { email: "XXXXXX@cornell.edu" },
        update: {},
        create: {
            email: "XXXXXX@cornell.edu",
            firstName: "",
            lastName: "",
            phoneNumber: "", // numbers only!
            roles: ["SDS_ADMIN", "REDRUNNER_ADMIN"],
            isDriver: true,
        },
    });
    console.log({ you });
}
main()
    .then(async () => {
        await prisma.$disconnect();
        await pool.end();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        await pool.end();
        process.exit(1);
    });