import fs from 'fs'; 
import { createClient } from '@supabase/supabase-js'; 

const env = Object.fromEntries(
  fs.readFileSync('.env', 'utf-8')
    .split('\n')
    .filter(Boolean)
    .map(line => line.split('='))
); 

const supabase = createClient(env.VITE_SUPABASE_URL.trim(), env.VITE_SUPABASE_ANON_KEY.trim()); 

async function clean() { 
  console.log('Cleaning comments...');
  await supabase.from('comments').delete().neq('id', '00000000-0000-0000-0000-000000000000'); 
  
  console.log('Cleaning greetings...');
  await supabase.from('greetings').delete().neq('id', '00000000-0000-0000-0000-000000000000'); 
  
  console.log('Cleaning push subscriptions...');
  await supabase.from('push_subscriptions').delete().neq('id', 0); 
  
  console.log('DB Cleaned'); 
  
  const { data, error } = await supabase.storage.from('greetings_media').list(); 
  if (error) {
    console.error('Error fetching storage:', error);
  } else if (data && data.length > 0) { 
    // Filter out hidden folders if any (like .emptyFolderPlaceholder)
    const files = data.filter(f => f.name !== '.emptyFolderPlaceholder').map(f => f.name);
    if (files.length > 0) {
      const { error: rmError } = await supabase.storage.from('greetings_media').remove(files); 
      if (rmError) console.error('Error removing files', rmError);
      else console.log('Storage Cleaned:', files.length, 'files removed.'); 
    }
  } 
} 

clean().catch(console.error);
