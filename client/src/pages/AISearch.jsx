import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import GlassCard from '../components/ui/GlassCard';
import OrangeButton from '../components/ui/OrangeButton';
import Badge from '../components/ui/Badge';
import { Sparkles, Download, SlidersHorizontal, User, MapPin, Building, ChevronDown, Check, MoreHorizontal } from 'lucide-react';

const AISearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchPhase, setSearchPhase] = useState(0);
  const [results, setResults] = useState([]);
  const [parsedContext, setParsedContext] = useState(null);
  const [sortBy, setSortBy] = useState('score'); // 'score' | 'experience'

  // Filters State
  const [filters, setFilters] = useState({ matchMin: 50, exp: 'Any', source: 'All' });
  const [viewMode, setViewMode] = useState('grid');

  // Apply filters + sort to results
  const displayedResults = useMemo(() => {
    let out = [...results];
    if (filters.matchMin > 0) out = out.filter(c => (c.score || 0) >= filters.matchMin);
    if (filters.source !== 'All') out = out.filter(c => c.source === filters.source);
    if (sortBy === 'experience') out.sort((a, b) => parseInt(b.experience) - parseInt(a.experience));
    else out.sort((a, b) => (b.score || 0) - (a.score || 0));
    return out;
  }, [results, filters, sortBy]);

  const exportCSV = () => {
    if (!results.length) return;
    const header = 'Name,Role,Company,Location,Experience,Score,Source';
    const rows = results.map(c => `"${c.name}","${c.role}","${c.company}","${c.location}","${c.experience}",${c.score},"${c.source}"`);
    const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'ai_search_results.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const exampleQueries = [
    "Senior Python dev, 5+ years",
    "React + Node.js, Bangalore",
    "ML engineer with fintech exp",
    "Full-stack, remote-friendly"
  ];

  const handleExampleClick = (q) => {
    setQuery(q);
  };

  const executeSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setSearchPhase(1);
    setResults([]);
    setParsedContext(null);

    // Sequence Simulation for purely visual Apple premium feel
    setTimeout(() => setSearchPhase(2), 800);
    setTimeout(() => setSearchPhase(3), 1600);

    try {
      // Try FAISS semantic search first
      const faissResponse = await api.post('/linkedin/search', { query, top_k: 20 });

      if (faissResponse.data?.results?.length > 0) {
        // Map FAISS results to the expected format
        const mapped = faissResponse.data.results.map(c => ({
          id: c.id,
          name: c.full_name || c.name,
          role: c.current_role || c.role,
          company: c.current_company || c.company,
          location: c.location,
          experience: `${c.years_of_experience || 0} yrs`,
          skills: c.skills || [],
          score: c.similarity_score || c.overall_score || 75,
          avatar: (c.full_name || c.name || 'U').charAt(0),
          source: c.source || 'LinkedIn',
          matchReason: c.match_reason || c.summary || 'Semantic FAISS match',
        }));

        setTimeout(() => {
          setResults(mapped);
          setParsedContext({ query: faissResponse.data.query, engine: 'FAISS + Gemini Embeddings' });
          setIsSearching(false);
        }, 2400);
        return;
      }
    } catch (faissErr) {
      console.log('[AISearch] FAISS search not available, falling back to legacy...', faissErr.message);
    }

    try {
      // Fallback to legacy backend search
      const response = await api.post('/search/natural', { query });

      setTimeout(() => {
        setResults(response.data.data.results);
        setParsedContext(response.data.data.parsedQuery);
        setIsSearching(false);
      }, 2400); // Wait for animations

    } catch (err) {
      console.error(err);
      setTimeout(() => {
        setIsSearching(false);
        setResults([]);
        setParsedContext(null);
      }, 2400);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      {/* ━━━ SEARCH HERO SECTION ━━━ */}
      <GlassCard className="mb-8 border-[#FF6B00]/20 shadow-[0_8px_32px_rgba(255,107,0,0.1)] relative overflow-hidden">
        <div className="absolute top-[-50%] left-[-10%] w-[500px] h-[500px] bg-[#FF6B00]/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-50%] right-[-10%] w-[400px] h-[400px] bg-[#FF8C42]/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="relative z-10 p-6 md:p-10 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-[#FFA366] mb-4 tracking-tight">
            AI-Powered Candidate Search
          </h1>
          <p className="text-gray-500 text-lg mb-10 font-medium">
            Search in plain English — our AI understands what you mean
          </p>

          <form onSubmit={executeSearch} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Sparkles className="h-6 w-6 text-[#FF6B00]" />
            </div>
            <input
              type="text"
              className="block w-full pl-16 pr-44 py-5 bg-[rgba(255,255,255,0.08)] backdrop-blur-3xl border border-glass-border rounded-full text-lg text-gray-900 placeholder-[#636366] focus:outline-none focus:border-[#FF6B00]/50 focus:ring-4 focus:ring-[#FF6B00]/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all group-hover:bg-[rgba(255,255,255,0.12)]"
              placeholder="e.g. 'Senior React developer in Mumbai with 5+ years and AWS experience'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isSearching}
            />
            <div className="absolute inset-y-0 right-2 flex items-center">
              <button
                type="submit"
                disabled={isSearching || !query.trim()}
                className="bg-[#FF6B00] text-gray-900 py-3 px-6 rounded-full font-bold shadow-[0_4px_16px_rgba(255,107,0,0.3)] hover:bg-[#FF8C42] hover:shadow-[0_4px_24px_rgba(255,107,0,0.5)] transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Search with AI
              </button>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {exampleQueries.map((q, i) => (
              <button
                key={i}
                onClick={() => handleExampleClick(q)}
                type="button"
                className="glass-panel px-4 py-2 rounded-full text-sm font-medium text-[#FF6B00] hover:bg-[#FF6B00]/10 hover:border-[#FF6B00]/30 transition-all cursor-pointer whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* ━━━ AI THINKING STATE ━━━ */}
      {isSearching && (
        <div className="max-w-3xl mx-auto w-full mb-8">
          <GlassCard className="border-[#FF6B00]/30 p-8 shadow-[0_0_40px_rgba(255,107,0,0.1)]">
            <div className="flex flex-col space-y-5">

              <div className="flex items-center text-gray-900 text-lg font-medium transition-opacity duration-500">
                <div className="mr-4 text-[#FF6B00] bg-[#F5F5F7] p-2 rounded-full shadow-[0_0_15px_rgba(255,107,0,0.4)]">
                  <Sparkles size={20} className={searchPhase >= 1 ? "animate-pulse" : ""} />
                </div>
                <span>AI is analyzing your query...</span>
              </div>

              <div className={`flex items-center text-gray-500 transition-all duration-700 ${searchPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="mr-5 text-[#FF6B00] text-xl leading-none">✦</div>
                <span>Extracting context and semantic meaning...</span>
              </div>

              <div className={`flex items-center text-gray-500 transition-all duration-700 ${searchPhase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="mr-5 text-[#FF6B00] text-xl leading-none">✦</div>
                <span>Searching candidate profiles via FAISS vector embeddings...</span>
              </div>

            </div>

            <div className="w-full bg-white h-1 mt-8 rounded-full overflow-hidden">
              <div className="bg-[#FF6B00] h-full shadow-[0_0_10px_#FF6B00] animate-[loading_2.4s_ease-in-out_infinite]" style={{ width: searchPhase === 1 ? '30%' : searchPhase === 2 ? '65%' : '95%' }}></div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* ━━━ SEARCH RESULTS ━━━ */}
      {!isSearching && results.length > 0 && (
        <div className="flex flex-col md:flex-row gap-8 flex-1">

          {/* Main Results Area */}
          <div className="flex-1 flex flex-col min-h-0">

            {/* AI Query Interpretation */}
            <div className="glass-panel border-l-4 border-l-[#FF6B00] rounded-r-xl rounded-l-sm p-4 mb-6 flex items-start bg-gradient-to-r from-[#FF6B00]/10 to-transparent">
              <Sparkles className="text-[#FF6B00] h-5 w-5 mr-3 mt-0.5" />
              <div>
                <h3 className="text-gray-900 font-bold mb-1.5 flex items-center">
                  I found {results.length} candidates matching your criteria
                </h3>
                <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                  {parsedContext?.skills?.length && <span>Skills <strong className="text-gray-900">[{parsedContext.skills.join(', ')}]</strong> |</span>}
                  {parsedContext?.location && <span>Location <strong className="text-gray-900">[{parsedContext.location}]</strong> |</span>}
                  {parsedContext?.experience && <span>Experience <strong className="text-gray-900">[{parsedContext.experience}]</strong></span>}
                </div>
              </div>
            </div>

            {/* Sort & Controls */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 text-sm font-medium">Sort by:</span>
                <div className="glass-panel flex rounded-lg p-1">
                  <button onClick={() => setSortBy('score')} className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${sortBy === 'score' ? 'bg-[#FF6B00]/20 text-[#FF6B00]' : 'text-gray-500 hover:text-gray-900'}`}>Match Score</button>
                  <button onClick={() => setSortBy('experience')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${sortBy === 'experience' ? 'bg-[#FF6B00]/20 text-[#FF6B00]' : 'text-gray-500 hover:text-gray-900'}`}>Experience</button>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="glass-panel flex rounded-lg p-1 mr-2">
                  <button className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-[#FF6B00]/20 text-[#FF6B00]' : 'text-gray-400'}`} onClick={() => setViewMode('grid')}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                  </button>
                  <button className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-[#FF6B00]/20 text-[#FF6B00]' : 'text-gray-400'}`} onClick={() => setViewMode('list')}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                  </button>
                </div>
                <OrangeButton variant="outline" icon={<Download size={16} />} className="text-sm py-2" onClick={exportCSV}>
                  Export CSV
                </OrangeButton>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 overflow-y-auto pb-10 custom-scrollbar pr-2">
              {displayedResults.map((candidate) => (
                <GlassCard key={candidate.id} className="flex flex-col hover:border-[#FF6B00]/40 transition-[border-color] duration-300 group p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#E55A00] flex items-center justify-center text-gray-900 font-bold text-xl shadow-[0_4px_12px_rgba(255,107,0,0.3)]">
                        {candidate.avatar}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 group-hover:text-[#FF6B00] transition-colors flex items-center">
                          {candidate.name}
                          <Badge variant="default" className="ml-3 !bg-white !text-xs !font-medium">
                            {candidate.source}
                          </Badge>
                        </h4>
                        <p className="text-gray-500 font-medium flex items-center mt-1 text-sm">
                          <User size={14} className="mr-1.5" /> {candidate.role} <span className="mx-2 text-gray-400">|</span>
                          <Building size={14} className="mr-1.5" /> {candidate.company}
                        </p>
                        <p className="text-gray-400 text-sm flex items-center mt-1">
                          <MapPin size={14} className="mr-1.5" /> {candidate.location}
                        </p>
                      </div>
                    </div>

                    {/* AI Score Circle */}
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path className="text-dark-surface stroke-current" strokeWidth="3" fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="text-[#FF6B00] stroke-current" strokeWidth="3" strokeDasharray={`${candidate.score}, 100`} fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-gray-900 font-bold text-sm leading-none">{candidate.score}</span>
                        <span className="text-[10px] text-[#FF6B00] font-bold">MATCH</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {candidate.skills.map((skill, index) => {
                      const isQueryMatch = parsedContext?.skills?.some(s => s.toLowerCase() === skill.toLowerCase());
                      return (
                        <span key={index} className={`text-xs px-2.5 py-1 rounded-md border font-medium ${isQueryMatch ? 'bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/40 shadow-[0_0_8px_rgba(255,107,0,0.15)]' : 'bg-white text-gray-500 border-glass-border'}`}>
                          {skill}
                        </span>
                      );
                    })}
                  </div>

                  <div className="bg-[#F5F5F7]/60 p-4 rounded-xl border border-glass-border mb-6 flex-1 text-sm">
                    <div className="text-[#FF6B00] font-bold mb-1 flex items-center text-xs tracking-wider uppercase">
                      <Sparkles size={12} className="mr-1.5" /> Why this match
                    </div>
                    <p className="text-gray-500 leading-relaxed">
                      {candidate.matchReason}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-auto">
                    <button
                      className="glass-panel text-gray-900 font-medium hover:bg-white/10 py-2.5 rounded-xl transition-all"
                      onClick={() => navigate(`/candidates?search=${encodeURIComponent(candidate.name || '')}`)}
                    >
                      View Profile
                    </button>
                    <button
                      className="bg-[#FF6B00] text-gray-900 font-medium shadow-[0_4px_16px_rgba(255,107,0,0.3)] hover:bg-[#FF8C42] py-2.5 rounded-xl transition-all"
                      onClick={async () => {
                        try {
                          if (candidate.id) await api.put(`/candidates/${candidate.id}`, { status: 'Screening' });
                          alert(`${candidate.name} shortlisted!`);
                        } catch { alert('Failed to shortlist'); }
                      }}
                    >
                      Shortlist
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Filter Sidebar */}

          <div className="w-80 flex-shrink-0 order-first md:order-last">
            <GlassCard className="h-[calc(100vh-140px)] sticky top-8 flex flex-col p-6 overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <SlidersHorizontal size={18} className="mr-2 text-[#FF6B00]" /> Filters
                </h2>
                <button className="text-gray-400 text-xs font-semibold hover:text-gray-900 transition-colors" onClick={() => setFilters({ matchMin: 50, exp: 'Any', source: 'All' })}>Reset</button>
              </div>

              <div className="space-y-8">
                {/* Experience Slider */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-4">Min. Match Score ({filters.matchMin}%)</label>
                  <input
                    type="range"
                    min="0" max="100"
                    value={filters.matchMin}
                    onChange={(e) => setFilters({ ...filters, matchMin: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-[#F5F5F7] rounded-lg appearance-none cursor-pointer accent-[#FF6B00]"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Source Filters */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-4">Source</label>
                  <div className="flex flex-wrap gap-2">
                    {['All', 'LinkedIn', 'Upload', 'HRMS', 'Gmail'].map(src => (
                      <button
                        key={src}
                        onClick={() => setFilters({ ...filters, source: src })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${filters.source === src ? 'bg-[#FF6B00]/20 border-[#FF6B00] text-[#FF6B00]' : 'glass-panel text-gray-500 hover:text-gray-900'}`}
                      >
                        {src}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skills Multiselect */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-4">Must-have Skills</label>
                  <div className="space-y-3 pl-1 text-sm font-medium">
                    {['React', 'Python', 'AWS', 'Node.js', 'SQL'].map(skill => (
                      <label key={skill} className="flex items-center cursor-pointer group">
                        <div className="w-5 h-5 rounded border border-glass-border bg-[#F5F5F7] mr-3 flex items-center justify-center group-hover:border-[#FF6B00]/50 transition-colors">
                          {/* Checkbox state simulation */}
                          {['React', 'AWS'].includes(skill) && <Check size={14} className="text-[#FF6B00]" />}
                        </div>
                        <span className="text-gray-500 group-hover:text-gray-900 transition-colors">{skill}</span>
                      </label>
                    ))}
                  </div>
                  <button className="text-[#FF6B00] text-xs font-semibold mt-4 flex items-center hover:text-[#FF8C42]">
                    Show all 45 skills <ChevronDown size={14} className="ml-1" />
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>

        </div>
      )}

      {/* Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 107, 0, 0.2); border-radius: 4px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255, 107, 0, 0.5); }
        @keyframes loading {
          0% { transform: translateX(-100%); width: 30%; }
          100% { transform: translateX(400%); width: 30%; }
        }
      `}} />
    </div>
  );
};

export default AISearch;
