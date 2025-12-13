const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createPropertyTypes() {
  try {
    console.log('🚀 Creating property types...');
    
    const propertyTypes = [
      {
        code: 'APARTMENT',
        name: 'Apartment',
        description: 'High-rise residential unit in apartment building',
        icon: '🏠',
        isActive: true,
      },
      {
        code: 'CONDOMINIUM',
        name: 'Condominium',
        description: 'Luxury residential unit with premium facilities and amenities',
        icon: '🏬',
        isActive: true,
      },
      {
        code: 'HOUSE',
        name: 'House',
        description: 'Standalone landed residential property',
        icon: '🏡',
        isActive: true,
      },
      {
        code: 'TOWNHOUSE',
        name: 'Townhouse',
        description: 'Multi-level landed property in planned development',
        icon: '🏘️',
        isActive: true,
      },
      {
        code: 'VILLA',
        name: 'Villa',
        description: 'Luxurious single-family home with extensive grounds',
        icon: '🏰',
        isActive: true,
      },
      {
        code: 'PENTHOUSE',
        name: 'Penthouse',
        description: 'Luxury apartment on the top floor with premium amenities',
        icon: '🏙️',
        isActive: true,
      },
      {
        code: 'STUDIO',
        name: 'Studio',
        description: 'Open-concept single room residential unit',
        icon: '🏢',
        isActive: true,
      },
      {
        code: 'CONDO',
        name: 'Condominium',
        description: 'High-rise apartment',
        icon: '🏬',
        isActive: true,
      }
    ];

    let created = 0;
    for (const pt of propertyTypes) {
      try {
        await prisma.propertyType.upsert({
          where: { code: pt.code },
          update: pt,
          create: pt,
        });
        console.log(`✅ Created/Updated: ${pt.name} (${pt.code})`);
        created++;
      } catch (error) {
        console.error(`❌ Failed to create ${pt.name}:`, error.message);
      }
    }

    console.log(`🎉 Successfully processed ${created} property types`);
    
    // Verify
    const allTypes = await prisma.propertyType.findMany();
    console.log(`\n📋 Total property types in database: ${allTypes.length}`);
    allTypes.forEach(pt => {
      console.log(`- ${pt.name} (${pt.code}) - Active: ${pt.isActive}`);
    });

  } catch (error) {
    console.error('❌ Error creating property types:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createPropertyTypes();