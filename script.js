const root = document.documentElement;
const sequence = document.querySelector('.fridge-scroll');
const video = document.querySelector('#door-video');
const buildSequence = document.querySelector('.build-scroll');
const buildVideo = document.querySelector('#build-video');
const portfolioSequence = document.querySelector('.portfolio-scroll');
const portfolioVideo = document.querySelector('#portfolio-video');
const portfolioStage = document.querySelector('.portfolio-stage');
const portfolioWords = [...document.querySelectorAll('.portfolio-word')];
const year = document.querySelector('#year');

let scheduled = false;
let lastTime = -1;
let buildScheduled = false;
let buildLastTime = -1;
let revealedCharacters = 0;
let portfolioScheduled = false;

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);

const scrollCharacters = [];
document.querySelectorAll('[data-scroll-text]').forEach((element) => {
  const text = element.textContent;
  element.textContent = '';

  text.split(/(\s+)/).forEach((fragment) => {
    if (/^\s+$/.test(fragment)) {
      element.append(document.createTextNode(' '));
      return;
    }

    const word = document.createElement('span');
    word.className = 'build-word';

    [...fragment].forEach((character) => {
      const letter = document.createElement('span');
      letter.className = 'build-char';
      letter.textContent = character;
      word.append(letter);
      scrollCharacters.push(letter);
    });

    element.append(word);
  });
});

function updateSequence() {
  const range = Math.max(sequence.offsetHeight, 1);
  const rawProgress = (window.scrollY - sequence.offsetTop) / range;
  const progress = clamp(rawProgress);
  const opening = clamp(progress / 0.78);
  const copy = clamp((progress - 0.8) / 0.16);
  const whiteFade = clamp((progress - 0.55) / 0.45);

  root.style.setProperty('--progress', opening.toFixed(3));
  root.style.setProperty('--copy', copy.toFixed(3));
  root.style.setProperty('--white-fade', whiteFade.toFixed(3));
  document.body.classList.toggle('has-left-fridge', rawProgress >= 1);

  if (Number.isFinite(video.duration) && video.duration > 0 && video.readyState >= 2) {
    const endFrame = Math.min(video.duration - 0.08, 6.5);
    const targetTime = Math.round(opening * endFrame * 24) / 24;

    if (targetTime !== lastTime) {
      video.currentTime = targetTime;
      lastTime = targetTime;
    }
  }

  scheduled = false;
}

function requestSequenceUpdate() {
  if (!scheduled) {
    scheduled = true;
    window.requestAnimationFrame(updateSequence);
  }
}

function updateBuildSequence() {
  const range = Math.max(buildSequence.offsetHeight - window.innerHeight, 1);
  const progress = clamp((window.scrollY - buildSequence.offsetTop) / range);
  const textProgress = clamp(progress / 0.72);
  const targetCharacter = Math.round(textProgress * scrollCharacters.length);

  while (revealedCharacters < targetCharacter) {
    scrollCharacters[revealedCharacters].classList.add('is-revealed');
    revealedCharacters += 1;
  }

  while (revealedCharacters > targetCharacter) {
    revealedCharacters -= 1;
    scrollCharacters[revealedCharacters].classList.remove('is-revealed');
  }

  if (Number.isFinite(buildVideo.duration) && buildVideo.duration > 0 && buildVideo.readyState >= 2) {
    const endFrame = Math.min(buildVideo.duration - 0.08, 6.6);
    const targetTime = Math.round(progress * endFrame * 24) / 24;

    if (targetTime !== buildLastTime) {
      buildVideo.currentTime = targetTime;
      buildLastTime = targetTime;
    }
  }

  buildScheduled = false;
}

function requestBuildUpdate() {
  if (!buildScheduled) {
    buildScheduled = true;
    window.requestAnimationFrame(updateBuildSequence);
  }
}

