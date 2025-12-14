const { PrismaClient } = require('@prisma/client');

// This script will connect to your production database and add the missing property types
// Make sure to set your DATABASE_URL environment variable to your Railway database URL

const prisma = new PrismaClient();

const propertyTypesToAdd = [
  {
    code: 'CONDOMINIUM',
    name: 'Condominium',
    description: 'Luxury residential unit with premium facilities and amenities',
    icon: '🏙️',
    isActive: true
  },
  {
    code: 'TOWNHOUSE',
    name: 'Townhouse',
    description: 'Multi-level landed property in planned development',
    icon: '🏘️',
    isActive: true
  },
  {
    code: 'STUDIO',
    name: 'Studio',
    description: 'Open-concept single room residential unit',
    icon: '🎛️',
    isActive: true
  },
  {
    code: 'PENTHOUSE',
    name: 'Penthouse',
    description: 'Luxury apartment on the top floor with premium amenities',
    icon: '🌆',
    isActive: true
  },
  {
    code: 'VILLA',
    name: 'Villa',
    description: 'Luxurious single-family home with extensive grounds',
    icon: '🏡',
    isActive: true
  },
  {
    code: 'BUNGALOW',
    name: 'Bungalow',
    description: 'Single-story house with spacious layout',
    icon: '🏠',
    isActive: true
  },
  {
    code: 'LOFT',
    name: 'Loft',
    description: 'Industrial-style open space apartment',
    icon: '🏭',
    isActive: true
  }
];

async function addPropertyTypesToProduction() {
  console.log('🏠 Connecting to production database...');
  console.log('📊 Adding missing property types...\n');

  try {
    let addedCount = 0;
    let skippedCount = 0;

    for (const propertyType of propertyTypesToAdd) {
      try {
        // Check if property type already exists
        const existing = await prisma.propertyType.findUnique({
          where: { code: propertyType.code }
        });

        if (existing) {
          console.log(`⏭️  ${propertyType.name} (${propertyType.code}) already exists, skipping...`);
          skippedCount++;
          continue;
        }

        // Create the property type
        const created = await prisma.propertyType.create({
          data: propertyType
        });

        console.log(`✅ Added: ${created.name} (${created.code})`);
        addedCount++;

      } catch (error) {
        console.error(`❌ Error adding ${propertyType.code}:`, error.message);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Successfully added: ${addedCount} property types`);
    console.log(`⏭️  Skipped (already exist): ${skippedCount} property types`);

    // Show total count
    const total = await prisma.propertyType.count();
    console.log(`📈 Total property types in database: ${total}`);

  } catch (error) {
    console.error('❌ Database connection or operation failed:', error);
    process.exit(1);
  }
}

// Run the script
addPropertyTypesToProduction()
  .then(() => {
    console.log('\n🎉 Property types addition completed successfully!');
    console.log('🔄 You can now test /property/new - it should show 9 property types instead of 2');
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });