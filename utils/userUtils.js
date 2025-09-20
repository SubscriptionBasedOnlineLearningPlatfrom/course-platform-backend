import { supabase } from "../Database/SupabaseClient.js";

function normalizeUsername(input, maxLen = 30) {
  let base = (input || "").toLowerCase().replace(/[^a-z0-9_.]/g, "_");
  base = base.replace(/_+/g, "_").replace(/^_+|_+$/g, "");
  if (!base) base = "user";
  if (base.length > maxLen) base = base.slice(0, maxLen);
  return base;
}

async function isUsernameTaken(username) {
  const { count, error } = await supabase
    .from("instructors")
    .select("id", { count: "exact", head: true })
    .eq("username", username);

  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function getAvailableUsername(desiredBase) {
  const MAX_LEN = 30;
  const base = normalizeUsername(desiredBase, MAX_LEN);
  let candidate = base;

  if (!(await isUsernameTaken(candidate))) return candidate;

  for (let i = 0; i < 10; i++) {
    const suffix = Math.floor(Math.random() * 10000);
    const trimmedBase = base.slice(0, Math.max(1, MAX_LEN - String(suffix).length - 1));
    candidate = `${trimmedBase}_${suffix}`;
    if (!(await isUsernameTaken(candidate))) return candidate;
  }

  const ts = Date.now().toString().slice(-6);
  const trimmedBase = base.slice(0, Math.max(1, MAX_LEN - ts.length - 1));
  return `${trimmedBase}_${ts}`;
}