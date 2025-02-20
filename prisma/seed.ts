import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Create initial social media platforms
    const platforms = [
        { name: 'Twitter' },
        { name: 'LinkedIn' },
        { name: 'Facebook' },
        { name: 'Instagram' },
    ];

    console.log('Seeding social media platforms...');

    for (const platform of platforms) {
        await prisma.socialMediaPlatform.upsert({
            where: { name: platform.name },
            update: {},
            create: platform,
        });
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 