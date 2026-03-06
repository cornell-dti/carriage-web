import { config } from 'dotenv';
config({ path: '.env' }); 

import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient(); 

async function main() {
  const location = await prisma.location.create({
    data: {
      name: "Test Location",
      address: "123 Main St",
      shortName: "TEST",
      tag: "EAST",
      lat: 40.0,
      lng: -73.0,
    },
  });

  console.log("Created:", location);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });  