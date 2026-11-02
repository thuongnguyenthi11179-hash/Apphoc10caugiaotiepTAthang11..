import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Search, 
  Star, 
  SlidersHorizontal, 
  Presentation, 
  Printer, 
  HeartHandshake,
  BookOpen
} from 'lucide-react';
import { CLASSROOM_PHRASES, PhraseItem } from './data/phrasesData';
import { playEnglishSpeech, stopSpeech } from './utils/audioSpeech';
import { 
  TeacherRecord, 
  getActiveTeacher, 
  saveTeacher, 
  updateTeacherStars,
  markTeacherSkillCompleted,
  syncTeachersFromCloud
} from './data/teacherStorage';

import { Navbar, AppTab } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { PhraseCard } from './components/PhraseCard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { PracticeGamesView } from './components/PracticeGamesView';
import { AILessonPlanner } from './components/AILessonPlanner';
import { FourSkillsView } from './components/FourSkillsView';
import { MyProgressView } from './components/MyProgressView';
import { SmartboardMode } from './components/SmartboardMode';
import { SpeakingPracticeModal } from './components/SpeakingPracticeModal';
import { PrintResourceModal } from './components/PrintResourceModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { hasUserStoredApiKey, getStoredApiKey } from './utils/geminiService';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [activeTeacher, setActiveTeacher] = useState<TeacherRecord>(getActiveTeacher());
  const [stars, setStars] = useState<number>(activeTeacher.stars || 89);

  // Home Page controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [speechRate, setSpeechRate] = useState<number>(0.9);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<number | null>(null);
  const [currentlyPlayingSlow, setCurrentlyPlayingSlow] = useState<boolean>(false);
  const [isSequencePlaying, setIsSequencePlaying] = useState<boolean>(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [onlyBookmarks, setOnlyBookmarks] = useState<boolean>(false);

  // Modals state
  const [practicePhrase, setPracticePhrase] = useState<PhraseItem | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isSmartboardOpen, setIsSmartboardOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);

  // Synchronize active teacher, cloud records & bookmarks from storage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlTeacherName = params.get('teacher');
    const urlTeacherRole = params.get('role') || 'Giáo viên TH Lê Kim Lăng';

    if (urlTeacherName && urlTeacherName.trim()) {
      const registered = saveTeacher(urlTeacherName.trim(), urlTeacherRole);
      setActiveTeacher(registered);
      setStars(registered.stars);
    } else {
      const teacher = getActiveTeacher();
      setActiveTeacher(teacher);
      setStars(teacher.stars || 89);
    }

    // Pull latest teacher dashboard records from Cloud Sync
    syncTeachersFromCloud().catch(() => {});

    try {
      const saved = localStorage.getItem('lekimlang_bookmarks_nov');
      if (saved) {
        setBookmarkedIds(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const handleSaveTeacherName = (name: string, role?: string) => {
    const saved = saveTeacher(name, role);
    setActiveTeacher(saved);
    setStars(saved.stars);
  };

  const handleEarnStars = (amount: number) => {
    const updated = updateTeacherStars(amount);
    setStars(updated);
    setActiveTeacher(getActiveTeacher());
  };

  const handleMarkSkill = (skill: keyof TeacherRecord['completedSkills']) => {
    const updatedTeacher = markTeacherSkillCompleted(skill);
    setActiveTeacher(updatedTeacher);
  };

  const toggleBookmark = (id: number) => {
    setBookmarkedIds((prev) => {
      const updated = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      try {
        localStorage.setItem('lekimlang_bookmarks_nov', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Play single phrase audio
  const handlePlayPhrase = async (phraseId: number, slow = false) => {
    const phrase = CLASSROOM_PHRASES.find(p => p.id === phraseId);
    if (!phrase) return;

    setCurrentlyPlayingId(phraseId);
    setCurrentlyPlayingSlow(slow);
    await playEnglishSpeech(phrase.english, {
      rate: slow ? 0.75 : speechRate,
      onEnd: () => {
        setCurrentlyPlayingId(null);
        setCurrentlyPlayingSlow(false);
      },
      onError: () => {
        setCurrentlyPlayingId(null);
        setCurrentlyPlayingSlow(false);
      }
    });
  };

  // Play sequence of all 10 phrases
  const handlePlayAllSequence = async () => {
    if (isSequencePlaying) {
      stopSpeech();
      setIsSequencePlaying(false);
      setCurrentlyPlayingId(null);
      return;
    }

    setIsSequencePlaying(true);
    for (const item of CLASSROOM_PHRASES) {
      setCurrentlyPlayingId(item.id);
      await playEnglishSpeech(item.english, { rate: speechRate });
      await new Promise(r => setTimeout(r, 1200));
    }
    setCurrentlyPlayingId(null);
    setIsSequencePlaying(false);
  };

  // Filter phrases for Home Grid
  const filteredPhrases = CLASSROOM_PHRASES.filter((item) => {
    const matchSearch =
      item.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vietnamese.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.contextVi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    const matchBookmark = !onlyBookmarks || bookmarkedIds.includes(item.id);
    return matchSearch && matchCategory && matchBookmark;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeTeacher={activeTeacher}
        stars={stars}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        hasApiKey={hasApiKey}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1520px] w-full mx-auto px-3 sm:px-6 py-6 space-y-8">
        {/* TAB 1: TRANG CHỦ (HOME) */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            {/* Hero Banner matching user's reference image */}
            <HeroBanner
              onStartPractice={() => setActiveTab('practice')}
              onOpenAILesson={() => setActiveTab('ai-lesson')}
              activeTeacher={activeTeacher}
              onSaveTeacherName={handleSaveTeacherName}
            />

            {/* Smartboard & Print Bar */}
            <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handlePlayAllSequence}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs active:scale-95 ${
                    isSequencePlaying
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-amber-400 hover:bg-amber-500 text-slate-950'
                  }`}
                >
                  {isSequencePlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Dừng phát</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Nghe liên tục 10 câu (01 - 10)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setIsSmartboardOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors"
                >
                  <Presentation className="w-4 h-4 text-teal-600" />
                  <span>Trình chiếu Smartboard</span>
                </button>

                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Tài liệu in A4</span>
                </button>
              </div>

              {/* Speed Controller */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
                <span className="font-semibold text-slate-700">Tốc độ âm thanh:</span>
                <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setSpeechRate(0.75);
                      handlePlayPhrase(currentlyPlayingId || 1, true);
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                      speechRate === 0.75 ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    0.75x (Chậm)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSpeechRate(0.9);
                      if (currentlyPlayingId) {
                        playEnglishSpeech(
                          CLASSROOM_PHRASES.find(p => p.id === currentlyPlayingId)?.english || '',
                          { rate: 0.9 }
                        );
                      }
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                      speechRate === 0.9 ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    0.9x (Chuẩn)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSpeechRate(1.0);
                      if (currentlyPlayingId) {
                        playEnglishSpeech(
                          CLASSROOM_PHRASES.find(p => p.id === currentlyPlayingId)?.english || '',
                          { rate: 1.0 }
                        );
                      }
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                      speechRate === 1.0 ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    1.0x (Nhanh)
                  </button>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="no-print flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Category Segmented Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold w-full md:w-auto">
                {[
                  { id: 'all', label: 'Tất cả 10 câu' },
                  { id: 'Văn hóa lớp học', label: 'Văn hóa lớp học' },
                  { id: 'Nề nếp kỷ luật', label: 'Nề nếp kỷ luật' },
                  { id: 'Động lực & Tinh thần', label: 'Động lực & Tinh thần' },
                  { id: 'Giao tiếp tiếng Anh', label: 'Giao tiếp tiếng Anh' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-teal-700 text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search & Bookmarks */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-60">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm câu tiếng Anh, tiếng Việt..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-medium"
                  />
                </div>

                <button
                  onClick={() => setOnlyBookmarks(!onlyBookmarks)}
                  className={`p-2 rounded-xl border transition-colors flex items-center gap-1 text-xs font-bold ${
                    onlyBookmarks
                      ? 'bg-amber-100 border-amber-300 text-amber-900'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Xem câu đã đánh dấu sao"
                >
                  <Star className={`w-3.5 h-3.5 ${onlyBookmarks ? 'fill-amber-500 text-amber-500' : ''}`} />
                  <span className="hidden sm:inline">({bookmarkedIds.length})</span>
                </button>
              </div>
            </div>

            {/* 10 Phrases Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPhrases.map((phrase) => (
                <PhraseCard
                  key={phrase.id}
                  phrase={phrase}
                  isPlaying={currentlyPlayingId === phrase.id && !currentlyPlayingSlow}
                  isPlayingSlow={currentlyPlayingId === phrase.id && currentlyPlayingSlow}
                  onPlay={handlePlayPhrase}
                  onOpenPractice={(p) => setPracticePhrase(p)}
                  speechRate={speechRate}
                  isBookmarked={bookmarkedIds.includes(phrase.id)}
                  onToggleBookmark={toggleBookmark}
                />
              ))}
            </div>

            {/* Pedagogical Guidance Footer Card */}
            <section className="no-print bg-white rounded-3xl border border-slate-200 p-6 md:p-8 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 text-teal-800">
                <HeartHandshake className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold">
                  Sổ Tay Phương Pháp Sư Phạm · Trường TH Lê Kim Lăng
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 leading-relaxed">
                <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-1">
                  <span className="font-bold text-teal-950 block">1. Phản xạ vận động TPR</span>
                  <p>Mỗi khẩu lệnh luôn gắn kèm một động tác cử chỉ tay vui nhộn giúp học sinh tiểu học nhớ sâu và hào hứng tham gia.</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-1">
                  <span className="font-bold text-amber-950 block">2. Vè đồng dao 4 chữ</span>
                  <p>Tập vỗ tay theo nhịp vè đồng thanh giúp rèn luyện ngữ điệu, trọng âm câu và tạo không khí học tập tích cực.</p>
                </div>
                <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-1">
                  <span className="font-bold text-sky-950 block">3. Khen ngợi & Động viên</span>
                  <p>Thường xuyên dùng "Do your best!" và "Never give up!" kết hợp thưởng sao để các em tự tin cất tiếng nói tiếng Anh.</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: TEACHER DASHBOARD */}
        {activeTab === 'teacher' && (
          <TeacherDashboard
            activeTeacher={activeTeacher}
            onSelectActiveTeacher={(t) => {
              setActiveTeacher(t);
              setStars(t.stars);
            }}
            onOpenPrint={() => setIsPrintModalOpen(true)}
          />
        )}

        {/* TAB 3: PRACTICE GAMES (Trò chơi ôn tập với câu trả lời ngẫu nhiên) */}
        {activeTab === 'practice' && (
          <PracticeGamesView
            onEarnStars={handleEarnStars}
            onCompletePractice={() => handleMarkSkill('practice')}
          />
        )}

        {/* TAB 4: AI TẠO BÀI DẠY */}
        {activeTab === 'ai-lesson' && (
          <AILessonPlanner
            onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
            teacherName={activeTeacher.name}
            onEarnStars={handleEarnStars}
          />
        )}

        {/* TAB 5, 6, 7, 8: 4 KỸ NĂNG NGHE - NÓI - ĐỌC - VIẾT */}
        {(activeTab === 'listen' || activeTab === 'speak' || activeTab === 'read' || activeTab === 'write') && (
          <FourSkillsView
            skill={activeTab}
            speechRate={speechRate}
            onOpenPractice={(p) => setPracticePhrase(p)}
            onEarnStars={handleEarnStars}
            onMarkSkill={handleMarkSkill}
          />
        )}

        {/* TAB 9: MY PROGRESS */}
        {activeTab === 'progress' && (
          <MyProgressView
            activeTeacher={activeTeacher}
            stars={stars}
            onOpenPrint={() => setIsPrintModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-[1520px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Trường Tiểu Học Lê Kim Lăng</span>
            <span>·</span>
            <span>Phường Hòa Xuân, TP Đà Nẵng</span>
            <span>·</span>
            <span className="text-teal-700 font-semibold">10 Mẫu Câu Tiếng Anh Tháng 11</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('home')} className="hover:text-teal-700">Trang chủ</button>
            <button onClick={() => setActiveTab('teacher')} className="hover:text-teal-700">Teacher Dashboard</button>
            <button onClick={() => setActiveTab('practice')} className="hover:text-teal-700">Trò chơi ngẫu nhiên</button>
            <button onClick={() => setIsPrintModalOpen(true)} className="hover:text-teal-700">In tài liệu</button>
          </div>
        </div>
      </footer>

      {/* Smartboard Fullscreen Mode Modal */}
      {isSmartboardOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950 p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setIsSmartboardOpen(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700"
              >
                ✕ Đóng Smartboard
              </button>
            </div>
            <SmartboardMode
              phrases={CLASSROOM_PHRASES}
              speechRate={speechRate}
            />
          </div>
        </div>
      )}

      {/* Speech Practice Modal */}
      {practicePhrase && (
        <SpeakingPracticeModal
          phrase={practicePhrase}
          isOpen={!!practicePhrase}
          onClose={() => setPracticePhrase(null)}
          speechRate={speechRate}
          onEarnStars={handleEarnStars}
          onCompleteSpeak={() => handleMarkSkill('speak')}
        />
      )}

      {/* Printable Flashcards & Posters Modal */}
      <PrintResourceModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />

      {/* Gemini API Key & Model Settings Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSaveSuccess={() => {
          setHasApiKey(true);
          setIsApiKeyModalOpen(false);
        }}
        forceRequireKey={!hasApiKey}
      />
    </div>
  );
}
