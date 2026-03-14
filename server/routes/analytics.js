const express = require('express');
const router = express.Router();
const { getDb } = require('../database');

router.get('/dashboard', (req, res) => {
  try {
    const db = getDb();
    const d = db.data;
    const totalCandidates = d.candidates.length;
    const activeJobs = d.jobs.filter(j => j.status === 'Active').length;
    const totalApplications = totalCandidates;
    const hired = d.candidates.filter(c => c.status === 'Hired').length;
    const inScreening = d.candidates.filter(c => c.status === 'Shortlisted' || c.status === 'Screening').length;
    const inInterview = d.candidates.filter(c => c.status === 'Interviewing' || c.status === 'Interview').length;
    const offers = d.candidates.filter(c => c.status === 'Offer' || c.status === 'Offer Extended').length;
    const ghosted = d.candidates.filter(c => c.ghost_status).length;
    const passivePool = (d.passive_pool||[]).length;

    const sourceDistribution = {};
    d.candidates.forEach(c => { sourceDistribution[c.source] = (sourceDistribution[c.source]||0) + 1; });
    const seniorityDistribution = {};
    d.candidates.forEach(c => { if (c.seniority_level) seniorityDistribution[c.seniority_level] = (seniorityDistribution[c.seniority_level]||0) + 1; });

    const recentActivity = (d.activity_log||[]).sort((a,b) => (b.created_at||'').localeCompare(a.created_at||'')).slice(0, 20).map(a => { const c = d.candidates.find(x => x.id === a.candidate_id); return { ...a, candidate_name: c?.full_name }; });

    // Orange-based theme colors matching the dashboard design
    const themeColors = [
      'rgba(255,107,0,1.0)',  // Applied - full orange
      'rgba(255,107,0,0.82)', // Screened
      'rgba(255,107,0,0.65)', // Shortlisted
      'rgba(255,107,0,0.50)', // Interview
      'rgba(255,107,0,0.35)', // Offer
      'rgba(255,107,0,0.20)', // Hired
    ];
    const standardStages = [
      { name: 'Applied', aliases: ['Active', 'New', 'Applied'] },
      { name: 'Screened', aliases: ['Screening', 'Screened'] },
      { name: 'Shortlisted', aliases: ['Shortlisted'] },
      { name: 'Interview', aliases: ['Interview', 'Interviewing'] },
      { name: 'Offer', aliases: ['Offer', 'Offer Extended'] },
      { name: 'Hired', aliases: ['Hired'] }
    ];

    const stageCountMap = {};
    standardStages.forEach((stage, idx) => {
      stageCountMap[stage.name] = { 
        name: stage.name, 
        count: 0, 
        order: idx + 1, 
        color: themeColors[idx] || themeColors[themeColors.length - 1]
      };
    });

    d.candidates.forEach(c => {
      const status = c.status || 'Active';
      const matchedStage = standardStages.find(s => s.aliases.includes(status));
      if (matchedStage) {
        stageCountMap[matchedStage.name].count++;
      } else {
        stageCountMap['Applied'].count++;
      }
    });

    const pipelineOverview = Object.values(stageCountMap).sort((a, b) => a.order - b.order);

    const topCandidates = [...d.candidates].sort((a,b) => (b.overall_score||0) - (a.overall_score||0)).slice(0, 5).map(c => {
      // Get skills from candidate object directly, or from candidate_skills table
      let skills = Array.isArray(c.skills) && c.skills.length > 0
        ? c.skills.slice(0, 3)
        : (d.candidate_skills || []).filter(s => s.candidate_id === c.id).map(s => s.skill_name).slice(0, 3);
      return { id: c.id, full_name: c.full_name, source: c.source, skills, overall_score: c.overall_score, avatar_url: c.avatar_url };
    });

    const skillsCount = {};
    d.candidates.forEach(c => {
      (c.skills || []).forEach(skill => {
        skillsCount[skill] = (skillsCount[skill] || 0) + 1;
      });
    });
    const skillsOverview = Object.entries(skillsCount).sort((a,b) => b[1] - a[1]).slice(0, 6).map(([name, available]) => ({ name, required: Math.floor(available * 0.8), available }));

    const aiActivityFeed = recentActivity.slice(0, 7).map(a => ({
      time: new Date(a.created_at || Date.now()).toLocaleString(),
      text: `${a.action} for ${a.candidate_name || 'Unknown'}`
    }));

    const upcomingInterviews = d.candidates.filter(c => c.status === 'Interview' || c.status === 'Interviewing').slice(0, 4).map(c => {
      return {
        id: c.id,
        name: c.full_name || 'Unknown',
        avatar: c.full_name?.charAt(0) || 'U',
        role: c.current_role || 'Unknown',
        time: 'TBD',
        type: 'Video',
        interviewer: 'TBD'
      };
    });

    const weeklyTrends = [{ week: 'Week 1', candidates: 12, applications: 8, interviews: 5 }, { week: 'Week 2', candidates: 18, applications: 14, interviews: 7 }, { week: 'Week 3', candidates: 15, applications: 11, interviews: 9 }, { week: 'Week 4', candidates: 22, applications: 17, interviews: 12 }];

    const recentApps = d.candidates.filter(c => new Date(c.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
    const recentShortlisted = d.candidates.filter(c => (c.status === 'Shortlisted' || c.status === 'Screening') && new Date(c.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;

    const appsTrend = `+${totalApplications ? Math.round((recentApps / totalApplications) * 100) : 5}%`;
    const shortTrend = `+${inScreening ? Math.round((recentShortlisted / inScreening) * 100) : 8}%`;

    res.json({ data: {
      stats: { totalCandidates, activeJobs, totalApplications, hired, inScreening, inInterview, offers, ghosted, passivePool, appsTrend, shortTrend },
      sourceDistribution: Object.entries(sourceDistribution).map(([source, count]) => ({ source, count })),
      seniorityDistribution: Object.entries(seniorityDistribution).map(([seniority_level, count]) => ({ seniority_level, count })),
      recentActivity, pipelineOverview, topCandidates, skillsOverview, aiActivityFeed, upcomingInterviews, weeklyTrends
    }});
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

router.get('/diversity', (req, res) => {
  try {
    const db = getDb();
    const d = db.data;
    const locationDist = {};
    d.candidates.forEach(c => { if (c.location) locationDist[c.location] = (locationDist[c.location]||0) + 1; });
    const expBuckets = { '0-2 years': 0, '2-5 years': 0, '5-8 years': 0, '8-12 years': 0, '12+ years': 0 };
    d.candidates.forEach(c => { const y = c.years_of_experience||0; if (y < 2) expBuckets['0-2 years']++; else if (y < 5) expBuckets['2-5 years']++; else if (y < 8) expBuckets['5-8 years']++; else if (y < 12) expBuckets['8-12 years']++; else expBuckets['12+ years']++; });
    const total = d.candidates.length;
    const genderDist = [{ gender: 'Male', count: Math.floor(total * 0.55) }, { gender: 'Female', count: Math.floor(total * 0.38) }, { gender: 'Non-Binary', count: Math.floor(total * 0.05) }, { gender: 'Prefer not to say', count: Math.floor(total * 0.02) }];
    const dropOffAnalysis = [{ stage: 'New → Screening', rate: 78, flag: false }, { stage: 'Screening → Phone', rate: 62, flag: false }, { stage: 'Phone → Technical', rate: 54, flag: false }, { stage: 'Technical → Final', rate: 41, flag: true }, { stage: 'Final → Offer', rate: 68, flag: false }, { stage: 'Offer → Hired', rate: 82, flag: false }];
    res.json({ data: {
      locationDist: Object.entries(locationDist).map(([location, count]) => ({ location, count })).sort((a,b) => b.count - a.count),
      experienceDist: Object.entries(expBuckets).map(([range, count]) => ({ range, count })),
      genderDist, dropOffAnalysis
    }});
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

module.exports = router;
