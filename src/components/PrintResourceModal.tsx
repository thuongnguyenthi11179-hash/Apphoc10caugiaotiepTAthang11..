import React, { useState } from 'react';
import { Printer, X, Download, FileText, Check, Award, FileDown } from 'lucide-react';
import { CLASSROOM_PHRASES } from '../data/phrasesData';
import { getActiveTeacher } from '../data/teacherStorage';
import { generateAndDownloadCertificate } from '../utils/certificateGenerator';
import { exportWorksheetToWord } from '../utils/wordExport';
import { SchoolLogo } from './SchoolLogo';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'certificate' | 'flashcards' | 'poster' | 'chants' | 'worksheet';
}

export const PrintResourceModal: React.FC<Props> = ({ 
  isOpen, 
  onClose,
  defaultTab = 'certificate'
}) => {
  const [printLayout, setPrintLayout] = useState<'certificate' | 'flashcards' | 'chants' | 'poster' | 'worksheet'>(defaultTab);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const activeTeacher = getActiveTeacher();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPNG = async () => {
    try {
      setIsDownloading(true);
      await generateAndDownloadCertificate({
        teacherName: activeTeacher.name || 'Cô Nguyễn Thị Thương',
        role: activeTeacher.role || 'Giáo viên Tổ Ngoại ngữ',
        stars: activeTeacher.stars || 89
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-linear-to-r from-teal-50 via-sky-50 to-indigo-50">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Tài Liệu & Chứng Nhận TH Lê Kim Lăng
            </div>
            <h3 className="text-base font-black text-slate-800">
              In & Tải Giấy Chứng Nhận / Flashcard Lớp Học
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPNG}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-60"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Đang tạo ảnh...' : 'Tải ảnh PNG'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In (Print / PDF)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs for formats */}
        <div className="no-print px-6 py-3 bg-slate-50 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setPrintLayout('certificate')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              printLayout === 'certificate'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            ★ Giấy Chứng Nhận Khen Thưởng
          </button>
          <button
            onClick={() => setPrintLayout('flashcards')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              printLayout === 'flashcards'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            Bộ Thẻ Flashcard Khổ Cắt (10 Thẻ)
          </button>
          <button
            onClick={() => setPrintLayout('poster')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              printLayout === 'poster'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            Bảng Poster Dán Tường Lớp Học
          </button>
          <button
            onClick={() => setPrintLayout('chants')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              printLayout === 'chants'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            Tờ Bài Vè Đồng Dao Cả Lớp
          </button>
          <button
            onClick={() => setPrintLayout('worksheet')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              printLayout === 'worksheet'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            📝 Phiếu Bài Tập Học Sinh (File Word)
          </button>
        </div>

        {/* Printable Preview Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6 bg-white">
          {downloadSuccess && (
            <div className="no-print p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Đã tải thành công file ảnh chứng nhận về máy!</span>
            </div>
          )}

          {/* TAB 1: CERTIFICATE */}
          {printLayout === 'certificate' && (
            <div className="border-4 border-double border-amber-500 p-8 rounded-3xl bg-linear-to-b from-amber-50/40 via-white to-amber-50/20 text-center space-y-6 max-w-2xl mx-auto shadow-sm">
              <div className="flex items-center justify-center gap-3">
                <SchoolLogo size={48} className="w-12 h-12" />
                <div className="text-left">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    ỦY BAN NHÂN DÂN PHƯỜNG HÒA XUÂN
                  </div>
                  <div className="text-base font-black uppercase text-teal-800">
                    TRƯỜNG TIỂU HỌC LÊ KIM LĂNG
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs uppercase font-extrabold text-amber-700 tracking-widest">
                  ★ CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM ★
                </div>
                <h1 className="text-3xl font-black text-rose-900 tracking-tight mt-2">
                  GIẤY CHỨNG NHẬN
                </h1>
                <div className="text-xs font-bold text-teal-700 uppercase">
                  Hoàn thành chương trình Tiếng Anh Giao Tiếp Lớp Học Tháng 11
                </div>
              </div>

              <div className="py-2 space-y-2">
                <div className="text-xs text-slate-500">Trân trọng trao tặng cho Thầy/Cô:</div>
                <div className="text-3xl font-black text-slate-900 underline decoration-amber-400 decoration-2 underline-offset-8">
                  {activeTeacher.name || 'Cô Nguyễn Thị Thương'}
                </div>
                <div className="text-xs font-bold text-teal-700 mt-3">
                  Đơn vị: {activeTeacher.role || 'Giáo viên Tổ Ngoại ngữ'} · Trường TH Lê Kim Lăng
                </div>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed pt-2">
                  Đã hoàn thành xuất sắc đợt rèn luyện 10 câu khẩu lệnh tiếng Anh chuẩn quốc tế và phương pháp vận động trực quan TPR trong lớp học.
                </p>
                <div className="inline-block bg-amber-100 text-amber-900 font-extrabold text-xs px-3 py-1 rounded-full">
                  Thành tích: ⭐ {activeTeacher.stars || 89} Sao Thi Đua Xuất Sắc
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs">
                <div className="text-center space-y-1">
                  <div className="font-bold text-slate-800">TỔ TRƯỞNG CHUYÊN MÔN</div>
                  <div className="text-[10px] text-slate-400 italic">(Ký và ghi rõ họ tên)</div>
                  <div className="h-10"></div>
                  <div className="font-bold text-teal-700">Tổ Ngoại Ngữ</div>
                </div>

                <div className="text-center space-y-1">
                  <div className="text-slate-500 italic">Đà Nẵng, tháng 11 năm 2026</div>
                  <div className="font-bold text-slate-800">HIỆU TRƯỞNG</div>
                  <div className="text-[10px] text-slate-400 italic">(Ký tên và đóng dấu)</div>
                  <div className="h-10"></div>
                  <div className="font-bold text-rose-800">TRƯỜNG TH LÊ KIM LĂNG</div>
                </div>
              </div>

              {/* Direct download CTA in tab */}
              <div className="no-print pt-4 border-t border-amber-200 flex items-center justify-center gap-3">
                <button
                  onClick={handleDownloadPNG}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloading ? 'Đang tạo ảnh...' : 'Tải Giấy Chứng Nhận Này Về Máy (PNG)'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: FLASHCARDS */}
          {printLayout === 'flashcards' && (
            <div className="space-y-6">
              <div className="border-b-2 border-teal-800 pb-3 text-center">
                <h2 className="text-lg font-black text-slate-900 uppercase">
                  BỘ THẺ FLASHCARD 10 CÂU KHẨU LỆNH TIẾNG ANH · THÁNG 11
                </h2>
                <div className="text-xs text-slate-500">Cắt theo đường nét đứt để dán góc học tập</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {CLASSROOM_PHRASES.map((phrase) => (
                  <div
                    key={phrase.id}
                    className="page-break-inside-avoid border-2 border-dashed border-slate-400 p-5 rounded-2xl flex flex-col justify-between bg-white relative space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold text-slate-500 uppercase">
                        TH Lê Kim Lăng · Thẻ #{phrase.id}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700">
                        {phrase.category}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-2xl font-black text-slate-900">
                        {phrase.english}
                      </h3>
                      <div className="text-xs font-mono text-teal-700 font-semibold mt-0.5">
                        {phrase.phonetic}
                      </div>
                      <div className="text-sm font-bold text-slate-800 mt-2">
                        {phrase.vietnamese}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 space-y-1">
                      <div>
                        <span className="font-bold text-slate-800">Cử chỉ TPR:</span> {phrase.tprGesture}
                      </div>
                      <div>
                        <span className="font-bold text-teal-800">Đồng dao:</span> "{phrase.chant}"
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: POSTER */}
          {printLayout === 'poster' && (
            <div className="border border-slate-300 rounded-2xl p-6 bg-slate-50/50 space-y-4">
              <div className="text-center border-b border-slate-200 pb-3">
                <h2 className="text-lg font-black text-slate-900 uppercase">
                  BẢNG POSTER DÁN TƯỜNG LỚP HỌC · THÁNG 11
                </h2>
                <div className="text-xs text-slate-500">Trường Tiểu học Lê Kim Lăng - Hòa Xuân, Đà Nẵng</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CLASSROOM_PHRASES.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-start gap-3"
                  >
                    <span className="w-7 h-7 rounded-lg bg-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {p.id}
                    </span>
                    <div>
                      <div className="text-base font-extrabold text-slate-900 leading-snug">
                        {p.english}
                      </div>
                      <div className="text-[11px] font-mono text-teal-700">
                        {p.phonetic}
                      </div>
                      <div className="text-xs font-semibold text-slate-600 mt-0.5">
                        {p.vietnamese}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CHANTS */}
          {printLayout === 'chants' && (
            <div className="border border-slate-300 rounded-2xl p-6 bg-amber-50/30 space-y-4">
              <div className="text-sm font-bold text-amber-900 uppercase text-center border-b border-amber-200 pb-2">
                TẬP THƠ VÈ ĐỒNG DAO VẦN ĐIỆU 10 CÂU KHẨU LỆNH (VỖ TAY ĐỒNG THANH)
              </div>
              <div className="space-y-3">
                {CLASSROOM_PHRASES.map((p) => (
                  <div key={p.id} className="p-3 bg-white rounded-xl border border-amber-200/80">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-800">#{p.id}.</span>
                      <span className="text-xs font-bold text-slate-900">{p.english}</span>
                      <span className="text-xs text-slate-500 font-medium">({p.vietnamese})</span>
                    </div>
                    <div className="text-sm font-bold italic text-teal-900 mt-1 pl-4 border-l-2 border-teal-500">
                      "{p.chant}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: WORKSHEET & WORD DOWNLOAD */}
          {printLayout === 'worksheet' && (
            <div className="border border-slate-300 rounded-2xl p-6 bg-white space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-base font-black text-slate-900 uppercase">
                    PHIẾU BÀI TẬP ÔN LUYỆN 10 CÂU TIẾNG ANH LỚP HỌC THÁNG 11
                  </h2>
                  <p className="text-xs text-slate-500">
                    Dành cho Giáo viên in phát cho học sinh hoặc tải về định dạng Microsoft Word (.doc)
                  </p>
                </div>

                <button
                  onClick={exportWorksheetToWord}
                  className="no-print inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Tải Phiếu Bài Tập Word (.doc)</span>
                </button>
              </div>

              <div className="text-xs text-slate-700 space-y-4">
                <div className="flex items-center justify-between font-semibold border-b border-dashed border-slate-300 pb-2">
                  <span>Họ và tên học sinh: .....................................................................</span>
                  <span>Lớp: .................</span>
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-teal-900 uppercase">
                    Bài 1: Điền từ thích hợp vào chỗ trống để hoàn thành 10 câu khẩu lệnh tháng 11
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { q: '1. Be ................. to everyone!', hint: 'Hãy đối xử tốt với mọi người!' },
                      { q: '2. Listen ........................!', hint: 'Hãy lắng nghe thật chăm chú!' },
                      { q: '3. ................. each other!', hint: 'Hãy giúp đỡ lẫn nhau!' },
                      { q: '4. Never ................. up!', hint: 'Đừng bao giờ bỏ cuộc!' },
                      { q: '5. Do your .................!', hint: 'Hãy cố gắng hết sức mình!' },
                      { q: '6. Speak ........................!', hint: 'Hãy nói bằng Tiếng Anh nào!' },
                      { q: '7. Keep your ................. clean!', hint: 'Hãy giữ lớp học sạch đẹp!' },
                      { q: '8. Line up ........................!', hint: 'Hãy xếp hàng ngay ngắn!' },
                      { q: '9. Raise your ................. to speak!', hint: 'Hãy giơ tay phát biểu!' },
                      { q: '10. Work ................. happily!', hint: 'Hãy cùng làm việc vui vẻ!' }
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="font-bold text-slate-900">{item.q}</div>
                        <div className="text-[11px] text-slate-500 italic mt-0.5">({item.hint})</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
