const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

async function test() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase.from("jobs").select("count");
  if (error) console.error("Error:", error.message);
  else console.log("Success, data:", data);
}

test();
