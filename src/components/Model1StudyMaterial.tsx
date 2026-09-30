import React, { useState, useEffect } from 'react';
import { StudyMaterial, UserAccount } from '../types';
import { storageService } from '../utils/storage';
import { generateStudyNotes, NotesResponse } from '../services/api';
import { 
  BookOpen, 
  Video, 
  FileText, 
  Headphones, 
  Image as ImageIcon, 
  Sparkles, 
  Upload, 
  Calendar, 
  Clock, 
  Lightbulb, 
  ExternalLink, 
  CheckCircle, 
  Search, 
  BrainCircuit, 
  HelpCircle,
  Play,
  RotateCcw
} from 'lucide-react';

interface Model1Props {
  currentUser: UserAccount | null;
  onSendToVisualizer: (title: string, content: string, type: string) => void;
}

export const Model1StudyMaterial: React.FC<Model1Props> = ({
  currentUser,
  onSendToVisualizer,
}) => {
  const [materials, setMaterials] = useState<StudyMaterial[]>(() => storageService.getMaterials());
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Active study / AI modal
  const [activeMaterial, setActiveMaterial] = useState<StudyMaterial | null>(null);
  const [aiNotes, setAiNotes] = useState<NotesResponse | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);

  // Remedial class video player modal
  const [videoModalMaterial, setVideoModalMaterial] = useState<StudyMaterial | null>(null);

  // Upload modal for teacher
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Visual AI & Deep Learning');
  const [newCategory, setNewCategory] = useState<'Remedial Class' | 'Core Lecture' | 'Case Study' | 'Skill Workshop'>('Remedial Class');
  const [newType, setNewType] = useState<'video' | 'pdf' | 'ppt' | 'audio' | 'image' | 'textbook'>('video');
  const [newDescription, setNewDescription] = useState('');
  const [newSnippet, setNewSnippet] = useState('');
  const [newDuration, setNewDuration] = useState('25 mins');
  const [newRemedialSchedule, setNewRemedialSchedule] = useState('Tuesdays & Thursdays at 4:30 PM');
  const [newDivision, setNewDivision] = useState('Div A');

  const isTeacherOrInstitution = currentUser?.role === 'teacher' || currentUser?.role === 'institution' || currentUser?.role === 'owner';

  useEffect(() => {
    const unsub = storageService.subscribe((entity) => {
      if (entity === 'materials' || entity === 'all') {
        setMaterials(storageService.getMaterials());
      }
    });
    return unsub;
  }, []);

  const filteredMaterials = materials.filter((m) => {
    const matchesFilter = selectedFilter === 'all' 
      ? true 
      : selectedFilter === 'remedial' 
        ? m.category === 'Remedial Class'
        : m.type === selectedFilter;
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleOpenAiNotes = async (mat: StudyMaterial) => {
    setActiveMaterial(mat);
    setLoadingAi(true);
    setAiNotes(null);
    setActiveCardIndex(0);
    setCardFlipped(false);

    try {
      const response = await generateStudyNotes({
        title: mat.title,
        content: mat.contentSnippet || mat.description,
        materialType: mat.type,
        studyMode: mat.category,
      });
      setAiNotes(response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const item: StudyMaterial = {
      id: `mat-${Date.now()}`,
      title: newTitle,
      subject: newSubject,
      description: newDescription,
      category: newCategory,
      type: newType,
      uploadedByTeacherName: currentUser?.name || 'Faculty Member',
      uploadedByTeacherId: currentUser?.id || 'teacher-default',
      divisionTarget: newDivision,
      createdAt: new Date().toISOString().split('T')[0],
      duration: newDuration,
      remedialClassScheduled: newCategory === 'Remedial Class' ? newRemedialSchedule : undefined,
      contentSnippet: newSnippet || newDescription,
    };

    const updated = [item, ...materials];
    setMaterials(updated);
    storageService.saveMaterials(updated);
    setShowUploadModal(false);
    setNewTitle('');
    setNewDescription('');
    setNewSnippet('');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-rose-600" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-600" />;
      case 'ppt':
        return <FileText className="w-4 h-4 text-orange-600" />;
      case 'audio':
        return <Headphones className="w-4 h-4 text-purple-600" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-emerald-600" />;
      default:
        return <BookOpen className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner / Header */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-800">
            Model 1
          </span>
          <h1 className="text-xl font-bold text-gray-900">Study Materials & Remedial Classes</h1>
        </div>

        {isTeacherOrInstitution && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Upload className="w-4 h-4" />
            <span>Post Study Material</span>
          </button>
        )}
      </div>

      {/* Remedial Classes Spotlight Carousel / Alert */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50 rounded-2xl p-5 border border-blue-200/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-xs">
              <Calendar className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-gray-900">Remedial Catch-Up Sessions</h2>
          </div>
          <span className="text-[11px] font-semibold text-blue-700 bg-white px-2.5 py-1 rounded-full border border-blue-200">
            Div A
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {materials.filter((m) => m.category === 'Remedial Class').map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-4 border border-blue-100 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-blue-700 flex items-center gap-1">
                    <Video className="w-3.5 h-3.5" /> Remedial Class
                  </span>
                  <span className="text-gray-400 text-[10px]">{item.duration}</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-xs text-gray-600 line-clamp-2 mb-2">{item.description}</p>
                <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mb-3 bg-gray-50 p-2 rounded-lg">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>Scheduled: {item.remedialClassScheduled || 'Regular Weekly Clinic'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setVideoModalMaterial(item)}
                  className="flex-1 py-1.5 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" /> Attend Video Class
                </button>
                <button
                  onClick={() => handleOpenAiNotes(item)}
                  className="py-1.5 px-3 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" /> AI Notes
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200">
        
        {/* Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Materials' },
            { id: 'remedial', label: 'Remedial Classes' },
            { id: 'video', label: 'Videos' },
            { id: 'pdf', label: 'PDFs & Books' },
            { id: 'ppt', label: 'PPTs / Case Studies' },
            { id: 'audio', label: 'Audio Lectures' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedFilter === tab.id
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subjects, topics..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.map((material) => (
          <div
            key={material.id}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Type Badge & Category */}
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="flex items-center gap-1.5 font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                  {getTypeIcon(material.type)}
                  <span className="capitalize">{material.type}</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/50">
                  {material.category}
                </span>
              </div>

              {/* Title & Subject */}
              <h3 className="text-sm font-bold text-gray-900 mb-1 leading-snug line-clamp-2">
                {material.title}
              </h3>
              <p className="text-[11px] font-semibold text-blue-600 mb-2">
                {material.subject} • {material.divisionTarget}
              </p>

              {/* Description */}
              <p className="text-xs text-gray-600 line-clamp-3 mb-3 leading-relaxed">
                {material.description}
              </p>

              {material.fileName && (
                <div className="text-[11px] text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 mb-3 truncate flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  <span>{material.fileName}</span>
                </div>
              )}
            </div>

            {/* Actions & Teacher Footnote */}
            <div>
              <div className="text-[10px] text-gray-400 mb-3 flex items-center justify-between pt-2 border-t border-gray-100">
                <span>By {material.uploadedByTeacherName}</span>
                <span>{material.createdAt}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {material.type === 'video' ? (
                  <button
                    onClick={() => setVideoModalMaterial(material)}
                    className="py-1.5 px-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-1 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" /> Watch Video
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenAiNotes(material)}
                    className="py-1.5 px-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center gap-1 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Read Content
                  </button>
                )}

                <button
                  onClick={() => handleOpenAiNotes(material)}
                  className="py-1.5 px-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg flex items-center justify-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" /> AI Notes
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI STUDY STUDIO MODAL */}
      {activeMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 leading-tight">
                    Vedh AI Study Studio
                  </h3>
                  <p className="text-xs text-gray-500">
                    Extracted from: {activeMaterial.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveMaterial(null)}
                className="text-gray-400 hover:text-gray-700 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {loadingAi ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-12 h-12 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-gray-800">
                    Gemini AI is analyzing material context...
                  </p>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Extracting structured study notes, active recall flashcards, and critical brainstorming questions.
                  </p>
                </div>
              ) : aiNotes ? (
                <div className="space-y-6">
                  
                  {/* Executive Summary */}
                  <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200/80">
                    <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Executive Conceptual Summary
                    </h4>
                    <p className="text-xs text-gray-700 leading-relaxed font-medium">
                      {aiNotes.summary}
                    </p>
                  </div>

                  {/* Core Notes & Key Points */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Synthesized Key Takeaways
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {aiNotes.keyPoints.map((pt, i) => (
                        <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="leading-relaxed">{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Flashcard Recall */}
                  {aiNotes.flashcards && aiNotes.flashcards.length > 0 && (
                    <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200/80">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                          <RotateCcw className="w-3.5 h-3.5 text-purple-600" /> Interactive Flashcard Recall ({activeCardIndex + 1}/{aiNotes.flashcards.length})
                        </h4>
                        <span className="text-[10px] text-purple-600 font-medium">Click card to reveal answer</span>
                      </div>

                      <div
                        onClick={() => setCardFlipped(!cardFlipped)}
                        className="min-h-32 bg-white rounded-xl p-5 border border-purple-200 shadow-xs cursor-pointer flex flex-col items-center justify-center text-center transition-all hover:shadow-md"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 mb-1">
                          {cardFlipped ? 'Answer' : 'Question'}
                        </span>
                        <p className="text-sm font-semibold text-gray-900">
                          {cardFlipped
                            ? aiNotes.flashcards[activeCardIndex].a
                            : aiNotes.flashcards[activeCardIndex].q}
                        </p>
                      </div>

                      <div className="flex justify-between items-center mt-3 text-xs">
                        <button
                          disabled={activeCardIndex === 0}
                          onClick={() => {
                            setActiveCardIndex((p) => Math.max(0, p - 1));
                            setCardFlipped(false);
                          }}
                          className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-gray-700 disabled:opacity-40"
                        >
                          Previous
                        </button>
                        <span className="text-[11px] text-gray-500 font-medium">
                          Flip: Click anywhere on card
                        </span>
                        <button
                          disabled={activeCardIndex >= aiNotes.flashcards.length - 1}
                          onClick={() => {
                            setActiveCardIndex((p) => Math.min(aiNotes.flashcards.length - 1, p + 1));
                            setCardFlipped(false);
                          }}
                          className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-gray-700 disabled:opacity-40"
                        >
                          Next Card
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Brainstorming Questions */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Brainstorming & Critical Thinking Prompts
                    </h4>
                    <div className="space-y-2">
                      {aiNotes.brainstormingQuestions.map((q, idx) => (
                        <div key={idx} className="p-3 bg-amber-50/50 rounded-lg border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
                          <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <span className="leading-relaxed font-medium">{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Visualizer Hand-off Action */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <h5 className="text-xs font-bold text-gray-900">Want to visualize this concept interactively?</h5>
                      <p className="text-[11px] text-gray-500">Send this topic directly to Model 2 Visual Concept Engine</p>
                    </div>
                    <button
                      onClick={() => {
                        onSendToVisualizer(
                          activeMaterial.title,
                          aiNotes.summary + '\n' + aiNotes.keyPoints.join(' '),
                          activeMaterial.type
                        );
                        setActiveMaterial(null);
                      }}
                      className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs flex items-center gap-2 transition-colors whitespace-nowrap"
                    >
                      <BrainCircuit className="w-4 h-4" />
                      <span>Visualize Concept in Model 2</span>
                    </button>
                  </div>

                </div>
              ) : null}

            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-end">
              <button
                onClick={() => setActiveMaterial(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close Studio
              </button>
            </div>

          </div>
        </div>
      )}

      {/* REMEDIAL VIDEO PLAYER MODAL */}
      {videoModalMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-gray-900">{videoModalMaterial.title}</h3>
              </div>
              <button onClick={() => setVideoModalMaterial(null)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>

            <div className="p-4 space-y-4">
              {/* Simulated Video Canvas / Player */}
              <div className="w-full aspect-video bg-gray-900 rounded-xl flex flex-col items-center justify-center text-white relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                <Play className="w-12 h-12 text-white/90 group-hover:scale-110 transition-transform cursor-pointer" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-gray-300">
                  <span>Remedial Class Recording ({videoModalMaterial.duration || '34:00'})</span>
                  <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">HD 1080p</span>
                </div>
              </div>

              <div className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="font-bold text-gray-900">Lecture Summary: </span>
                {videoModalMaterial.description}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Target: <span className="font-semibold text-gray-800">{videoModalMaterial.divisionTarget}</span> • Instructor: {videoModalMaterial.uploadedByTeacherName}
                </div>
                <button
                  onClick={() => {
                    const m = videoModalMaterial;
                    setVideoModalMaterial(null);
                    handleOpenAiNotes(m);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Extract Notes from Video</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POST STUDY MATERIAL MODAL (TEACHER) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Post Study Material / Remedial Class</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>

            <form onSubmit={handleCreateMaterial} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Material / Lecture Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Remedial Class: Gradient Descent & Loss Landscapes"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full text-xs p-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="Remedial Class">Remedial Class</option>
                    <option value="Core Lecture">Core Lecture</option>
                    <option value="Case Study">Case Study</option>
                    <option value="Skill Workshop">Skill Workshop</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Format Type</label>
                  <select
                    value={newType}
                    onChange={(e: any) => setNewType(e.target.value)}
                    className="w-full text-xs p-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="video">Video Lecture</option>
                    <option value="pdf">PDF Document</option>
                    <option value="ppt">PowerPoint / Slides</option>
                    <option value="audio">Audio Recording</option>
                    <option value="image">Picture / Diagram</option>
                    <option value="textbook">Textbook Chapter</option>
                  </select>
                </div>
              </div>

              {newCategory === 'Remedial Class' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Remedial Class Schedule</label>
                  <input
                    type="text"
                    value={newRemedialSchedule}
                    onChange={(e) => setNewRemedialSchedule(e.target.value)}
                    placeholder="e.g. Wednesdays at 4:00 PM"
                    className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Outline key learning objectives and prerequisites..."
                  className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Text Context / Transcript (for AI Note Maker)</label>
                <textarea
                  rows={3}
                  value={newSnippet}
                  onChange={(e) => setNewSnippet(e.target.value)}
                  placeholder="Paste textbook excerpts, slide content, or transcript..."
                  className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Post to Division
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
