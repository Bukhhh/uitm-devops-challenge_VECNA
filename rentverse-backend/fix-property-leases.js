const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixPropertyDeletion() {
  const propertyId = '05259067-3232-4f61-ad62-31fc12f447ca';

  console.log('🔧 Fixing foreign key constraint violation for property deletion...');

  try {
    // Delete all leases that reference this property
    const deletedLeases = await prisma.lease.deleteMany({
      where: {
        propertyId: propertyId,
      },
    });

    console.log(`✅ Deleted ${deletedLeases.count} lease(s) that referenced the property.`);

    // Now you can safely delete the property if needed
    // Uncomment the following lines if you want to delete the property too
    /*
    const deletedProperty = await prisma.property.delete({
      where: {
        id: propertyId,
      },
    });

    console.log('✅ Property deleted successfully.');
    */

    console.log('🎉 Fix complete! You can now delete the property if needed.');

  } catch (error) {
    console.error('❌ Error fixing property deletion:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPropertyDeletion();