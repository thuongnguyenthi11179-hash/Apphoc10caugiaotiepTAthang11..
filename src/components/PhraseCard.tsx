import React, { useState, useEffect } from 'react';
import { Volume2, Mic, ChevronDown, ChevronUp, Copy, Check, Star, Sparkles, BookOpen, Music } from 'lucide-react';
import { PhraseItem } from '../data/phrasesData';
import { playEnglishSpeech } from '../utils/audioSpeech';
import { startChantMetronome, stopChantMetronome } from '../utils/soundEffects';

interface Props {
  phrase: PhraseItem;
  isPlaying: boolean;
  isPlayingSlow?: boolean;
  onPlay: (phraseId: number, slow?: boolean) => void;
  onOpenPractice: (phrase: PhraseItem) => void;
  speechRate: number;
  isBookmarked: boolean;
  onToggleBookmark: (id: number) => void;
}

export const PhraseCard: React.FC<Props> = ({
  phrase,
  isPlaying,
  isPlayingSlow = false,
  onPlay,
  onOpenPractice,
  speechRate,
  isBookmarked,
  onToggleBookmark
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [isBeatPlaying, setIsBeatPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (isBeatPlaying) stopChantMetronome();
    };
  }, [isBeatPlaying]);

  const toggleChantBeat = () => {
    if (isBeatPlaying) {
      stopChantMetronome();
      setIsBeatPlaying(false);
    } else {
      setIsBeatPlaying(true);
      startChantMetronome(105);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(phrase.english);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWordSpeak = (word: string) => {
    setActiveWord(word);
    playEnglishSpeech(word, {
      rate: 0.8,
      onEnd: () => setActiveWord(null)
    });
  };

  return (
    <div
      id={`phrase-${phrase.id}`}
      className="group relative bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
    >
      {/* Visual illustration top slice */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden border-b border-slate-100">
        <img
          src={phrase.image}
          alt={phrase.english}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-900/70 via-slate-900/20 to-transparent" />

        {/* Index & Category tag */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/95 backdrop-blur-xs text-xs font-bold text-slate-900 shadow-xs">
            {phrase.id.toString().padStart(2, '0')}
          </span>
          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide bg-slate-900/80 backdrop-blur-xs text-white">
            {phrase.category}
          </span>
        </div>

        {/* Bookmark & Copy actions */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <button
            onClick={() => onToggleBookmark(phrase.id)}
            className={`p-2 rounded-lg backdrop-blur-xs transition-colors ${
              isBookmarked
                ? 'bg-amber-400 text-slate-900'
                : 'bg-black/40 text-white hover:bg-black/60'
            }`}
            title={isBookmarked ? "Bỏ lưu câu này" : "Lưu vào mục yêu thích"}
            aria-label="Lưu mẫu câu"
          >
            <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-black/40 text-white backdrop-blur-xs hover:bg-black/60 transition-colors"
            title="Sao chép câu"
            aria-label="Sao chép"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* English Title over scrim */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-xl font-extrabold text-white tracking-tight drop-shadow-xs">
            {phrase.english}
          </h3>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* IPA Phonetic */}
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 bg-indigo-50/70 px-2.5 py-1 rounded-md w-fit">
            <span>{phrase.phonetic}</span>
          </div>

          {/* Vietnamese Translation */}
          <p className="mt-2 text-sm font-semibold text-slate-800 leading-snug">
            {phrase.vietnamese}
          </p>

          {/* Classroom Context */}
          <p className="mt-1 text-xs text-slate-500 line-clamp-2">
            <span className="font-medium text-slate-700">Khi nào dùng:</span> {phrase.contextVi}
          </p>
        </div>

        {/* Audio & Practice Controls Strip */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPlay(phrase.id, false)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-300 ring-offset-1'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:scale-95'
              }`}
              title="Phát âm chuẩn (Tốc độ thường)"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? 'animate-pulse' : ''}`} />
              <span>Nghe ({speechRate}x)</span>
            </button>

            <button
              type="button"
              onClick={() => onPlay(phrase.id, true)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                isPlayingSlow
                  ? 'bg-teal-600 text-white ring-2 ring-teal-300 ring-offset-1'
                  : 'text-slate-700 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 active:scale-95'
              }`}
              title="Nghe tốc độ chậm cho học sinh tiểu học (0.75x)"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isPlayingSlow ? 'animate-pulse' : 'text-teal-600'}`} />
              <span>Chậm 0.75x</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onOpenPractice(phrase)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100/90 rounded-lg hover:bg-amber-200 transition-all active:scale-95 cursor-pointer"
            title="Luyện nói thử thách micro"
          >
            <Mic className="w-3.5 h-3.5 text-amber-700" />
            <span>Luyện nói</span>
          </button>
        </div>

        {/* Expanded Pedagogical Details (TPR, Dialogue, Words breakdown) */}
        {isExpanded && (
          <div className="pt-3 border-t border-slate-100 space-y-3.5 text-xs animate-in fade-in duration-200">
            {/* Word by word pronunciation breakdown */}
            <div>
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Phân tích từng từ (Bấm để nghe):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {phrase.wordsBreakdown.map((w, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleWordSpeak(w.word)}
                    className={`px-2 py-1 rounded-md text-left transition-colors border ${
                      activeWord === w.word
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 hover:bg-indigo-50 text-slate-800 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <span className="font-bold">{w.word}</span>{' '}
                    <span className="font-mono text-[10px] opacity-75">{w.phonetic}</span>
                    <span className="block text-[10px] text-slate-500 font-normal">{w.meaning}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Total Physical Response (TPR) Gesture */}
            <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-emerald-950">
              <span className="font-bold flex items-center gap-1 text-emerald-800 mb-0.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Động tác cử chỉ TPR (Cho học sinh làm theo):
              </span>
              <p className="leading-relaxed text-emerald-900">{phrase.tprGesture}</p>
            </div>

            {/* Classroom Dialogue */}
            <div className="p-2.5 rounded-lg bg-sky-50/70 border border-sky-100 space-y-1.5">
              <span className="font-bold text-sky-800 block text-[11px] uppercase tracking-wider">
                Hội thoại mẫu trong lớp học:
              </span>
              <div className="text-slate-800">
                <span className="font-semibold text-indigo-700">Cô giáo:</span> "{phrase.dialogue.teacher}"
                <div className="text-[11px] text-slate-500 italic pl-3">{phrase.dialogue.teacherVi}</div>
              </div>
              <div className="text-slate-800">
                <span className="font-semibold text-emerald-700">Cả lớp:</span> "{phrase.dialogue.students}"
                <div className="text-[11px] text-slate-500 italic pl-3">{phrase.dialogue.studentsVi}</div>
              </div>
            </div>

            {/* Rhythm Chant */}
            <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-100 text-amber-950 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-amber-800 block text-[11px] uppercase tracking-wider">
                  Vè vần điệu (Đọc vỗ tay đồng thanh):
                </span>
                <button
                  type="button"
                  onClick={toggleChantBeat}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                    isBeatPlaying
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-amber-200/80 hover:bg-amber-300 text-amber-950'
                  }`}
                >
                  <Music className="w-3 h-3" />
                  <span>{isBeatPlaying ? 'Dừng nhịp' : 'Nhịp vỗ tay 2/4'}</span>
                </button>
              </div>
              <p className="font-medium italic text-amber-900">"{phrase.chant}"</p>
            </div>

            {/* Teacher tip */}
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
              <span className="font-bold text-slate-900 flex items-center gap-1 mb-0.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> Mẹo sư phạm cho Thầy Cô:
              </span>
              <p className="text-[11px] leading-relaxed">{phrase.teacherTip}</p>
            </div>
          </div>
        )}

        {/* Expand / Collapse Details Trigger */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full pt-2 flex items-center justify-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <span>{isExpanded ? 'Thu gọn chi tiết' : 'Xem chi tiết & Hội thoại mẫu'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
