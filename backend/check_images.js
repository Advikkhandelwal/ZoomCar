const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cars = await prisma.car.findMany({
    select: { brand: true, model: true, image: true }
  });
  console.log(cars);
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
