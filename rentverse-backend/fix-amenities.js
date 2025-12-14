const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasourceUrl: 'postgresql://postgres:KaihDMqAnYruTAYhlOTEMhCuUBXUFFhb@gondola.proxy.rlwy.net:21435/railway'
});

async function fixAmenitiesTable() {
  try {
    console.log('🔍 Checking if amenities table exists...');

    // Check if table exists by trying to query it
    const tableCheck = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'amenities'
      );
    `;

    if (!tableCheck[0].exists) {
      console.log('❌ Amenities table does not exist. Creating it...');

      // Create the table if it doesn't exist
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS amenities (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL UNIQUE,
          category TEXT,
          icon TEXT,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      console.log('✅ Amenities table created');
    } else {
      console.log('✅ Amenities table exists');

      // Check if icon column exists, add it if not
      const iconColumnCheck = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = 'amenities'
          AND column_name = 'icon'
        );
      `;

      if (!iconColumnCheck[0].exists) {
        console.log('🔧 Adding icon column to amenities table...');
        await prisma.$executeRaw`
          ALTER TABLE amenities ADD COLUMN icon TEXT;
        `;
        console.log('✅ Icon column added');
      } else {
        console.log('✅ Icon column already exists');
      }

      // Check if updatedAt column exists, add it if not
      const updatedAtColumnCheck = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = 'amenities'
          AND column_name = 'updatedAt'
        );
      `;

      if (!updatedAtColumnCheck[0].exists) {
        console.log('🔧 Adding updatedAt column to amenities table...');
        await prisma.$executeRaw`
          ALTER TABLE amenities ADD COLUMN "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        `;
        console.log('✅ updatedAt column added');
      } else {
        console.log('✅ updatedAt column already exists');
      }
    }

    console.log('🔧 Inserting/updating WiFi amenity...');

    // Upsert the WiFi amenity
    const result = await prisma.$executeRaw`
      INSERT INTO amenities (id, name, category, icon, "updatedAt")
      VALUES ('1', 'WiFi', 'General', 'FaWifi', NOW())
      ON CONFLICT (id)
      DO UPDATE SET
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        icon = EXCLUDED.icon,
        "updatedAt" = NOW();
    `;

    console.log('✅ WiFi amenity inserted/updated successfully');

    // Verify the data
    const verify = await prisma.$queryRaw`
      SELECT * FROM amenities WHERE id = '1';
    `;

    console.log('🔍 Verification:', verify[0]);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAmenitiesTable();