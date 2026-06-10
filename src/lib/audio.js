let audioContext = null;

export async function playSelectionSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    return;
  }

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  const now = audioContext.currentTime;
  const master = audioContext.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.connect(audioContext.destination);

  const filter = audioContext.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(900, now);
  filter.Q.value = 0.7;

  const toneGain = audioContext.createGain();
  toneGain.gain.setValueAtTime(0.0001, now);
  toneGain.gain.exponentialRampToValueAtTime(0.05, now + 0.03);
  toneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);

  const primary = audioContext.createOscillator();
  primary.type = "sine";
  primary.frequency.setValueAtTime(118, now);
  primary.frequency.exponentialRampToValueAtTime(92, now + 0.25);

  const harmonic = audioContext.createOscillator();
  harmonic.type = "triangle";
  harmonic.frequency.setValueAtTime(176, now);
  harmonic.frequency.exponentialRampToValueAtTime(132, now + 0.27);

  const transient = audioContext.createOscillator();
  transient.type = "sine";
  transient.frequency.setValueAtTime(52, now);
  transient.frequency.exponentialRampToValueAtTime(41, now + 0.16);

  const transientGain = audioContext.createGain();
  transientGain.gain.setValueAtTime(0.0001, now);
  transientGain.gain.exponentialRampToValueAtTime(0.014, now + 0.02);
  transientGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

  primary.connect(filter);
  harmonic.connect(filter);
  filter.connect(toneGain);
  toneGain.connect(master);

  transient.connect(transientGain);
  transientGain.connect(master);

  primary.start(now);
  harmonic.start(now + 0.01);
  transient.start(now);
  primary.stop(now + 0.5);
  harmonic.stop(now + 0.5);
  transient.stop(now + 0.2);

  master.gain.exponentialRampToValueAtTime(1.0, now + 0.02);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
}
