
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const categories = await prisma.category.findMany();
        console.log("Categories found:", categories.length);
        if (categories.length > 0) {
            console.log("First category sample:", categories[0]);
            console.log("Subs type:", typeof categories[0].subs);
            console.log("Subs content:", categories[0].subs);

            try {
                JSON.parse(categories[0].subs);
                console.log("Subs is valid JSON");
            } catch (e) {
                console.log("Subs is NOT valid JSON");
            }
        } else {
            console.log("No categories in DB.");
        }
    } catch (e) {
        console.error("Error connecting to DB:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
