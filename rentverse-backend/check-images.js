const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkImages() {
  // Get first few properties to check their images
  const properties = await prisma.property.findMany({
    take: 3,
    select: {
      id: true,
      title: true,
      images: true
    }
  });

  console.log('Sample properties with images:');
  properties.forEach((prop, index) => {
    console.log(`\nProperty ${index + 1}: ${prop.title}`);
    console.log(`Images array length: ${prop.images ? prop.images.length : 0}`);
    console.log('Images type:', typeof prop.images);
    if (prop.images && prop.images.length > 0) {
      console.log('First image URL:', prop.images[0]);
      console.log('All images:', prop.images);
    }
  });

  await prisma.$disconnect();
}

checkImages().catch(console.error);