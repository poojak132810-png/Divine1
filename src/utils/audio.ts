// src/utils/audio.ts

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(frequency: number, duration: number, volume = 0.15) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (err) {
    console.warn("Audio playback failed:", err);
  }
}

// A soft, bell-like chime (used for notifications / AI assistant)
export function playChime() {
  playTone(880, 0.4);
  setTimeout(() => playTone(1108, 0.35), 120);
}

// A deeper temple-bell sound (used for bookings / donations confirmations)
export function playTempleBell() {
  playTone(220, 0.6, 0.2);
  setTimeout(() => playTone(440, 0.5, 0.15), 80);
}