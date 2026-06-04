/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Synthesizes a beautiful golden crystal chime/coin sound using the standard Web Audio API.
 * This completely avoids external file dependencies while producing a premium, rich chime.
 */
export function playChimeSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();

    // Check if context is suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    const playTone = (
      frequency: number,
      startDelay: number,
      duration: number,
      type: OscillatorType = 'sine',
      volumeValue: number = 0.2
    ) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, now + startDelay);

      // Apply a sweet volume envelope with rapid rise and smooth exponential decay
      gainNode.gain.setValueAtTime(0, now + startDelay);
      gainNode.gain.linearRampToValueAtTime(volumeValue, now + startDelay + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + startDelay + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + startDelay);
      osc.stop(now + startDelay + duration);
    };

    // A beautiful 3-note ascending luxury crystal arpeggio (B5 -> E6 -> B6) with metallic resonance
    playTone(987.77, 0, 0.45, 'triangle', 0.12);
    playTone(1318.51, 0.06, 0.7, 'sine', 0.18);
    playTone(1975.53, 0.12, 0.6, 'sine', 0.08);
  } catch (err) {
    console.warn('Polyfill synthesized chime failed to trigger:', err);
  }
}
