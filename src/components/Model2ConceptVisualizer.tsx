import React, { useState, useEffect } from 'react';
import { UserAccount, VisualConceptModel } from '../types';
import { storageService } from '../utils/storage';
import { generateConceptVisualization } from '../services/api';
import { RealisticSimulationCanvas, SimulationType } from './RealisticSimulationCanvas';
import { 
  Sparkles, 
  Download, 
  Share2, 
  UploadCloud, 
  Youtube, 
  Video, 
  Image as ImageIcon, 
  FileText, 
  Type, 
  Sliders, 
  CheckCircle, 
  HardDrive,
  Upload,
  FileCheck,
  Check,
  Globe,
  Cpu,
  Atom,
  Flame,
  Leaf
} from 'lucide-react';

interface Model2Props {
  currentUser: UserAccount | null;
  initialSource?: { title: string; content: string; type: string } | null;
  onAttachToAssessment: (concept: VisualConceptModel) => void;
}

export const Model2ConceptVisualizer: React.FC<Model2Props> = ({
  currentUser,
  initialSource,
  onAttachToAssessment,
}) => {
  const [concepts, setConcepts] = useState<VisualConceptModel[]>(() => storageService.getConcepts());
  const [activeConcept, setActiveConcept] = useState<VisualConceptModel>(() => {
    const list = storageService.getConcepts();
    return list[0];
  });

  // Active realistic simulation mode
  const [currentSimulation, setCurrentSimulation] = useState<SimulationType>('solar_system');
  const [selectedEntityInfo, setSelectedEntityInfo] = useState<any>(null);

  // Source Ingestion State
  const [activeInputTab, setActiveInputTab] = useState<'upload' | 'youtube' | 'text' | 'drive'>('upload');
  const [sourceTitle, setSourceTitle] = useState('Realistic Solar System Mechanics');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceContent, setSourceContent] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [youtubePreview, setYoutubePreview] = useState<{ videoId: string; title: string } | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [notification, setNotification] = useState('');

  // Load initialSource passed from Model 1 if available
  useEffect(() => {
    if (initialSource) {
      setSourceTitle(initialSource.title);
      setSourceContent(initialSource.content);
      if (initialSource.type === 'video') {
        setActiveInputTab('youtube');
        setSourceUrl('https://youtube.com/watch?v=FmpDIaiMIeA');
      } else {
        setActiveInputTab('text');
      }
    }
  }, [initialSource]);

  // Subscribe to real-time concept updates from other devices
  useEffect(() => {
    const unsub = storageService.subscribe((entity) => {
      if (entity === 'concepts' || entity === 'all') {
        const list = storageService.getConcepts();
        setConcepts(list);
      }
    });
    return unsub;
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  // Drag and drop file upload simulator
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    setUploadedFile({
      name: file.name,
      size: sizeStr,
      type: file.type || 'Document'
    });

    if (!sourceTitle || sourceTitle === 'Realistic Solar System Mechanics') {
      setSourceTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
    }

    // Simulate ingestion progress
    setUploadProgress(10);
    const t = setInterval(() => {
      setUploadProgress((p) => {
        if (!p || p >= 100) {
          clearInterval(t);
          return 100;
        }
        return p + 30;
      });
    }, 150);
  };

  // YouTube parser
  const handleYoutubeUrlChange = (url: string) => {
    setSourceUrl(url);
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      const videoId = match[2];
      setYoutubePreview({
        videoId,
        title: sourceTitle || 'Astrophysics & Solar System Planetary Mechanics'
      });
    } else {
      setYoutubePreview(null);
    }
  };

  // Switch to realistic simulation preset
  const handleSelectPreset = (sim: SimulationType, title: string, content: string) => {
    setCurrentSimulation(sim);
    setSourceTitle(title);
    setSourceContent(content);
    showToast(`Loaded ${title}`);
  };

  // Generate / Run Visual Simulation
  const handleRunSimulation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sourceTitle.trim() && !sourceContent.trim() && !uploadedFile && !sourceUrl) {
      setErrorMsg('Please upload a file, enter a YouTube link, or provide a topic title.');
      return;
    }

    setErrorMsg('');
    setIsGenerating(true);

    // Map keywords to realistic simulation engines
    const lower = `${sourceTitle} ${sourceContent}`.toLowerCase();
    if (lower.includes('solar') || lower.includes('planet') || lower.includes('space') || lower.includes('orbit')) {
      setCurrentSimulation('solar_system');
    } else if (lower.includes('engine') || lower.includes('piston') || lower.includes('car') || lower.includes('thermo') || lower.includes('combustion')) {
      setCurrentSimulation('four_stroke_engine');
    } else if (lower.includes('neural') || lower.includes('brain') || lower.includes('synap') || lower.includes('neuron')) {
      setCurrentSimulation('neural_synapse');
    } else if (lower.includes('photo') || lower.includes('plant') || lower.includes('chloroplast') || lower.includes('atp')) {
      setCurrentSimulation('photosynthesis');
    } else if (lower.includes('atom') || lower.includes('quantum') || lower.includes('bohr') || lower.includes('electron')) {
      setCurrentSimulation('quantum_atom');
    }

    try {
      const result = await generateConceptVisualization({
        sourceType: activeInputTab === 'youtube' ? 'youtube' : activeInputTab === 'upload' ? 'pdf' : 'text',
        sourceTitle: sourceTitle || 'Realistic Interactive Simulation',
        sourceContent: sourceContent || `Run realistic visual simulation: ${sourceTitle}`,
      });

      const newModel: VisualConceptModel = {
        id: `concept-${Date.now()}`,
        conceptName: result.conceptName || sourceTitle || 'Realistic Visual Simulation',
        sourceType: activeInputTab as any,
        sourceTitle: sourceTitle || 'Source Concept',
        sourceContent: sourceContent || result.description,
        description: result.description,
        steps: result.steps || [],
        relationships: result.relationships || [],
        interactiveElements: result.interactiveElements,
        keyTakeaway: result.keyTakeaway || 'Realistic physics simulation demonstrates real-time dynamic kinematics.',
        createdAt: new Date().toISOString().split('T')[0],
        createdByStudentId: currentUser?.id || 'user-student-1',
        createdByStudentName: currentUser?.name || 'Rohit Kulkarni',
      };

      const updated = [newModel, ...concepts];
      setConcepts(updated);
      storageService.saveConcepts(updated);
      setActiveConcept(newModel);
      showToast('Visual simulation loaded and running!');
    } catch (err) {
      console.error(err);
      showToast('Running visual simulation in realistic mode.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadVisualization = () => {
    if (!activeConcept) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeConcept, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${activeConcept.conceptName.replace(/\s+/g, '_')}_Vedh_Simulation.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Simulation package downloaded as JSON!');
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-gray-700 flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Banner without brief descriptions */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-purple-100 text-purple-800">
            Model 2
          </span>
          <h1 className="text-xl font-bold text-gray-900">Concept Visualizer</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onAttachToAssessment(activeConcept)}
            className="px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <UploadCloud className="w-4 h-4 text-emerald-600" />
            <span>Submit as Assessment</span>
          </button>
          <button
            onClick={handleDownloadVisualization}
            className="px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-gray-600" />
            <span>Download</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Improved Source Uploading Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
            
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-purple-600" />
                <span>Upload Source</span>
              </h2>
            </div>

            {/* Quick Realistic Simulation Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-gray-600 block">
                Realistic Simulation Presets:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  {
                    sim: 'solar_system' as const,
                    label: 'Solar System',
                    icon: Globe,
                    title: 'Realistic Solar System Mechanics',
                    content: 'Sun, Mercury, Venus, Earth with Moon, Mars, Asteroid Belt, Jupiter with Great Red Spot, Saturn with Rings, Uranus, Neptune with realistic orbital physics and inspection.',
                    color: 'text-amber-600'
                  },
                  {
                    sim: 'four_stroke_engine' as const,
                    label: '4-Stroke Engine',
                    icon: Flame,
                    title: 'Four-Stroke Internal Combustion Engine',
                    content: 'Intake, compression, power spark explosion, and exhaust strokes with kinematic crankshaft connecting rod and RPM throttle.',
                    color: 'text-rose-600'
                  },
                  {
                    sim: 'neural_synapse' as const,
                    label: 'Neural Synapse',
                    icon: Cpu,
                    title: 'Neural Action Potential & Synapse',
                    content: 'Sensory input, interneuron transmission, action potential voltage spikes and neurotransmitter vesicles.',
                    color: 'text-indigo-600'
                  },
                  {
                    sim: 'photosynthesis' as const,
                    label: 'Photosynthesis',
                    icon: Leaf,
                    title: 'Chloroplast Photosynthesis Cycle',
                    content: 'Light-dependent reactions, water splitting photolysis, and rotary ATP synthase motor.',
                    color: 'text-emerald-600'
                  },
                ].map((preset) => {
                  const Icon = preset.icon;
                  const active = currentSimulation === preset.sim;
                  return (
                    <button
                      key={preset.sim}
                      type="button"
                      onClick={() => handleSelectPreset(preset.sim, preset.title, preset.content)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                        active
                          ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-xs'
                          : 'border-gray-200 bg-gray-50/50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${preset.color}`} />
                      <span>{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ingestion Tabs */}
            <div className="flex border-b border-gray-200 text-xs font-semibold">
              {[
                { id: 'upload', label: 'File Upload', icon: Upload },
                { id: 'youtube', label: 'YouTube', icon: Youtube },
                { id: 'text', label: 'Text / Book', icon: Type },
                { id: 'drive', label: 'Drive', icon: HardDrive },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeInputTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveInputTab(tab.id as any)}
                    className={`flex-1 py-2 text-center flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                      active
                        ? 'border-purple-600 text-purple-700'
                        : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: File Upload (PDF, PPT, Videos, Images) */}
            {activeInputTab === 'upload' && (
              <div className="space-y-3">
                <label className="border-2 border-dashed border-gray-300 hover:border-purple-500 rounded-2xl p-6 text-center block cursor-pointer bg-gray-50/50 hover:bg-purple-50/20 transition-all">
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.ppt,.pptx,.mp4,.mp3,.png,.jpg,.jpeg,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                  />
                  <UploadCloud className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <span className="text-xs font-bold text-gray-900 block">
                    Choose file or drag & drop here
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-1">
                    PDF, PPT, MP4, MP3, DOCX, Images
                  </span>
                </label>

                {uploadedFile && (
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck className="w-4 h-4 text-purple-600 shrink-0" />
                        <span className="font-bold text-gray-900 truncate">{uploadedFile.name}</span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono shrink-0">{uploadedFile.size}</span>
                    </div>

                    {uploadProgress !== null && (
                      <div className="w-full bg-purple-200/60 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-purple-600 h-full rounded-full transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: YouTube Video Link */}
            {activeInputTab === 'youtube' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    YouTube URL
                  </label>
                  <div className="relative">
                    <Youtube className="absolute left-3 top-2.5 w-4 h-4 text-rose-500" />
                    <input
                      type="url"
                      value={sourceUrl}
                      onChange={(e) => handleYoutubeUrlChange(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {youtubePreview && (
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
                    <img
                      src={`https://img.youtube.com/vi/${youtubePreview.videoId}/hqdefault.jpg`}
                      alt="Thumbnail"
                      className="w-20 h-14 object-cover rounded-lg shadow-xs"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-gray-900 block line-clamp-1">{sourceTitle}</span>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                        <Check className="w-3 h-3" /> Ready to simulate
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Text / Textbook Context */}
            {activeInputTab === 'text' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-gray-700">Textbook Excerpt / Context</label>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {sourceContent.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={sourceContent}
                  onChange={(e) => setSourceContent(e.target.value)}
                  placeholder="Paste textbook paragraph or problem statement..."
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

            {/* TAB 4: Google Drive */}
            {activeInputTab === 'drive' && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Google Drive Link
                </label>
                <div className="relative">
                  <HardDrive className="absolute left-3 top-2.5 w-4 h-4 text-blue-500" />
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}

            {/* Title Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Concept Title
              </label>
              <input
                type="text"
                required
                value={sourceTitle}
                onChange={(e) => setSourceTitle(e.target.value)}
                placeholder="e.g. Solar System Planetary Mechanics"
                className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {errorMsg && (
              <div className="p-2 text-xs text-red-600 bg-red-50 rounded-lg border border-red-200">
                {errorMsg}
              </div>
            )}

            <button
              onClick={() => handleRunSimulation()}
              disabled={isGenerating}
              className="w-full py-2.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Loading Realistic Visualization...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Realistic Visualization</span>
                </>
              )}
            </button>

          </div>

          {/* Quick Library */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-2">
            <span className="text-xs font-bold text-gray-900 block">Available Concept Simulations</span>
            <div className="space-y-1.5">
              {[
                { sim: 'solar_system' as const, title: 'Solar System Realistic Orbits' },
                { sim: 'four_stroke_engine' as const, title: 'Four-Stroke Combustion Engine' },
                { sim: 'neural_synapse' as const, title: 'Neural Synaptic Electrical Network' },
                { sim: 'photosynthesis' as const, title: 'Photosynthesis & ATP Synthase' },
                { sim: 'quantum_atom' as const, title: 'Quantum Bohr Hydrogen Atom' },
              ].map((item) => (
                <div
                  key={item.sim}
                  onClick={() => {
                    setCurrentSimulation(item.sim);
                    setSourceTitle(item.title);
                  }}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    currentSimulation === item.sim
                      ? 'border-purple-600 bg-purple-50 text-purple-900 font-semibold'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span>{item.title}</span>
                  {currentSimulation === item.sim && (
                    <span className="text-[10px] font-bold text-purple-700 bg-white px-2 py-0.5 rounded border border-purple-200">
                      Running
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Realistic Interactive Working Simulation Canvas */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  Realistic Simulation
                </span>
                <h2 className="text-base font-bold text-gray-900">{sourceTitle}</h2>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  60 FPS Active
                </span>
              </div>
            </div>

            {/* Realistic Simulation Canvas Component */}
            <RealisticSimulationCanvas
              simulationType={currentSimulation}
              conceptName={sourceTitle}
              onSelectEntity={(name, details) => setSelectedEntityInfo(details)}
            />

            {/* Hand-off Action to Assessment */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
              <span className="text-gray-500 font-medium">Ready to submit your interactive visualization?</span>
              <button
                onClick={() => onAttachToAssessment(activeConcept)}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Submit as Assessment (Model 3)</span>
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
