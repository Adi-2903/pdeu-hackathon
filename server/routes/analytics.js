const express = require('express');
const router = express.Router();

// GET dashboard analytics
router.get('/dashboard', (req, res) => {
  const db = req.app.locals.db;
  try {
    const totalCandidates = db.prepare('SELECT COUNT(*) as count FROM candidates').get().count;
    const activeCandidates = db.prepare("SELECT COUNT(*) as count FROM candidates WHERE status = 'Active'").get().count;
    const totalJobs = db.prepare('SELECT COUNT(*) as count FROM jobs').get().count;
    const openJobs = db.prepare("SELECT COUNT(*) as count FROM jobs WHERE status = 'Open'").get().count;
    const totalApplications = db.prepare('SELECT COUNT(*) as count FROM applications').get().count;
    const hiredCount = db.prepare("SELECT COUNT(*) as count FROM applications WHERE status = 'Hired'").get().count;
    const ghostCount = db.prepare('SELECT COUNT(*) as count FROM candidates WHERE ghost_status = 1').get().count;
    const passiveCount = db.prepare('SELECT COUNT(*) as count FROM candidates WHERE passive_pool = 1').get().count;
    const avgScore = db.prepare('SELECT AVG(score) as avg FROM applications WHERE score > 0').get().avg || 0;

    // Source distribution
    const sourceDistribution = db.prepare('SELECT source, COUNT(*) as count FROM candidates GROUP BY source ORDER BY count DESC').all();

    // Seniority distribution
    const seniorityDistribution = db.prepare('SELECT seniority_level, COUNT(*) as count FROM candidates GROUP BY seniority_level').all();

    // Pipeline funnel
    const pipelineFunnel = db.prepare(`SELECT ps.name, COUNT(a.id) as count FROM pipeline_stages ps LEFT JOIN applications a ON a.stage_id = ps.id GROUP BY ps.name ORDER BY ps.position`).all();

    // Recent activity
    const recentActivity = db.prepare(`SELECT al.*, c.full_name as candidate_name FROM activity_log al LEFT JOIN candidates c ON al.candidate_id = c.id ORDER BY al.created_at DESC LIMIT 20`).all();

    // Top skills
    const topSkills = db.prepare('SELECT skill_name, category, COUNT(*) as count FROM candidate_skills GROUP BY skill_name ORDER BY count DESC LIMIT 15').all();

    // Candidates by location
    const locationDistribution = db.prepare('SELECT location, COUNT(*) as count FROM candidates GROUP BY location ORDER BY count DESC LIMIT 10').all();

    // Weekly trend (simulated)
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      weeklyTrend.push({ date: d.toISOString().split('T')[0], candidates: Math.floor(Math.random() * 8) + 2, applications: Math.floor(Math.random() * 12) + 3 });
    }

    res.json({
      stats: { totalCandidates, activeCandidates, totalJobs, openJobs, totalApplications, hiredCount, ghostCount, passiveCount, avgScore: Math.round(avgScore) },
      sourceDistribution, seniorityDistribution, pipelineFunnel, recentActivity, topSkills, locationDistribution, weeklyTrend
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET D&I analytics
router.get('/diversity', (req, res) => {
  const db = req.app.locals.db;
  try {
    const locationDiversity = db.prepare('SELECT location, COUNT(*) as count FROM candidates GROUP BY location ORDER BY count DESC').all();
    const experienceBuckets = db.prepare(`SELECT 
      CASE 
        WHEN years_experience < 2 THEN '0-2 years'
        WHEN years_experience < 5 THEN '2-5 years'
        WHEN years_experience < 8 THEN '5-8 years'
        WHEN years_experience < 12 THEN '8-12 years'
        ELSE '12+ years'
      END as bracket,
      COUNT(*) as count
      FROM candidates GROUP BY bracket ORDER BY MIN(years_experience)`).all();
    
    const sourceDiversity = db.prepare(`SELECT s.type as source, ps.name as stage, COUNT(*) as count 
      FROM sources s JOIN candidates c ON s.candidate_id = c.id 
      LEFT JOIN applications a ON c.id = a.candidate_id 
      LEFT JOIN pipeline_stages ps ON a.stage_id = ps.id 
      GROUP BY s.type, ps.name`).all();

    const seniorityBySource = db.prepare('SELECT source, seniority_level, COUNT(*) as count FROM candidates GROUP BY source, seniority_level').all();

    res.json({ locationDiversity, experienceBuckets, sourceDiversity, seniorityBySource });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
