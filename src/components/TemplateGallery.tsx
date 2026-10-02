import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Bookmark,
  Star,
  Plus,
  Trash2,
  Download,
  Upload,
  Check,
  Zap,
  Sliders,
  Flame,
  Shield,
  Search,
  Layers,
  Copy,
  Info,
  Clock,
  Gauge,
  ArrowRight,
} from 'lucide-react';
import { MacroConfig } from '../types';
import { DEFAULT_MACRO_CONFIG } from '../data/defaultConfig';

export interface MacroTemplate {
  id: string;
  name: string;
  mode: 'Ranked' | 'Freestyle' | 'Training' | 'Custom';
  description: string;
  isBuiltIn: boolean;
  isFavorite: boolean;
  createdAt: string;
  tags: string[];
  config: MacroConfig;
}

export const BUILT_IN_TEMPLATES: MacroTemplate[] = [
  {
    id: 'default_ranked',
    name: 'RLCS LAN Ranked Competitive',
    mode: 'Ranked',
    description: 'Sub-frame 120Hz consistency, 0.05/0.05 deadzones, frame-perfect 30ms speedflip kickoff cancel, and radial anti-backflip protection for 2v2 & 3v3 ranked play.',
    isBuiltIn: true,
    isFavorite: true,
    createdAt: '2026-03-01T00:00:00Z',
    tags: ['RLCS LAN', 'Ranked 2v2/3v3', 'Frame-Perfect', 'Anti-Backflip'],
    config: {
      ...DEFAULT_MACRO_CONFIG,
      internalDeadzone: 0.05,
      dodgeDeadzone: 0.05,
      hardwareJitter: 1,
      groundSense: 1.30,
      aerialSense: 1.45,
      curveExponent: 1.40,
      speedflipJump1: 30,
      speedflipJump2Delay: 30,
      speedflipJump2: 20,
      speedflipCancelHold: 600,
      fastAerialBoostHold: 300,
      fastAerialJump1: 200,
      fastAerialJump2Delay: 30,
      fastAerialJump2: 30,
      fastAerialCancelDelay: 150,
      chaindashJump1: 30,
      chaindashPause: 60,
      chaindashJump2: 30,
    },
  },
  {
    id: 'default_freestyle',
    name: 'Freestyle Acrobat & Multi-Reset',
    mode: 'Freestyle',
    description: 'Tuned for rapid directional air roll spins, high-angular yaw rate, infinite wall chain dashes (45ms rebound), and continuous multi-flip reset aerial control.',
    isBuiltIn: true,
    isFavorite: false,
    createdAt: '2026-03-05T00:00:00Z',
    tags: ['Continuous Air Roll', 'Multi-Reset', 'Wall Dash', 'High Yaw Rate'],
    config: {
      ...DEFAULT_MACRO_CONFIG,
      internalDeadzone: 0.03,
      dodgeDeadzone: 0.05,
      hardwareJitter: 1,
      groundSense: 1.65,
      aerialSense: 1.90,
      curveExponent: 1.65,
      speedflipJump1: 28,
      speedflipJump2Delay: 26,
      speedflipJump2: 20,
      speedflipCancelHold: 560,
      fastAerialBoostHold: 320,
      fastAerialJump1: 180,
      fastAerialJump2Delay: 26,
      fastAerialJump2: 26,
      fastAerialCancelDelay: 140,
      chaindashJump1: 25,
      chaindashPause: 45,
      chaindashJump2: 25,
    },
  },
  {
    id: 'default_training',
    name: 'Training & Muscle Memory Drill',
    mode: 'Training',
    description: 'Expanded cancellation tolerance windows (36ms) and high debounce smoothing (Level 2) to build physical mechanical intuition and consistent warmup timing.',
    isBuiltIn: true,
    isFavorite: false,
    createdAt: '2026-03-10T00:00:00Z',
    tags: ['Warmup Drills', 'Muscle Memory', 'Wide Timing Window', 'High Debounce'],
    config: {
      ...DEFAULT_MACRO_CONFIG,
      internalDeadzone: 0.08,
      dodgeDeadzone: 0.08,
      hardwareJitter: 2,
      groundSense: 1.20,
      aerialSense: 1.25,
      curveExponent: 1.20,
      speedflipJump1: 35,
      speedflipJump2Delay: 36,
      speedflipJump2: 25,
      speedflipCancelHold: 650,
      fastAerialBoostHold: 350,
      fastAerialJump1: 220,
      fastAerialJump2Delay: 35,
      fastAerialJump2: 35,
      fastAerialCancelDelay: 160,
      chaindashJump1: 35,
      chaindashPause: 70,
      chaindashJump2: 35,
    },
  },
];

const STORAGE_KEY = 'fn_masterengine_template_gallery_custom';

