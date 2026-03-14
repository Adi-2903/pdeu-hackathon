const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.json');

function getDefaultData() {
  return {
    candidates: [], candidate_skills: [], work_experience: [], education: [],
    certifications: [], jobs: [], pipeline_stages: [], applications: [],
    sources: [], notes: [], activity_log: [], email_threads: [],
    duplicate_groups: [], search_queries: [], passive_pool: [],
    company_values: [], interview_feedback: [], talent_radar_scores: [],
    company_profile: {},
    offer_letters: [],
    email_logs: [],
    candidate_embeddings: [],
    questions: []
  };
}

function loadDb() {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    }
  } catch (e) { console.error('DB load error:', e.message); }
  return getDefaultData();
}

function saveDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function getDb() {
  const data = loadDb();
  return {
    data,
    save() { saveDb(data); },
    // Query helpers
    findAll(table, filter) {
      let items = data[table] || [];
      if (filter) items = items.filter(filter);
      return items;
    },
    findOne(table, filter) {
      return (data[table] || []).find(filter);
    },
    insert(table, record) {
      if (!data[table]) data[table] = [];
      data[table].push(record);
      return record;
    },
    update(table, filter, updates) {
      const items = data[table] || [];
      let count = 0;
      items.forEach((item, i) => {
        if (filter(item)) { data[table][i] = { ...item, ...updates }; count++; }
      });
      return count;
    },
    delete(table, filter) {
      if (!data[table]) return 0;
      const before = data[table].length;
      data[table] = data[table].filter(item => !filter(item));
      return before - data[table].length;
    },
    count(table, filter) {
      if (!filter) return (data[table] || []).length;
      return (data[table] || []).filter(filter).length;
    }
  };
}

function initializeDatabase() {
  if (!fs.existsSync(DB_PATH)) {
    saveDb(getDefaultData());
    console.log('Database initialized');
  } else {
    console.log('Database loaded');
  }
}

module.exports = { getDb, initializeDatabase, getDefaultData, DB_PATH };
