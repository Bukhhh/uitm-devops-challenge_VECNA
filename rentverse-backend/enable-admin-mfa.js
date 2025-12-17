const { prisma } = require('./src/config/database');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

async function enableAdminMFA() {
  try {
    console.log('🔐 Enabling MFA for admin user...');

    // Find the admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@rentverse.com' },
      select: {
        id: true,
        email: true,
        role: true,
        mfaEnabled: true,
        mfaSecret: true
      }
    });

    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    console.log(`Found admin user: ${adminUser.email} (ID: ${adminUser.id})`);
    console.log(`Current MFA status: ${adminUser.mfaEnabled ? 'Enabled' : 'Disabled'}`);

    if (adminUser.mfaEnabled) {
      console.log('✅ MFA is already enabled for admin user');
      return;
    }

    // Generate TOTP secret
    console.log('Generating TOTP secret...');
    const secret = speakeasy.generateSecret({
      name: `RentVerse (${adminUser.email})`,
      issuer: 'RentVerse Secure Login',
      length: 20,
    });

    // Generate QR code for the secret
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    console.log('✅ TOTP secret generated');
    console.log(`Secret: ${secret.base32}`);
    console.log(`QR Code URL: ${qrCodeUrl}`);

    // Enable MFA for the admin user
    console.log('Enabling MFA for testing...');
    await prisma.user.update({
      where: { id: adminUser.id },
      data: {
        mfaEnabled: true,
        mfaSecret: secret.base32
      }
    });

    console.log('✅ MFA enabled successfully for admin user');
    console.log('\n📱 To set up MFA in an authenticator app:');
    console.log('1. Open Google Authenticator, Authy, or similar app');
    console.log('2. Scan the QR code or manually enter the secret:');
    console.log(`   Secret: ${secret.base32}`);
    console.log('3. The app will generate 6-digit codes for login');

    console.log('\n🔑 Admin login credentials:');
    console.log('Email: admin@rentverse.com');
    console.log('Password: password123');
    console.log('MFA: Required (use codes from authenticator app)');

    // Generate a sample TOTP code for testing
    const sampleToken = speakeasy.totp({
      secret: secret.base32,
      encoding: 'base32'
    });
    console.log(`\n🔢 Sample TOTP code (valid for 30 seconds): ${sampleToken}`);

  } catch (error) {
    console.error('❌ Error enabling MFA:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  enableAdminMFA()
    .then(() => {
      console.log('🎉 Admin MFA setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 MFA setup failed:', error);
      process.exit(1);
    });
}

module.exports = { enableAdminMFA };