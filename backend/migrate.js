import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  try {
    console.log('🔄 Running migrations...');

    // Read and execute schema
    const schemaPath = path.join(process.cwd(), 'backend/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await pool.query(schema);
    console.log('✅ Schema created');

    // Create default admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@suinmex.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

    const existingAdmin = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND role = $2',
      [adminEmail, 'admin']
    );

    if (existingAdmin.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await pool.query(
        `INSERT INTO users (email, password, name, role, is_active)
         VALUES ($1, $2, 'Administrador', 'admin', true)`,
        [adminEmail, hashedPassword]
      );
      console.log(`✅ Admin user created: ${adminEmail}`);
    } else {
      console.log(`ℹ️  Admin user already exists`);
    }

    console.log('\n✨ Migrations complete!');
    console.log(`📝 Admin credentials:`);
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`\n💡 Change password after first login!`);

    await pool.end();
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    process.exit(1);
  }
}

migrate();
