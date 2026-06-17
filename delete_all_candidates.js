// =====================================================
// DELETE ALL CANDIDATES SCRIPT - Ample Leap CRM
// Run this in browser console while logged in as ADMIN
// This will soft-delete ALL candidates so you can
// reimport clean data without duplicates.
// =====================================================

(async () => {
  const BASE = "https://crm-api-pied.vercel.app/api";
  const token = localStorage.getItem("crm_token");

  if (!token) {
    console.error("❌ Not logged in!");
    return;
  }

  const H = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };

  console.log("🔍 Fetching all candidates...");

  let allIds = [];
  let page = 1;

  // Fetch all pages
  while (true) {
    const res = await fetch(`${BASE}/candidates?page=${page}&limit=100`, { headers: H });
    const data = await res.json();
    const ids = (data.candidates || []).map(c => c.id);
    if (ids.length === 0) break;
    allIds = allIds.concat(ids);
    console.log(`📄 Page ${page}: found ${ids.length} candidates (total so far: ${allIds.length})`);
    if (page >= data.pages) break;
    page++;
  }

  console.log(`\n🗑️ Deleting ${allIds.length} candidates...`);

  let deleted = 0, failed = 0;

  for (const id of allIds) {
    try {
      const res = await fetch(`${BASE}/candidates?delete=1`, {
        method: "POST",
        headers: H,
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (res.ok) {
        deleted++;
        if (deleted % 20 === 0) console.log(`🗑️ Deleted ${deleted}/${allIds.length}`);
      } else {
        failed++;
        console.warn(`⚠️ Failed to delete id ${id}:`, data.error);
      }
    } catch (e) {
      failed++;
      console.error(`❌ Error deleting id ${id}:`, e.message);
    }
    await new Promise(r => setTimeout(r, 60));
  }

  console.log("\n========== DELETE COMPLETE ==========");
  console.log(`🗑️ Deleted: ${deleted}`);
  console.log(`❌ Failed:  ${failed}`);
  console.log("\n✅ Now run the import_candidates_final.js script to reimport clean data.");
})();
