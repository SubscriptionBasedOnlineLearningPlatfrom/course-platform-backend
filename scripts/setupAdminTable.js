import { supabase } from '../config/supabaseClient.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupAdminTable() {
  try {
    console.log('Setting up admin_users table...');

    // First check if table exists
    const { data: existingData, error: checkError } = await supabase
      .from('admin_users')
      .select('id')
      .limit(1);

    if (!checkError) {
      console.log('Admin users table already exists!');
      return;
    }

    console.log('Table does not exist. Please create it manually in Supabase dashboard using the SQL file:');
    console.log('Path: database/create_admin_users_table.sql');

    // Read and display the SQL content
    const sqlFilePath = path.join(__dirname, '../database/create_admin_users_table.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    console.log('\nSQL Content:');
    console.log('='.repeat(50));
    console.log(sqlContent);
    console.log('='.repeat(50));

    console.log('\nAfter creating the table in Supabase, run this script again to verify.');

  } catch (error) {
    console.error('Error setting up admin table:', error);
    process.exit(1);
  }
}

// Run the setup
setupAdminTable();
