const { prisma } = require('./src/config/database');

const additionalPropertyTypes = [
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

async function addPropertyTypes() {
  console.log('🏠 Adding additional property types to database...\n');

  try {
    let addedCount = 0;
    let skippedCount = 0;

    for (const typeData of additionalPropertyTypes) {
      try {
        // Check if property type already exists
        const existing = await prisma.propertyType.findUnique({
          where: { code: typeData.code }
        });

        if (existing) {
          console.log(`⏭️  Property type ${typeData.name} (${typeData.code}) already exists, skipping...`);
          skippedCount++;
          continue;
        }

        // Create new property type
        const newType = await prisma.propertyType.create({
          data: typeData
        });

        console.log(`✅ Added property type: ${newType.name} (${newType.code})`);
        addedCount++;

      } catch (error) {
        console.error(`❌ Error adding property type "${typeData.code}":`, error.message);
      }
    }

    console.log('\n📊 Property Types Addition Summary:');
    console.log(`✅ Successfully added: ${addedCount} property types`);
    console.log(`⏭️  Skipped (already exist): ${skippedCount} property types`);

    // Show current total
    const total = await prisma.propertyType.count();
    console.log(`📈 Total property types in database: ${total}`);

  } catch (error) {
    console.error('❌ Error during property types addition:', error);
    throw error;
  }
}

async function main() {
  try {
    await addPropertyTypes();
    console.log('\n🎉 Property types addition completed successfully!');
  } catch (error) {
    console.error('\n❌ Property types addition failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Allow direct execution
if (require.main === module) {
  main();
}

module.exports = { addPropertyTypes };