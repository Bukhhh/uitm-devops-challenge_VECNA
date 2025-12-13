const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();

  try {
    // Check for properties with images
    const propertiesWithImages = await prisma.property.findMany({
      where: {
        images: {
          isEmpty: false
        }
      },
      select: {
        id: true,
        images: true,
        title: true,
        code: true
      },
      take: 3
    });

    console.log('Properties with images:', propertiesWithImages.length);
    if (propertiesWithImages.length > 0) {
      propertiesWithImages.forEach((property, index) => {
        console.log(`\nProperty ${index + 1}:`);
        console.log('ID:', property.id);
        console.log('Title:', property.title);
        console.log('Code:', property.code);
        console.log('Images array length:', property.images ? property.images.length : 0);
        console.log('First image:', property.images?.[0] || 'none');
      });
    }

    // Check total properties
    const totalProperties = await prisma.property.count();
    console.log('\nTotal properties in database:', totalProperties);

    // Check properties with FAZ codes (imported)
    const fazProperties = await prisma.property.findMany({
      where: {
        code: {
          startsWith: 'FAZ-'
        }
      },
      select: {
        id: true,
        images: true,
        title: true,
        code: true
      },
      take: 3
    });

    console.log('\nFAZ properties (imported):', fazProperties.length);
    if (fazProperties.length > 0) {
      fazProperties.forEach((property, index) => {
        console.log(`\nFAZ Property ${index + 1}:`);
        console.log('ID:', property.id);
        console.log('Title:', property.title);
        console.log('Code:', property.code);
        console.log('Images array length:', property.images ? property.images.length : 0);
        console.log('First image:', property.images?.[0] || 'none');
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();