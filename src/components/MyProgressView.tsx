import React, { useState } from 'react';
import { Trophy, Star, Award, CheckCircle2, BookOpen, Printer, Download, Sparkles, Check } from 'lucide-react';
import { TeacherRecord } from '../data/teacherStorage';
import { CLASSROOM_PHRASES } from '../data/phrasesData';
import { SchoolLogo } from './SchoolLogo';
import { generateAndDownloadCertificate } from '../utils/certificateGenerator';

interface Props {
  activeTeacher: TeacherRecord;
  stars: number;
  onOpenPrint: () => void;
}

export const MyProgressView: React.FC<Props> = ({ activeTeacher, stars, onOpenPrint }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadCertificate = async () => {
    try {
      setIsDownloading(true);
      await generateAndDownloadCertificate({
        teacherName: activeTeacher.name || 'Cô Nguyễn Thị Thương',
        role: activeTeacher.role || 'Giáo viên Tổ Ngoại ngữ',
        stars: stars || 89
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Download failed:', err);
      // Fallback to opening print dialog
      onOpenPrint();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-amber-500 via-orange-600 to-teal-700 text-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-bold text-white">
          <Trophy className="w-4 h-4 text-amber-200" />
          <span>BẢNG TIẾN ĐỘ & THÀNH TÍCH CÁ NHÂN</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black">
              {activeTeacher.name || 'Giáo viên TH Lê Kim Lăng'}
            </h2>
            <div className="text-xs sm:text-sm text-amber-100 font-semibold mt-0.5">
              {activeTeacher.role || 'Tổ Ngoại ngữ'} · Phong trào Tiếng Anh Tháng 11
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-xs px-4 py-2 rounded-2xl shrink-0">
            <Star className="w-6 h-6 text-amber-300 fill-amber-300" />
            <div>
              <div className="text-[10px] text-amber-100 uppercase font-bold">Tổng số sao</div>
              <div className="text-2xl font-black">{stars} ⭐</div>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Skills Progress Tracker & Interactive Chart */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-bold text-slate-900">
            Tiến Độ & Biểu Đồ 5 Kỹ Năng Trọng Tâm
          </h3>
          <span className="text-xs font-extrabold text-teal-700 bg-teal-50 px-3 py-1 rounded-full">
            Đã hoàn thành:{' '}
            {
              Object.values(
                activeTeacher.completedSkills || {
                  listen: true,
                  speak: false,
                  read: false,
                  write: false,
                  practice: false
                }
              ).filter(Boolean).length
            }{' '}
            / 5 kỹ năng
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            {
              key: 'listen',
              label: 'Nghe (Listen)',
              icon: '🎧',
              done: activeTeacher.completedSkills?.listen ?? true,
              pct: activeTeacher.completedSkills?.listen ? 100 : 40,
              color: 'bg-blue-50 text-blue-800 border-blue-200',
              barColor: 'bg-blue-600'
            },
            {
              key: 'speak',
              label: 'Nói (Speak)',
              icon: '🎙️',
              done: activeTeacher.completedSkills?.speak ?? false,
              pct: activeTeacher.completedSkills?.speak ? 100 : 50,
              color: 'bg-rose-50 text-rose-800 border-rose-200',
              barColor: 'bg-rose-600'
            },
            {
              key: 'read',
              label: 'Đọc (Read)',
              icon: '📖',
              done: activeTeacher.completedSkills?.read ?? false,
              pct: activeTeacher.completedSkills?.read ? 100 : 45,
              color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
              barColor: 'bg-emerald-600'
            },
            {
              key: 'write',
              label: 'Viết (Write)',
              icon: '✍️',
              done: activeTeacher.completedSkills?.write ?? false,
              pct: activeTeacher.completedSkills?.write ? 100 : 35,
              color: 'bg-purple-50 text-purple-800 border-purple-200',
              barColor: 'bg-purple-600'
            },
            {
              key: 'practice',
              label: 'Trò chơi (Game)',
              icon: '🎮',
              done: activeTeacher.completedSkills?.practice ?? false,
              pct: activeTeacher.completedSkills?.practice ? 100 : 55,
              color: 'bg-amber-50 text-amber-800 border-amber-200',
              barColor: 'bg-amber-500'
            }
          ].map((item) => (
            <div key={item.key} className={`p-4 rounded-2xl border text-center space-y-2 ${item.color}`}>
              <div className="text-2xl">{item.icon}</div>
              <div className="text-xs font-bold">{item.label}</div>
              <div className="w-full h-1.5 bg-white/80 rounded-full overflow-hidden">
                <div
                  style={{ width: `${item.pct}%` }}
                  className={`h-full transition-all duration-500 ${item.barColor}`}
                />
              </div>
              <div className="text-[10px] font-bold flex items-center justify-center gap-1">
                <CheckCircle2 className={`w-3 h-3 ${item.done ? 'opacity-100' : 'opacity-40'}`} />
                <span>{item.done ? 'Đã hoàn thành' : 'Đang rèn luyện'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 10 Phrases Completion Checklist */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Danh Sách 10 Khẩu Lệnh Tháng 11
          </h3>
          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full">
            10 / 10 câu đã kích hoạt
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {CLASSROOM_PHRASES.map((phrase) => (
            <div key={phrase.id} className="py-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md bg-teal-50 text-teal-700 font-bold flex items-center justify-center shrink-0">
                  {phrase.id}
                </span>
                <div>
                  <div className="font-bold text-slate-900">{phrase.english}</div>
                  <div className="text-slate-500 text-[11px]">{phrase.vietnamese}</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden sm:inline">Chuẩn bản ngữ</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certificate Preview Card with Working Download & Print Actions */}
      <div className="bg-linear-to-b from-amber-50/60 to-white p-6 sm:p-10 rounded-3xl border-2 border-amber-300 text-center space-y-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-center gap-2">
          <SchoolLogo size={42} className="w-10 h-10" />
          <div className="text-left leading-tight">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              ỦY BAN NHÂN DÂN PHƯỜNG HÒA XUÂN
            </div>
            <div className="text-xs sm:text-sm font-black uppercase text-teal-900 tracking-wider">
              TRƯỜNG TIỂU HỌC LÊ KIM LĂNG
            </div>
          </div>
        </div>

        <div className="space-y-1 pt-2">
          <div className="text-xs uppercase font-extrabold text-amber-700 tracking-widest">
            ★ GIẤY CHỨNG NHẬN THI ĐUA ★
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-rose-900">
            10 Câu Tiếng Anh Giao Tiếp Trong Lớp Học
          </h2>
          <div className="text-xs text-amber-800 font-bold">
            Tháng 11 Năm 2026 · Phong trào rèn luyện chuẩn quốc tế
          </div>
        </div>

        <div className="py-2">
          <p className="text-xs text-slate-500 uppercase font-semibold">Trao tặng cho Thầy/Cô:</p>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {activeTeacher.name || 'Cô Nguyễn Thị Thương'}
          </div>
          <p className="text-xs font-bold text-teal-700 mt-0.5">
            {activeTeacher.role || 'Giáo viên Tổ Ngoại ngữ'} · Trường TH Lê Kim Lăng
          </p>
          <p className="text-xs text-slate-600 max-w-lg mx-auto mt-2 leading-relaxed">
            Đã tích cực tham gia rèn luyện phát âm chuẩn bản ngữ, áp dụng phương pháp phản xạ TPR và đạt thành tích xuất sắc: <strong className="text-amber-700 font-extrabold">⭐ {stars} Sao Thi Đua</strong>.
          </p>
        </div>

        {/* Working Download & Print Buttons */}
        <div className="pt-3 border-t border-amber-200/60 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleDownloadCertificate}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 rounded-2xl text-xs sm:text-sm font-black shadow-md transition-all cursor-pointer disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'Đang tạo ảnh...' : 'Tải Giấy Chứng Nhận (Ảnh PNG)'}</span>
          </button>

          <button
            onClick={onOpenPrint}
            className="inline-flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 active:scale-95 text-slate-800 border border-slate-300 rounded-2xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-teal-700" />
            <span>Xem Bản In Khổ A4</span>
          </button>
        </div>

        {downloadSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Đã tải thành công tệp ảnh Giấy Chứng Nhận chất lượng cao về máy của bạn!</span>
          </div>
        )}
      </div>
    </div>
  );
};
