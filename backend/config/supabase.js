import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import pg from 'pg';
const { Pool } = pg;

dotenv.config();

// 1. Initialize Supabase JS Client normally for models (CRUD)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

let supabase = null;
if (supabaseUrl && supabaseKey) {
  let parsedUrl = supabaseUrl;
  if (parsedUrl.startsWith('postgres')) {
    console.warn('⚠️ SUPABASE_URL looks like a database connection string. It should be your REST API URL (https://xyz.supabase.co). The JS client might fail.');
  }

  try {
    supabase = createClient(parsedUrl, supabaseKey, { auth: { persistSession: false } });
    console.log(`⚡ Supabase client initialized`);
  } catch (error) {
    console.warn('⚠️ Supabase JS Client failed:', error.message);
  }
}

export const initDatabase = async () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.warn('⚠️ No DATABASE_URL provided. Skipping automatic table creation.');
    return;
  }

  try {
    const pool = new Pool({
      connectionString: dbUrl,
    });
    
    const schemaPath = path.resolve(process.cwd(), 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
        console.warn('⚠️ schema.sql not found at', schemaPath);
        return;
    }
    
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🔄 Running automatic table creation...');
    await pool.query(schemaSql);
    console.log('✅ Database tables initialized successfully.');
    
    await pool.end();
  } catch (err) {
    console.error('❌ Failed to initialize database tables:', err.message);
  }
};

export { supabase };

