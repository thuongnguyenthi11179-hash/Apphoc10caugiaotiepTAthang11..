// High-resolution Certificate Image Generator for TH Le Kim Lang

export interface CertificateInfo {
  teacherName: string;
  role: string;
  stars: number;
}

export function generateAndDownloadCertificate(info: CertificateInfo): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1600;
      canvas.height = 1130;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas 2D context not supported');
      }

      // 1. Background Parchment
      const bgGradient = ctx.createLinearGradient(0, 0, 1600, 1130);
      bgGradient.addColorStop(0, '#FFFDF7');
      bgGradient.addColorStop(0.5, '#FFF9ED');
      bgGradient.addColorStop(1, '#FFF5E0');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, 1600, 1130);

      // 2. Ornate Border
      ctx.strokeStyle = '#B45309'; // Warm Amber/Gold
      ctx.lineWidth = 14;
      ctx.strokeRect(35, 35, 1530, 1060);

      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 3;
      ctx.strokeRect(55, 55, 1490, 1020);

      ctx.strokeStyle = '#0D9488'; // Teal
      ctx.lineWidth = 1.5;
      ctx.strokeRect(65, 65, 1470, 1000);

      // Corner Ornaments
      const drawCorner = (x: number, y: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = '#D97706';
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };
      drawCorner(75, 75);
      drawCorner(1525, 75);
      drawCorner(75, 1055);
      drawCorner(1525, 1055);

      // 3. Header Text
      ctx.textAlign = 'center';
      ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText('ỦY BAN NHÂN DÂN PHƯỜNG HÒA XUÂN', 800, 140);

      ctx.font = '900 36px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#0F766E'; // Teal
      ctx.fillText('TRƯỜNG TIỂU HỌC LÊ KIM LĂNG', 800, 190);

      // Sub-line
      ctx.strokeStyle = '#0F766E';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(600, 215);
      ctx.lineTo(1000, 215);
      ctx.stroke();

      // 4. Main Certificate Title
      ctx.font = '900 64px "Plus Jakarta Sans", serif';
      ctx.fillStyle = '#991B1B'; // Deep Red / Burgundy
      ctx.fillText('GIẤY CHỨNG NHẬN', 800, 310);

      ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#D97706';
      ctx.fillText('★ CHỨNG NHẬN HOÀN THÀNH XUẤT SẮC PHONG TRÀO THÁNG 11 ★', 800, 360);

      // 5. Recipient Section
      ctx.font = 'normal 26px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText('Chứng nhận Thầy/Cô:', 800, 440);

      // Teacher Name (Highlighted)
      ctx.font = '900 52px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#0F172A';
      const name = info.teacherName || 'Cô Nguyễn Thị Thương';
      ctx.fillText(name, 800, 515);

      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(400, 540);
      ctx.lineTo(1200, 540);
      ctx.stroke();

      ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#0F766E';
      ctx.fillText(`Đơn vị: ${info.role || 'Giáo viên Tổ Ngoại ngữ'} · Trường TH Lê Kim Lăng`, 800, 580);

      // 6. Citation Text
      ctx.font = 'normal 26px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText('Đã tích cực tham gia và hoàn thành xuất sắc chương trình:', 800, 650);

      ctx.font = '800 34px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#1E3A8A'; // Navy
      ctx.fillText('“10 CÂU TIẾNG ANH GIAO TIẾP TRONG LỚP HỌC”', 800, 700);

      ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#D97706';
      ctx.fillText(`Chuẩn hóa phát âm quốc tế · Đạt thành tích xuất sắc: ⭐ ${info.stars || 89} Sao Thi Đua`, 800, 750);

      // 7. Mottos / 10 phrases highlights
      ctx.font = 'italic 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText('“Be kind to everyone · Listen carefully · Help each other · Never give up · Do your best”', 800, 810);
      ctx.fillText('“Speak English · Keep classroom clean · Line up quietly · Raise your hands · Work together happily”', 800, 840);

      // 8. Date and Signatures
      const date = new Date();
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();

      // Left: Team Lead
      ctx.textAlign = 'center';
      ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#1E293B';
      ctx.fillText('TỔ TRƯỞNG CHUYÊN MÔN', 360, 930);
      ctx.font = 'italic 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText('(Ký và ghi rõ họ tên)', 360, 960);
      ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#0F766E';
      ctx.fillText('Tổ Ngoại Ngữ', 360, 1040);

      // Right: School Principal
      ctx.textAlign = 'center';
      ctx.font = 'italic 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText(`Đà Nẵng, ngày ${day} tháng ${month} năm ${year}`, 1240, 900);

      ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#1E293B';
      ctx.fillText('HIỆU TRƯỞNG', 1240, 930);
      ctx.font = 'italic 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText('(Ký tên và đóng dấu)', 1240, 960);
      ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#991B1B';
      ctx.fillText('TRƯỜNG TH LÊ KIM LĂNG', 1240, 1040);

      // 9. Convert to Blob & Download
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Failed to generate image blob');
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const cleanName = (info.teacherName || 'Giao_Vien')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-zA-Z0-9]/g, '_');
        a.download = `Giay_Chung_Nhan_Tieng_Anh_TH_Le_Kim_Lang_${cleanName}.png`;
        a.href = url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        resolve();
      }, 'image/png');
    } catch (err) {
      console.error('Certificate generation error:', err);
      reject(err);
    }
  });
}
