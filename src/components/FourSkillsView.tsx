import React, { useState } from 'react';
import { 
  Headphones, 
  Mic, 
  BookOpen, 
  PenTool, 
  Volume2, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw,
  Play,
  Pause
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CLASSROOM_PHRASES, PhraseItem } from '../data/phrasesData';
import { playEnglishSpeech, stopSpeech } from '../utils/audioSpeech';
import { playSuccessSound, playErrorSound } from '../utils/soundEffects';
import { FlashcardMode } from './FlashcardMode';

interface Props {
  skill: 'listen' | 'speak' | 'read' | 'write';
  speechRate: number;
  onOpenPractice: (phrase: PhraseItem) => void;
  onEarnStars?: (stars: number) => void;
  onMarkSkill?: (skill: 'listen' | 'speak' | 'read' | 'write') => void;
}

export const FourSkillsView: React.FC<Props> = ({
  skill,
  speechRate,
  onOpenPractice,
  onEarnStars,
  onMarkSkill
}) => {
  // Listen Mode State
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [playingSlow, setPlayingSlow] = useState<boolean>(false);

  // Write Mode State
  const [writePhraseIndex, setWritePhraseIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [writeStatus, setWriteStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const activeWritePhrase = CLASSROOM_PHRASES[writePhraseIndex];

  React.useEffect(() => {
    if (skill === 'read') {
      onMarkSkill?.('read');
    }
  }, [skill, onMarkSkill]);

  const handlePlayVoice = (phrase: PhraseItem, slow = false) => {
    setPlayingId(phrase.id);
    setPlayingSlow(slow);
    onMarkSkill?.('listen');
    playEnglishSpeech(phrase.english, {
      rate: slow ? 0.75 : speechRate,
      onEnd: () => {
        setPlayingId(null);
        setPlayingSlow(false);
      },
      onError: () => {
        setPlayingId(null);
        setPlayingSlow(false);
      }
    });
  };

  const handleCheckWrite = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = userInput.trim().toLowerCase().replace(/[.,!?;:]/g, '');
    const cleanTarget = activeWritePhrase.english.trim().toLowerCase().replace(/[.,!?;:]/g, '');

    if (cleanUser === cleanTarget) {
      setWriteStatus('correct');
      onEarnStars?.(15);
      onMarkSkill?.('write');
      playSuccessSound();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      playEnglishSpeech(activeWritePhrase.english, { rate: 0.85 });
    } else {
      setWriteStatus('wrong');
      playErrorSound();
    }
  };

  const handleNextWrite = () => {
    setUserInput('');
    setWriteStatus('idle');
    setWritePhraseIndex(prev => (prev + 1) % CLASSROOM_PHRASES.length);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 1. LISTEN SKILL TAB */}
      {skill === 'listen' && (
        <div className="space-y-6">
          <div className="bg-linear-to-r from-blue-700 to-indigo-800 text-white rounded-3xl p-6 sm:p-8 shadow-xs space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-blue-200">
              <Headphones className="w-4 h-4 text-cyan-300" />
              <span>KỸ NĂNG NGHE · LISTENING PRACTICE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">
              Luyện Nghe Chuẩn Bản Ngữ 10 Khẩu Lệnh
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              Nghe rõ từng phụ âm đầu, nguyên âm và phụ âm đuôi (/t/, /k/, /ʃ/, /st/) ở cả hai tốc độ chuẩn và chậm (0.75x).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CLASSROOM_PHRASES.map((phrase) => {
              const isPlayingNormal = playingId === phrase.id && !playingSlow;
              const isPlayingSlowCard = playingId === phrase.id && playingSlow;
              return (
                <div
                  key={phrase.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 font-extrabold text-xs flex items-center justify-center">
                      {phrase.id}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      {phrase.category}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-slate-900">
                      {phrase.english}
                    </h4>
                    <div className="text-xs font-mono text-blue-600 mt-0.5">
                      {phrase.phonetic}
                    </div>
                    <div className="text-xs text-slate-600 font-medium mt-1">
                      {phrase.vietnamese}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePlayVoice(phrase, false)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isPlayingNormal
                            ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100 active:scale-95'
                        }`}
                      >
                        <Volume2 className={`w-3.5 h-3.5 ${isPlayingNormal ? 'animate-pulse' : ''}`} />
                        <span>Nghe chuẩn</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePlayVoice(phrase, true)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isPlayingSlowCard
                            ? 'bg-teal-600 text-white ring-2 ring-teal-300'
                            : 'bg-slate-100 text-slate-700 hover:bg-teal-50 hover:text-teal-800 active:scale-95'
                        }`}
                        title="Nghe chậm rõ âm đuôi (0.75x)"
                      >
                        <Volume2 className={`w-3.5 h-3.5 ${isPlayingSlowCard ? 'animate-pulse' : 'text-teal-600'}`} />
                        <span>Chậm 0.75x</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenPractice(phrase)}
                      className="text-xs font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
                    >
                      Luyện nói →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. SPEAK SKILL TAB */}
      {skill === 'speak' && (
        <div className="space-y-6">
          <div className="bg-linear-to-r from-rose-700 to-pink-800 text-white rounded-3xl p-6 sm:p-8 shadow-xs space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-rose-200">
              <Mic className="w-4 h-4 text-amber-300" />
              <span>KỸ NĂNG NÓI · SPEAKING PRACTICE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">
              Thử Thách Phát Âm & Chấm Điểm Micro
            </h2>
            <p className="text-xs sm:text-sm text-rose-100 max-w-2xl leading-relaxed">
              Chọn một câu bất kỳ dưới đây, bật micro và phát âm để hệ thống nhận diện và chấm điểm tự động.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CLASSROOM_PHRASES.map((phrase) => (
              <div
                key={phrase.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-rose-300 transition-all flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 font-extrabold text-xs flex items-center justify-center">
                      #{phrase.id}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {phrase.category}
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-slate-900">{phrase.english}</h4>
                  <div className="text-xs font-mono text-rose-600 mt-0.5">{phrase.phonetic}</div>
                  <div className="text-xs text-slate-600 mt-1">{phrase.vietnamese}</div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handlePlayVoice(phrase, false)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Nghe mẫu</span>
                  </button>

                  <button
                    onClick={() => onOpenPractice(phrase)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Luyện nói Micro</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. READ SKILL TAB */}
      {skill === 'read' && (
        <div className="space-y-6">
          <div className="bg-linear-to-r from-emerald-700 to-teal-800 text-white rounded-3xl p-6 sm:p-8 shadow-xs space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-emerald-200">
              <BookOpen className="w-4 h-4 text-emerald-300" />
              <span>KỸ NĂNG ĐỌC · READING & FLASHCARDS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">
              Đọc Hiểu & Ghi Nhớ Qua Thẻ 3D
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
              Lật xem thẻ flashcard 2 mặt, tra cứu phiên âm chi tiết và tình huống thực tế trong lớp học.
            </p>
          </div>

          <FlashcardMode
            phrases={CLASSROOM_PHRASES}
            speechRate={speechRate}
            onOpenPractice={onOpenPractice}
          />
        </div>
      )}

      {/* 4. WRITE SKILL TAB */}
      {skill === 'write' && (
        <div className="space-y-6">
          <div className="bg-linear-to-r from-purple-700 to-indigo-800 text-white rounded-3xl p-6 sm:p-8 shadow-xs space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-purple-200">
              <PenTool className="w-4 h-4 text-purple-300" />
              <span>KỸ NĂNG VIẾT · WRITING & DICTATION</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">
              Nghe & Gõ Lại Chính Tả Khẩu Lệnh
            </h2>
            <p className="text-xs sm:text-sm text-purple-100 max-w-2xl leading-relaxed">
              Luyện thói quen viết đúng chính tả tiếng Anh để chuẩn bị tài liệu và bài giảng tương tác trên bảng lớp học.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-purple-700 uppercase">
                  Câu hỏi #{writePhraseIndex + 1} / {CLASSROOM_PHRASES.length}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Gõ lại câu tiếng Anh chính xác
                </h3>
              </div>
              <button
                onClick={() => playEnglishSpeech(activeWritePhrase.english, { rate: 0.85 })}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-bold"
              >
                <Volume2 className="w-4 h-4" />
                <span>Bấm nghe câu</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-xs text-slate-500 font-semibold">Gợi ý nghĩa tiếng Việt:</span>
              <div className="text-base font-bold text-slate-900">
                "{activeWritePhrase.vietnamese}"
              </div>
            </div>

            <form onSubmit={handleCheckWrite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Nhập câu tiếng Anh (không phân biệt chữ hoa, chữ thường):
                </label>
                <input
                  type="text"
                  required
                  placeholder={`Ví dụ: ${activeWritePhrase.english.substring(0, 3)}...`}
                  value={userInput}
                  onChange={(e) => {
                    setUserInput(e.target.value);
                    setWriteStatus('idle');
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setUserInput(activeWritePhrase.english)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Xem đáp án mẫu
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    Kiểm tra kết quả
                  </button>

                  <button
                    type="button"
                    onClick={handleNextWrite}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    Bỏ qua
                  </button>
                </div>
              </div>
            </form>

            {writeStatus === 'correct' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Chính xác 100%! (+15 sao)
                </span>
                <button
                  onClick={handleNextWrite}
                  className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                >
                  Câu tiếp theo →
                </button>
              </div>
            )}

            {writeStatus === 'wrong' && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold">
                Chưa chính xác chính tả! Đáp án đúng: "{activeWritePhrase.english}". Thầy/Cô hãy thử lại nhé!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