function updatePortfolioSequence() {
  const range = Math.max(portfolioSequence.offsetHeight - window.innerHeight, 1);
  const progress = clamp((window.scrollY - portfolioSequence.offsetTop) / range);

  portfolioStage.style.setProperty('--portfolio-video-x', `${-20 + (progress * 40)}vw`);
  portfolioStage.style.setProperty('--portfolio-video-y', `${-22 + (progress * 44)}vh`);
  portfolioStage.style.setProperty('--portfolio-video-rotation', `${-5 + (progress * 10)}deg`);

  portfolioWords.forEach((word, index) => {
    const wordProgress = clamp((progress - (index * 0.125)) / 0.19);
    word.style.setProperty('--portfolio-word-opacity', wordProgress.toFixed(3));
    word.style.setProperty('--portfolio-word-blur', `${((1 - wordProgress) * 10).toFixed(2)}px`);
    word.style.setProperty('--portfolio-word-y', `${((1 - wordProgress) * 22).toFixed(2)}px`);
  });

  if (Number.isFinite(portfolioVideo.duration) && portfolioVideo.duration > 0 && portfolioVideo.readyState >= 2) {
    const endFrame = Math.min(portfolioVideo.duration - 0.08, 8);
    const targetTime = Math.round(progress * endFrame * 24) / 24;

    if (Math.abs(portfolioVideo.currentTime - targetTime) > 0.02) {
      portfolioVideo.currentTime = targetTime;
    }
  }

  portfolioScheduled = false;
}

function requestPortfolioUpdate() {
  if (!portfolioScheduled) {
    portfolioScheduled = true;
    window.requestAnimationFrame(updatePortfolioSequence);
  }
}

function prepareSequenceVideo() {
  video.pause();
  requestSequenceUpdate();
}

function prepareBuildVideo() {
  buildVideo.pause();
  requestBuildUpdate();
}

function preparePortfolioVideo() {
  portfolioVideo.pause();
  requestPortfolioUpdate();
}

video.addEventListener('loadedmetadata', prepareSequenceVideo, { once: true });
video.addEventListener('loadeddata', prepareSequenceVideo, { once: true });
buildVideo.addEventListener('loadedmetadata', prepareBuildVideo, { once: true });
buildVideo.addEventListener('loadeddata', prepareBuildVideo, { once: true });
portfolioVideo.addEventListener('loadedmetadata', preparePortfolioVideo, { once: true });
portfolioVideo.addEventListener('loadeddata', preparePortfolioVideo, { once: true });
prepareSequenceVideo();
prepareBuildVideo();
preparePortfolioVideo();

window.addEventListener('scroll', requestSequenceUpdate, { passive: true });
window.addEventListener('scroll', requestBuildUpdate, { passive: true });
window.addEventListener('scroll', requestPortfolioUpdate, { passive: true });
window.addEventListener('resize', requestSequenceUpdate);
window.addEventListener('resize', requestBuildUpdate);
window.addEventListener('resize', requestPortfolioUpdate);
requestSequenceUpdate();
requestBuildUpdate();
requestPortfolioUpdate();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const serviceCards = [...document.querySelectorAll('[data-service-image]')];
let serviceImageScheduled = false;

function updateServiceImageReveal() {
  const viewportHeight = window.innerHeight;

  serviceCards.forEach((card) => {
    const top = card.getBoundingClientRect().top;
    const reveal = clamp(((viewportHeight * 0.8) - top) / (viewportHeight * 0.55));

    card.style.setProperty('--service-image-opacity', (0.34 + (reveal * 0.66)).toFixed(3));
    card.style.setProperty('--service-image-wash', (0.42 * (1 - reveal)).toFixed(3));
    card.style.setProperty('--service-image-brightness', (0.62 + (reveal * 0.38)).toFixed(3));
    card.style.setProperty('--service-image-grayscale', (0.5 * (1 - reveal)).toFixed(3));
    card.style.setProperty('--service-image-blur', `${(1.4 * (1 - reveal)).toFixed(2)}px`);
    card.style.setProperty('--service-image-scale', (1.045 - (reveal * 0.045)).toFixed(3));
  });

  serviceImageScheduled = false;
}

function requestServiceImageReveal() {
  if (!serviceImageScheduled) {
    serviceImageScheduled = true;
    window.requestAnimationFrame(updateServiceImageReveal);
  }
}

window.addEventListener('scroll', requestServiceImageReveal, { passive: true });
window.addEventListener('resize', requestServiceImageReveal);
requestServiceImageReveal();
year.textContent = new Date().getFullYear();