interface TemplateGalleryProps {
  config: MacroConfig;
  onApplyTemplate: (newConfig: MacroConfig, templateName?: string) => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ config, onApplyTemplate }) => {
  const [customTemplates, setCustomTemplates] = useState<MacroTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites' | 'Ranked' | 'Freestyle' | 'Training' | 'Custom'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [newTemplateName, setNewTemplateName] = useState<string>('');
  const [newTemplateMode, setNewTemplateMode] = useState<'Ranked' | 'Freestyle' | 'Training' | 'Custom'>('Ranked');
  const [newTemplateDescription, setNewTemplateDescription] = useState<string>('');
  const [newTemplateTags, setNewTemplateTags] = useState<string>('Custom, 1000Hz');
  const [appliedTemplateId, setAppliedTemplateId] = useState<string | null>(null);

  // Sync custom templates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customTemplates));
    } catch (e) {
      console.error('Failed to save custom templates to localStorage', e);
    }
  }, [customTemplates]);

  // Combine built-in and custom templates
  const allTemplates = useMemo(() => {
    return [...BUILT_IN_TEMPLATES, ...customTemplates];
  }, [customTemplates]);

  // Filter & Search
  const filteredTemplates = useMemo(() => {
    return allTemplates.filter((t) => {
      // Filter tab
      if (activeFilter === 'favorites' && !t.isFavorite) return false;
      if (activeFilter === 'Custom' && t.isBuiltIn) return false;
      if (activeFilter !== 'all' && activeFilter !== 'favorites' && activeFilter !== 'Custom' && t.mode !== activeFilter) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = t.name.toLowerCase().includes(q);
        const matchesDesc = t.description.toLowerCase().includes(q);
        const matchesTags = t.tags.some((tag) => tag.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesTags) return false;
      }

      return true;
    });
  }, [allTemplates, activeFilter, searchQuery]);

  // Handle Apply
  const handleApply = (template: MacroTemplate) => {
    onApplyTemplate(template.config, template.name);
    setAppliedTemplateId(template.id);
    setTimeout(() => setAppliedTemplateId(null), 2500);
  };

  // Toggle Favorite
  const handleToggleFavorite = (id: string) => {
    // Check if custom
    if (customTemplates.some((t) => t.id === id)) {
      setCustomTemplates((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isFavorite: !t.isFavorite } : t))
      );
    } else {
      // For built-in, clone to custom or toggle in state
      setCustomTemplates((prev) => {
        const found = BUILT_IN_TEMPLATES.find((b) => b.id === id);
        if (found) {
          const alreadyModified = prev.find((p) => p.id === id);
          if (alreadyModified) {
            return prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));
          } else {
            return [...prev, { ...found, isFavorite: !found.isFavorite }];
          }
        }
        return prev;
      });
    }
  };

  // Save Current Engine Config as New Template
  const handleSaveCurrentConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;

    const tagsArray = newTemplateTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newTemplate: MacroTemplate = {
      id: `custom_${Date.now()}`,
      name: newTemplateName.trim(),
      mode: newTemplateMode,
      description: newTemplateDescription.trim() || 'Custom user configuration template.',
      isBuiltIn: false,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      tags: tagsArray.length > 0 ? tagsArray : ['Custom', 'User Build'],
      config: { ...config },
    };

    setCustomTemplates((prev) => [newTemplate, ...prev]);
    setShowSaveModal(false);
    setNewTemplateName('');
    setNewTemplateDescription('');
  };

  // Delete Custom Template
  const handleDeleteTemplate = (id: string) => {
    setCustomTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  // Export Single Template JSON
  const handleExportTemplateJSON = (template: MacroTemplate) => {
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FN_Macro_Template_${template.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import Template from File
  const handleImportTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.name && parsed.config) {
          const imported: MacroTemplate = {
            id: `imported_${Date.now()}`,
            name: parsed.name + ' (Imported)',
            mode: parsed.mode || 'Custom',
            description: parsed.description || 'Imported template set.',
            isBuiltIn: false,
            isFavorite: false,
            createdAt: new Date().toISOString(),
            tags: Array.isArray(parsed.tags) ? parsed.tags : ['Imported'],
            config: parsed.config,
          };
          setCustomTemplates((prev) => [imported, ...prev]);
        }
      } catch (err) {
        alert('Invalid template JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-purple-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-xl bg-purple-950 text-purple-400 border border-purple-500/40">
                <Bookmark className="w-5 h-5" />
              </div>
              <h2 className="font-['Chakra_Petch'] font-bold text-lg sm:text-xl text-slate-100 uppercase tracking-wide">
                Configuration Template Gallery
              </h2>
              <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full font-bold">
                RANKED • FREESTYLE • TRAINING
              </span>
            </div>
            <p className="text-xs text-slate-300 font-['Rajdhani'] max-w-2xl leading-relaxed">
              Curate, save, and switch between specialized Rocket League input templates. Pre-loaded with official setups for <strong>Ranked Competitions</strong>, <strong>Freestyle Acrobatics</strong>, and <strong>Training Drills</strong>, plus unlimited custom user builds.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold transition-all shadow-md shadow-purple-600/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>SAVE CURRENT CONFIG</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors border border-slate-700 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON</span>
              <input type="file" accept=".json" onChange={handleImportTemplate} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {(['all', 'favorites', 'Ranked', 'Freestyle', 'Training', 'Custom'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded-lg capitalize transition-all ${
                activeFilter === filter
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {filter === 'all'
                ? `All (${allTemplates.length})`
                : filter === 'favorites'
                ? '⭐ Favorites'
                : filter === 'Custom'
                ? `User Builds (${customTemplates.length})`
                : filter}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search templates or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60"
          />
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => {
          const isApplied = appliedTemplateId === template.id;
          const modeColor =
            template.mode === 'Ranked'
              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
              : template.mode === 'Freestyle'
              ? 'bg-purple-950/80 text-purple-400 border-purple-500/40'
              : template.mode === 'Training'
              ? 'bg-amber-950/80 text-amber-400 border-amber-500/40'
              : 'bg-cyan-950/80 text-cyan-400 border-cyan-500/40';

          return (
            <div
              key={template.id}
              className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl transition-all relative overflow-hidden group hover:border-purple-500/50 ${
                isApplied
                  ? 'border-emerald-500 ring-2 ring-emerald-500/40 bg-emerald-950/20'
                  : 'border-slate-800'
              }`}
            >
              <div>
                {/* Header Strip */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${modeColor}`}>
                    {template.mode} Mode
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleFavorite(template.id)}
                      title="Pin to favorites"
                      className={`p-1.5 rounded-lg border transition-colors ${
                        template.isFavorite
                          ? 'bg-amber-950/60 border-amber-500/50 text-amber-400'
                          : 'border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${template.isFavorite ? 'fill-amber-400' : ''}`} />
                    </button>

                    <button
                      onClick={() => handleExportTemplateJSON(template)}
                      title="Export template JSON"
                      className="p-1.5 rounded-lg border border-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    {!template.isBuiltIn && (
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        title="Delete custom template"
                        className="p-1.5 rounded-lg border border-slate-800 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="font-['Chakra_Petch'] font-bold text-base text-slate-100 group-hover:text-purple-300 transition-colors">
                  {template.name}
                </h3>

                <p className="text-xs text-slate-400 font-['Rajdhani'] mt-1.5 line-clamp-2 leading-relaxed">
                  {template.description}
                </p>

                {/* Tags Strip */}
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {template.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 text-[10px] border border-slate-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Technical Spec Matrix */}
              <div className="space-y-2 pt-3 border-t border-slate-800/80">
                <div className="grid grid-cols-3 gap-1.5 text-[10px] bg-slate-950/80 p-2 rounded-xl border border-slate-850">
                  <div>
                    <span className="text-slate-500 block">Deadzones</span>
                    <strong className="text-slate-200">
                      {template.config.internalDeadzone} / {template.config.dodgeDeadzone}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Aerial Sense</span>
                    <strong className="text-cyan-300">{template.config.aerialSense}x</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Speedflip</span>
                    <strong className="text-amber-300">{template.config.speedflipJump2Delay}ms</strong>
                  </div>
                </div>

                <button
                  onClick={() => handleApply(template)}
                  className={`w-full py-2 rounded-xl font-mono font-bold text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 ${
                    isApplied
                      ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20'
                  }`}
                >
                  {isApplied ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{isApplied ? 'TEMPLATE APPLIED TO ENGINE!' : 'APPLY THIS TEMPLATE'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
          <Bookmark className="w-8 h-8 text-slate-600 mx-auto" />
          <h4 className="font-['Chakra_Petch'] text-sm font-bold text-slate-300 uppercase">
            No Templates Found
          </h4>
          <p className="text-xs text-slate-500 font-['Rajdhani'] max-w-sm mx-auto">
            No templates match the selected filter or search keyword. Try clearing your search or saving a new custom configuration.
          </p>
        </div>
      )}

      {/* Save Template Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-purple-400" />
                <h3 className="font-['Chakra_Petch'] font-bold text-base text-slate-100 uppercase">
                  Save Active Configuration as Template
                </h3>
              </div>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCurrentConfig} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Template Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zen 1v1 Kickoff Custom"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Target Mode</label>
                <select
                  value={newTemplateMode}
                  onChange={(e) => setNewTemplateMode(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-purple-300 focus:outline-none focus:border-purple-500"
                >
                  <option value="Ranked">Ranked Competitive</option>
                  <option value="Freestyle">Freestyle Acrobat</option>
                  <option value="Training">Training & Muscle Memory</option>
                  <option value="Custom">Custom User Build</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Notes on sensitivity, controller, or mouse DPI..."
                  value={newTemplateDescription}
                  onChange={(e) => setNewTemplateDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Tags (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. 1000Hz, Wooting, Low-Jitter"
                  value={newTemplateTags}
                  onChange={(e) => setNewTemplateTags(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-600/30"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
