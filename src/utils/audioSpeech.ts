// Speech utility with native Web Speech API and voice selection

export interface SpeakOptions {
  rate?: number; // 0.8 for slow educational mode, 1.0 for normal
  pitch?: number;
  voiceGender?: 'female' | 'male' | 'any';
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

let preferredVoice: SpeechSynthesisVoice | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let activeAudio: HTMLAudioElement | null = null;
let speechRequestId = 0;

export function getEnglishVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  const voices = window.speechSynthesis.getVoices();
  return voices.filter(v => v.lang.replace('_', '-').toLowerCase().startsWith('en'));
}

export function pickBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  // Prefer natural high-quality en-US or en-GB voices
  const preferredNames = [
    'Google US English',
    'Samantha',
    'Victoria',
    'Karen',
    'Daniel',
    'Oliver',
    'Serena',
    'en-US-Standard',
    'Microsoft Zira',
    'Microsoft Jenny'
  ];

  for (const name of preferredNames) {
    const found = voices.find(v => v.name.includes(name));
    if (found) return found;
  }

  // Fallback to any en-US voice (handling both en-US and en_US)
  const usVoice = voices.find(v => v.lang.replace('_', '-').toLowerCase() === 'en-us');
  if (usVoice) return usVoice;

  // Fallback to any en voice
  return voices[0] || null;
}

function cleanupActiveSpeech() {
  if (activeUtterance) {
    activeUtterance.onstart = null;
    activeUtterance.onend = null;
    activeUtterance.onerror = null;
    activeUtterance = null;
  }
  if (activeAudio) {
    try {
      activeAudio.onplay = null;
      activeAudio.onended = null;
      activeAudio.onerror = null;
      activeAudio.pause();
      activeAudio.src = '';
    } catch {}
    activeAudio = null;
  }
}

function playFallbackAudio(
  text: string,
  rate: number,
  requestId: number,
  options: SpeakOptions,
  resolve: () => void
) {
  if (requestId !== speechRequestId) {
    resolve();
    return;
  }
  try {
    const encoded = encodeURIComponent(text);
    const ttsspeed = rate <= 0.75 ? '0.24' : '1';
    const url = `https://translate.googleapis.com/translate_tts?client=tw-ob&ie=UTF-8&tl=en&ttsspeed=${ttsspeed}&q=${encoded}`;
    const audio = new Audio(url);
    activeAudio = audio;
    audio.playbackRate = rate <= 0.75 ? 0.75 : rate;

    audio.onplay = () => {
      if (requestId === speechRequestId) {
        options.onStart?.();
      }
    };
    audio.onended = () => {
      if (requestId === speechRequestId) {
        activeAudio = null;
        options.onEnd?.();
      }
      resolve();
    };
    audio.onerror = (err) => {
      if (requestId === speechRequestId) {
        activeAudio = null;
        options.onError?.(err);
      }
      resolve();
    };

    audio.play().catch((err) => {
      if (requestId === speechRequestId) {
        activeAudio = null;
        options.onError?.(err);
      }
      resolve();
    });
  } catch (err) {
    options.onError?.(err);
    resolve();
  }
}

export function playEnglishSpeech(text: string, options: SpeakOptions = {}): Promise<void> {
  const requestId = ++speechRequestId;
  const targetRate = options.rate ?? 0.9;
  const isSlowMode = targetRate <= 0.75;
  // Use 0.6 for Web Speech API when 0.75x slow mode is requested so mobile/desktop TTS engines clearly slow down
  const effectiveUtteranceRate = isSlowMode ? 0.6 : targetRate;

  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }

    // Detach previous callbacks before cancelling so old onError/onEnd never overwrite new state
    const wasSpeaking =
      typeof window.speechSynthesis !== 'undefined' &&
      (window.speechSynthesis.speaking || window.speechSynthesis.pending);

    cleanupActiveSpeech();

    if (!window.speechSynthesis) {
      playFallbackAudio(text, targetRate, requestId, options, resolve);
      return;
    }

    try {
      window.speechSynthesis.cancel();
    } catch {}

    const startUtterance = () => {
      if (requestId !== speechRequestId) {
        resolve();
        return;
      }

      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        activeUtterance = utterance;
        utterance.lang = options.lang || 'en-US';
        utterance.rate = effectiveUtteranceRate;
        utterance.pitch = options.pitch ?? 1.0;

        const isAndroid = /Android/i.test(navigator.userAgent || '');
        if (!isAndroid) {
          const voices = getEnglishVoices();
          if (!preferredVoice && voices.length) {
            preferredVoice = pickBestVoice(voices);
          }
          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }
        }

        let hasStarted = false;
        let hasFinished = false;

        // Watchdog timer in case mobile WebView/browser silently ignores speechSynthesis.speak()
        const startTimeout = setTimeout(() => {
          if (!hasStarted && !hasFinished && requestId === speechRequestId) {
            hasFinished = true;
            try {
              window.speechSynthesis.cancel();
            } catch {}
            playFallbackAudio(text, targetRate, requestId, options, resolve);
          }
        }, 900);

        utterance.onstart = () => {
          hasStarted = true;
          clearTimeout(startTimeout);
          if (requestId === speechRequestId) {
            options.onStart?.();
          }
        };

        utterance.onend = () => {
          hasFinished = true;
          clearTimeout(startTimeout);
          if (requestId === speechRequestId) {
            activeUtterance = null;
            options.onEnd?.();
          }
          resolve();
        };

        utterance.onerror = (e: any) => {
          hasFinished = true;
          clearTimeout(startTimeout);
          if (requestId !== speechRequestId) {
            resolve();
            return;
          }
          const errType = e?.error || '';
          if (errType === 'canceled' || errType === 'interrupted') {
            activeUtterance = null;
            options.onEnd?.();
            resolve();
            return;
          }
          // Fallback to HTML5 audio if Web Speech API fails
          playFallbackAudio(text, targetRate, requestId, options, resolve);
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('Speech error', err);
        playFallbackAudio(text, targetRate, requestId, options, resolve);
      }
    };

    // Delay slightly after cancel() on Chrome/Android so the OS TTS engine doesn't cancel the new utterance
    if (wasSpeaking) {
      setTimeout(startUtterance, 65);
    } else {
      startUtterance();
    }
  });
}

export function stopSpeech(): void {
  speechRequestId++;
  cleanupActiveSpeech();
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

// Calculate similarity between spoken text and target text
export function calculateTextMatchScore(spoken: string, target: string): number {
  const cleanSpoken = spoken.toLowerCase().replace(/[^\w\s]/g, '').trim();
  const cleanTarget = target.toLowerCase().replace(/[^\w\s]/g, '').trim();

  if (!cleanSpoken || !cleanTarget) return 0;
  if (cleanSpoken === cleanTarget) return 100;

  const spokenWords = cleanSpoken.split(/\s+/);
  const targetWords = cleanTarget.split(/\s+/);

  let matches = 0;
  for (const w of spokenWords) {
    if (targetWords.includes(w)) {
      matches++;
    }
  }

  const score = Math.round((matches / Math.max(targetWords.length, spokenWords.length)) * 100);
  return Math.min(100, Math.max(20, score));
}
