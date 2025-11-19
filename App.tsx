import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  ChevronRight, 
  Calendar, 
  User, 
  Plus, 
  X, 
  Brain, 
  BarChart, 
  Database, 
  Code, 
  LineChart,
  Users,
  Clock,
  Filter,
  Search,
  Trash2,
  Paperclip,
  Image as ImageIcon,
  FileText,
  AlertTriangle,
  PenTool,
  GraduationCap
} from 'lucide-react';
import { FIELDS, STAGES, generateWeeks } from './constants';
import { Note, NavigationState, FilterState, Attachment, UserMode } from './types';
import { Header } from './components/Header';
import { NoteService } from './services/noteService';

// Icon Mapping Helper
const IconMap = {
  Brain: Brain,
  BarChart: BarChart,
  Database: Database,
  Code: Code,
  LineChart: LineChart,
  Users: Users
};

// Color Style Mapping for Dynamic Tailwind Classes
const colorStyles = {
  sky: { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', iconBg: 'bg-sky-100', hover: 'hover:border-sky-400' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', iconBg: 'bg-orange-100', hover: 'hover:border-orange-400' },
  lime: { bg: 'bg-lime-50', border: 'border-lime-200', text: 'text-lime-700', iconBg: 'bg-lime-100', hover: 'hover:border-lime-400' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', iconBg: 'bg-indigo-100', hover: 'hover:border-indigo-400' },
  fuchsia: { bg: 'bg-fuchsia-50', border: 'border-fuchsia-200', text: 'text-fuchsia-700', iconBg: 'bg-fuchsia-100', hover: 'hover:border-fuchsia-400' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', iconBg: 'bg-rose-100', hover: 'hover:border-rose-400' },
};

export default function App() {
  // --- State ---
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // New: User Mode State
  const [userMode, setUserMode] = useState<UserMode>(null);

  const [nav, setNav] = useState<NavigationState>({
    view: 'landing', // Start at landing page
    selectedFieldId: null,
    selectedStageId: null,
    selectedWeekId: null,
    selectedNoteId: null,
  });

  // Search & Filter State
  const [filter, setFilter] = useState<FilterState>({
    query: '',
    fieldId: null,
    stageId: null,
    weekId: null
  });
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Form State
  const [newNoteAuthor, setNewNoteAuthor] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newAttachments, setNewAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Initialization ---
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setIsLoading(true);
    const data = await NoteService.getNotes();
    setNotes(data);
    setIsLoading(false);
  };

  // --- Derived Data ---
  // Regenerate weeks whenever the selected Stage changes
  const generatedWeeks = useMemo(() => {
    return generateWeeks(nav.selectedStageId);
  }, [nav.selectedStageId]); 

  const currentField = FIELDS.find(f => f.id === nav.selectedFieldId);
  const currentStage = STAGES.find(s => s.id === nav.selectedStageId);
  const currentWeek = generatedWeeks.find(w => w.id === nav.selectedWeekId);
  const currentNote = notes.find(n => n.id === nav.selectedNoteId);

  // Filter Logic
  const filteredNotes = useMemo(() => {
    if (isSearchMode) {
      return notes.filter(n => {
        const matchesQuery = filter.query === '' || 
          n.content.toLowerCase().includes(filter.query.toLowerCase()) || 
          n.author.toLowerCase().includes(filter.query.toLowerCase());
        const matchesField = filter.fieldId ? n.fieldId === filter.fieldId : true;
        const matchesStage = filter.stageId ? n.stageId === filter.stageId : true;
        const matchesWeek = filter.weekId ? n.weekId === filter.weekId : true;
        return matchesQuery && matchesField && matchesStage && matchesWeek;
      });
    } else {
      return notes.filter(n => 
        n.fieldId === nav.selectedFieldId && 
        n.stageId === nav.selectedStageId && 
        n.weekId === nav.selectedWeekId
      );
    }
  }, [notes, nav, filter, isSearchMode]);

  // --- Actions ---

  const handleModeSelect = (mode: UserMode) => {
    setUserMode(mode);
    setNav(prev => ({ ...prev, view: 'fields' }));
  };

  const handleBack = () => {
    if (isSearchMode) {
       setIsSearchMode(false);
       return;
    }
    if (nav.view === 'note-detail') {
      if (isSearchMode) {
        setNav(prev => ({ ...prev, view: 'search', selectedNoteId: null }));
      } else {
        setNav(prev => ({ ...prev, view: 'notes', selectedNoteId: null }));
      }
    } else if (nav.view === 'notes') {
      setNav(prev => ({ ...prev, view: 'weeks', selectedWeekId: null }));
    } else if (nav.view === 'weeks') {
      setNav(prev => ({ ...prev, view: 'stages', selectedStageId: null }));
    } else if (nav.view === 'stages') {
      setNav(prev => ({ ...prev, view: 'fields', selectedFieldId: null }));
    } else if (nav.view === 'fields') {
      // Return to landing page and reset mode
      setUserMode(null);
      setNav(prev => ({ ...prev, view: 'landing', selectedFieldId: null }));
    }
  };

  const handleSaveNote = async () => {
    if (!newNoteAuthor.trim() || !newNoteContent.trim()) return;

    const newNote: Note = {
      id: Date.now().toString(),
      author: newNoteAuthor,
      content: newNoteContent,
      date: new Date().toISOString(),
      fieldId: nav.selectedFieldId!,
      stageId: nav.selectedStageId!,
      weekId: nav.selectedWeekId!,
      attachments: newAttachments
    };

    await NoteService.addNote(newNote);
    setNotes(prev => [newNote, ...prev]);
    
    // Reset form
    setNewNoteAuthor('');
    setNewNoteContent('');
    setNewAttachments([]);
    setIsAddModalOpen(false);
  };

  const handleDeleteNote = async () => {
    if (!currentNote) return;
    await NoteService.deleteNote(currentNote.id);
    
    // Update UI local state
    setNotes(prev => prev.filter(n => n.id !== currentNote.id));
    
    setIsDeleteModalOpen(false);
    handleBack(); // Go back to list
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const base64 = await NoteService.convertFileToBase64(file);
        const newAttachment: Attachment = {
          id: Date.now().toString(),
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'document',
          data: base64
        };
        setNewAttachments(prev => [...prev, newAttachment]);
      } catch (err) {
        alert('Dosya yüklenirken hata oluştu.');
      }
    }
  };

  const removeAttachment = (id: string) => {
    setNewAttachments(prev => prev.filter(a => a.id !== id));
  };

  const toggleSearch = () => {
    if (isSearchMode) {
      setIsSearchMode(false);
      setFilter({ query: '', fieldId: null, stageId: null, weekId: null });
    } else {
      setIsSearchMode(true);
      setFilter({
        query: '',
        fieldId: nav.selectedFieldId,
        stageId: nav.selectedStageId,
        weekId: null
      });
    }
  };

  const openNoteDetail = (noteId: string) => {
    setNav(prev => ({ ...prev, view: 'note-detail', selectedNoteId: noteId }));
  };

  // --- Render Components ---

  const renderLandingPage = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 space-y-8 animate-fade-in">
      <div className="text-center space-y-3 mb-4">
         <div className="bg-blue-100 w-20 h-20 mx-auto rounded-full flex items-center justify-center text-blue-600 mb-4 shadow-blue-200 shadow-lg">
            <GraduationCap size={48} />
         </div>
         <h1 className="text-2xl font-bold text-slate-900">Hoş Geldiniz</h1>
         <p className="text-slate-500 max-w-xs mx-auto">Veri Analizi Okulu not paylaşım platformuna giriş yapmak için amacınızı seçin.</p>
      </div>

      <div className="w-full max-w-md space-y-4">
        <button
          onClick={() => handleModeSelect('viewer')}
          className="w-full bg-white hover:bg-blue-50 border-2 border-slate-100 hover:border-blue-200 p-6 rounded-2xl flex items-center gap-5 transition-all group shadow-sm hover:shadow-md"
        >
           <div className="bg-blue-100 text-blue-600 p-4 rounded-full group-hover:scale-110 transition-transform">
              <BookOpen size={28} />
           </div>
           <div className="text-left">
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-700">Notları Görmek İstiyorum</h3>
              <p className="text-sm text-slate-500 mt-1">Ders notlarını incele ve çalış.</p>
           </div>
           <ChevronRight className="ml-auto text-slate-300 group-hover:text-blue-400" />
        </button>

        <button
          onClick={() => handleModeSelect('creator')}
          className="w-full bg-white hover:bg-indigo-50 border-2 border-slate-100 hover:border-indigo-200 p-6 rounded-2xl flex items-center gap-5 transition-all group shadow-sm hover:shadow-md"
        >
           <div className="bg-indigo-100 text-indigo-600 p-4 rounded-full group-hover:scale-110 transition-transform">
              <PenTool size={28} />
           </div>
           <div className="text-left">
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-700">Not Paylaşmak İstiyorum</h3>
              <p className="text-sm text-slate-500 mt-1">Kendi notlarını sisteme yükle.</p>
           </div>
           <ChevronRight className="ml-auto text-slate-300 group-hover:text-indigo-400" />
        </button>
      </div>
    </div>
  );

  const NoteCard = ({ note, showBadges = false }: { note: Note, showBadges?: boolean }) => {
    const field = FIELDS.find(f => f.id === note.fieldId);
    const week = generatedWeeks.find(w => w.id === note.weekId);
    const hasAttachments = note.attachments && note.attachments.length > 0;
    
    return (
      <button
        onClick={() => openNoteDetail(note.id)}
        className="w-full bg-white p-5 rounded-xl shadow-sm border border-slate-100 text-left hover:shadow-md hover:border-blue-300 transition-all group relative overflow-hidden"
      >
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${field ? colorStyles[field.color].bg.replace('bg-', 'bg-') : 'bg-slate-200'} ${field ? colorStyles[field.color].bg.replace('bg-', 'bg-').replace('50', '500') : 'bg-slate-400'}`}></div>

        <div className="pl-2">
          {showBadges && (
             <div className="flex flex-wrap gap-2 mb-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${field ? colorStyles[field.color].bg + ' ' + colorStyles[field.color].text : 'bg-gray-100 text-gray-600'}`}>
                  {field?.title}
                </span>
                <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  {week?.title}
                </span>
             </div>
          )}
          <div className="flex items-center justify-between mb-1.5">
             <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <User size={12} /> {note.author}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-400">{new Date(note.date).toLocaleDateString('tr-TR')}</span>
             </div>
             {hasAttachments && <Paperclip size={14} className="text-slate-400" />}
          </div>
          <p className="text-slate-700 text-sm line-clamp-3 leading-relaxed">
            {note.content}
          </p>
        </div>
      </button>
    );
  };

  const renderFields = () => (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 h-full pb-20">
      <div className="text-slate-500 text-sm font-medium px-1 uppercase tracking-wider mb-2">Ders Programı</div>
      <div className="grid grid-cols-1 gap-4">
        {FIELDS.map(field => {
          const Icon = IconMap[field.iconName];
          const style = colorStyles[field.color];
          return (
            <button
              key={field.id}
              onClick={() => setNav(prev => ({ ...prev, view: 'stages', selectedFieldId: field.id }))}
              className={`w-full ${style.bg} border ${style.border} p-4 rounded-xl shadow-sm flex items-center gap-4 text-left transition-all ${style.hover} active:scale-[0.99]`}
            >
              <div className={`w-12 h-12 ${style.iconBg} rounded-full flex items-center justify-center ${style.text} shrink-0`}>
                <Icon size={24} />
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-bold ${style.text} leading-tight mb-1`}>{field.title}</h3>
                <p className="text-xs text-slate-600 opacity-80 line-clamp-1">{field.description}</p>
              </div>
              <ChevronRight className={`${style.text} opacity-50`} />
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderStages = () => (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 h-full pb-20">
      <div className={`bg-white p-4 rounded-lg shadow-sm border-l-4 mb-6 border-${currentField ? colorStyles[currentField.color].text.split('-')[1] : 'blue'}-500`}>
         <h2 className="font-bold text-xl text-slate-800">{currentField?.title}</h2>
         <p className="text-slate-500 text-sm mt-1">{currentField?.description}</p>
      </div>
      <h3 className="text-slate-900 font-bold text-lg px-1">Aşamalar</h3>
      <div className="space-y-3">
        {STAGES.map((stage, index) => (
          <button
            key={stage.id}
            onClick={() => setNav(prev => ({ ...prev, view: 'weeks', selectedStageId: stage.id }))}
            className="w-full bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center hover:border-blue-400 hover:shadow-md transition-all"
          >
             <div className="flex items-center gap-4">
               <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-sm">
                 {index + 1}
               </div>
               <span className="font-semibold text-slate-800">{stage.title}</span>
             </div>
            <ChevronRight className="text-slate-300" />
          </button>
        ))}
      </div>
    </div>
  );

  const renderWeeks = () => (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 h-full pb-20">
      <div className="bg-slate-800 text-white p-4 rounded-xl shadow-md mb-6">
          <div className="text-sm opacity-70">{currentField?.title}</div>
          <div className="font-bold text-lg">{currentStage?.title}</div>
      </div>
      <div className="flex items-center justify-between px-1 mb-2">
         <h3 className="text-slate-900 font-bold text-lg">Haftalar</h3>
      </div>
      {generatedWeeks.map(week => (
        <button
          key={week.id}
          onClick={() => setNav(prev => ({ ...prev, view: 'notes', selectedWeekId: week.id }))}
          className="w-full bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between hover:border-blue-400 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600">
              <Calendar size={20} />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-slate-800 text-sm">{week.title}</h4>
              <p className="text-xs text-slate-500">{week.startDate} - {week.endDate}</p>
            </div>
          </div>
          <ChevronRight className="text-slate-300" size={20} />
        </button>
      ))}
    </div>
  );

  const renderNoteList = () => (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {filteredNotes.length === 0 ? (
          <div className="text-center text-slate-400 mt-10 flex flex-col items-center animate-fade-in">
            <div className="bg-slate-100 p-6 rounded-full mb-4">
               <BookOpen size={32} className="opacity-50" />
            </div>
            <p className="font-medium text-slate-500">Bu hafta için henüz not eklenmemiş.</p>
            {userMode === 'creator' && (
              <button onClick={() => setIsAddModalOpen(true)} className="mt-4 text-blue-600 text-sm font-bold hover:underline">
                İlk notu sen ekle
              </button>
            )}
          </div>
        ) : (
          filteredNotes.map(note => <NoteCard key={note.id} note={note} />)
        )}
      </div>

      {/* Only show Add Button if User Mode is CREATOR */}
      {userMode === 'creator' && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 text-white p-4 rounded-full shadow-xl shadow-blue-200 hover:bg-blue-700 transition-transform hover:scale-105 active:scale-95 focus:outline-none"
          >
            <Plus size={28} />
          </button>
        </div>
      )}
    </div>
  );

  const renderSearchView = () => (
    <div className="flex flex-col h-full bg-slate-50 animate-fade-in">
      <div className="bg-white border-b border-slate-200 p-4 space-y-4 shadow-sm z-10">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 text-slate-400" size={20} />
          <input 
             type="text"
             placeholder="Notlarda veya yazarda ara..."
             value={filter.query}
             onChange={(e) => setFilter(prev => ({...prev, query: e.target.value}))}
             className="w-full pl-10 pr-4 py-3 bg-slate-100 border-transparent focus:bg-white border focus:border-blue-500 rounded-xl outline-none transition-all text-slate-800 font-medium"
             autoFocus
          />
        </div>

        <div className="flex flex-col gap-3">
           <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
             <button
               onClick={() => setFilter(prev => ({...prev, fieldId: null}))}
               className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${!filter.fieldId ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
             >
               Tüm Dersler
             </button>
             {FIELDS.map(f => (
               <button
                 key={f.id}
                 onClick={() => setFilter(prev => ({...prev, fieldId: prev.fieldId === f.id ? null : f.id}))}
                 className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-colors border ${filter.fieldId === f.id ? `${colorStyles[f.color].bg} ${colorStyles[f.color].text} ${colorStyles[f.color].border}` : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
               >
                 {f.title}
               </button>
             ))}
           </div>
           <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {STAGES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setFilter(prev => ({...prev, stageId: prev.stageId === s.id ? null : s.id}))}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter.stageId === s.id ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300' : 'bg-white border border-slate-200 text-slate-600'}`}
                >
                  {s.title}
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
         <div className="flex justify-between items-center text-xs text-slate-500 font-medium uppercase tracking-wide px-1">
            <span>Sonuçlar</span>
            <span>{filteredNotes.length} not bulundu</span>
         </div>
         
         {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 opacity-50">
               <Filter size={48} className="text-slate-300 mb-4" />
               <p className="text-slate-500 text-center">Aradığınız kriterlere uygun<br/>not bulunamadı.</p>
            </div>
         ) : (
            filteredNotes.map(note => <NoteCard key={note.id} note={note} showBadges={true} />)
         )}
      </div>
    </div>
  );

  const renderNoteDetail = () => {
    if (!currentNote) return null;
    
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 pb-12 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6 relative max-w-3xl mx-auto">
            {/* Delete Button (Only for Creators) */}
            {userMode === 'creator' && (
              <button 
                onClick={() => setIsDeleteModalOpen(true)}
                className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-full transition-colors z-10"
                aria-label="Notu Sil"
              >
                <Trash2 size={20} />
              </button>
            )}

            <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">
                  {currentNote.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{currentNote.author}</h2>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <Clock size={14} />
                    <span>{new Date(currentNote.date).toLocaleString('tr-TR')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <p className="text-slate-800 text-base md:text-lg leading-relaxed whitespace-pre-wrap font-medium">
                {currentNote.content}
              </p>

              {/* Attachments Section */}
              {currentNote.attachments && currentNote.attachments.length > 0 && (
                <div className="mt-6 grid grid-cols-2 gap-4">
                  {currentNote.attachments.map(att => (
                    <div key={att.id} className="border border-slate-200 rounded-xl overflow-hidden relative group">
                        {att.type === 'image' ? (
                          <div className="aspect-video relative bg-slate-100">
                            <img src={att.data} alt={att.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="p-4 flex items-center gap-3 bg-slate-50 h-full">
                            <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                              <FileText size={24} />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-sm font-bold text-slate-700 truncate">{att.name}</p>
                              <span className="text-xs text-slate-400">Döküman</span>
                            </div>
                          </div>
                        )}
                        <a href={att.data} download={att.name} className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="bg-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">İndir</span>
                        </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Modals ---

  const renderDeleteModal = () => (
    <div className="fixed inset-0 bg-slate-900/60 z-[70] flex items-center justify-center backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-slide-up border-t-4 border-red-500">
        <div className="flex flex-col items-center text-center mb-6">
           <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4">
              <AlertTriangle size={28} />
           </div>
           <h3 className="text-xl font-bold text-slate-800">Notu Sil</h3>
           <p className="text-slate-500 mt-2 text-sm">
             Bu notu kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
           </p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setIsDeleteModalOpen(false)}
            className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
          >
            Vazgeç
          </button>
          <button 
            onClick={handleDeleteNote}
            className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
          >
            Evet, Sil
          </button>
        </div>
      </div>
    </div>
  );

  const renderAddModal = () => (
    <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-end sm:items-center justify-center backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full max-w-lg sm:rounded-2xl rounded-t-2xl p-6 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">Yeni Not Ekle</h3>
          <button onClick={() => setIsAddModalOpen(false)} className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Yazar</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
              <input 
                type="text" 
                value={newNoteAuthor}
                onChange={(e) => setNewNoteAuthor(e.target.value)}
                placeholder="Adınız Soyadınız"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Not İçeriği</label>
            <textarea 
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Öğrendiklerinizi buraya yazın..."
              rows={6}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-base text-slate-800 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Dosya Ekle</label>
            
            {/* Hidden Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              className="hidden" 
              accept="image/*,application/pdf"
            />

            <div className="flex items-center gap-3 flex-wrap">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
              >
                <Paperclip size={16} />
                Dosya Seç
              </button>
              <span className="text-xs text-slate-400">Resim veya PDF</span>
            </div>

            {/* File Preview List */}
            {newAttachments.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {newAttachments.map(att => (
                   <div key={att.id} className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg">
                      {att.type === 'image' ? <ImageIcon size={14} className="text-blue-500" /> : <FileText size={14} className="text-orange-500" />}
                      <span className="text-xs text-blue-800 font-medium max-w-[150px] truncate">{att.name}</span>
                      <button onClick={() => removeAttachment(att.id)} className="text-blue-400 hover:text-red-500">
                         <X size={14} />
                      </button>
                   </div>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={handleSaveNote}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 active:scale-[0.98]"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );

  // --- Main Render Switch ---
  const getTitle = () => {
    if (isSearchMode) return 'Arama ve Filtreleme';
    switch (nav.view) {
      case 'landing': return 'Veri Analizi Okulu';
      case 'fields': return 'Ders Programı';
      case 'stages': return currentField?.title || 'Aşama Seçimi';
      case 'weeks': return currentStage?.title || 'Hafta Seçimi';
      case 'notes': return currentWeek?.title || 'Notlar';
      case 'note-detail': return 'Not Detayı';
      default: return 'Veri Analizi Okulu';
    }
  };

  const getSubtitle = () => {
    if (isSearchMode) return 'Tüm notlar içerisinde ara';
    if (nav.view === 'notes' && currentField && currentStage) {
      return `${currentField.title} • ${currentStage.title}`;
    }
    return undefined;
  };

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex flex-col font-sans overflow-hidden">
      <Header 
        title={getTitle()} 
        subtitle={getSubtitle()}
        canGoBack={(nav.view !== 'landing' && nav.view !== 'fields') || isSearchMode || (nav.view === 'fields' && !isSearchMode)} 
        onBack={handleBack}
        onSearchClick={toggleSearch}
        isSearchActive={isSearchMode}
      />

      <main className="flex-1 max-w-3xl mx-auto w-full relative overflow-hidden h-full flex flex-col">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : isSearchMode ? (
           renderSearchView()
        ) : (
           <>
             {nav.view === 'landing' && renderLandingPage()}
             {nav.view === 'fields' && renderFields()}
             {nav.view === 'stages' && renderStages()}
             {nav.view === 'weeks' && renderWeeks()}
             {nav.view === 'notes' && renderNoteList()}
             {nav.view === 'note-detail' && renderNoteDetail()}
           </>
        )}
      </main>

      {isAddModalOpen && renderAddModal()}
      {isDeleteModalOpen && renderDeleteModal()}
    </div>
  );
}