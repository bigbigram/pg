const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await hash('admin123', 12);
  
  // Create an admin user
  await prisma.user.upsert({
    where: { email: 'bigbigram@gmail.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'bigbigram@gmail.com',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('Database has been seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
