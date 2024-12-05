export const attackAudio = (audioPath) => {
  const audio = new Audio(audioPath);
  audio.loop = false;
  audio.volume = 0.4;
  audio.crossOrigin = "anonymous";
  audio.load();
  try {
    audio.play();
  } catch (err) {
    console.log(err);
  }
};

export const puzzleAudio = (audioPath) => {
  const audio = new Audio(audioPath);
  audio.loop = false;
  audio.volume = 0.5;
  audio.crossOrigin = "anonymous";
  audio.load();
  try {
    audio.play();
  } catch (err) {
    console.log(err);
  }
};

export const backgroundAudio = (audioPath) => {
  const audio = new Audio(audioPath);
  audio.loop = true;
  audio.volume = 0.4;
  audio.crossOrigin = "anonymous";
  return audio;
}

export const resultAudio = (audioPath) => {
  const audio = new Audio(audioPath);
  audio.loop = false;
  audio.volume = 0.2;
  audio.crossOrigin = "anonymous";
  audio.load();
  try {
    audio.play();
  } catch (err) {
    console.log(err);
  }
};