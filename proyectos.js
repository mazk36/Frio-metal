const projectsHero = document.querySelector('.projects-intro');
const projectsTitle = document.querySelector('.projects-title');
const projectsTitleLetters = [...document.querySelectorAll('.projects-title-letter')];
const projectsBackButton = document.querySelector('.projects-back-button');
const projectsGrid = document.querySelector('.projects-grid');
const projectCards = [...document.querySelectorAll('.project-card')];
const precisePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
// La experiencia de proyectos fue diseñada alrededor de estas transiciones.
// Se mantiene activa aunque el navegador solicite reducir movimiento.
const reducedMotion = { matches: false };

if (projectsHero && projectsTitle) {
  let fadeScheduled = false;
  let replayArmed = false;
  let replayFrame = 0;
  let replayAnimationFrame = 0;
  let replayVariant = 'b';

  projectsTitleLetters.forEach((letter, index) => {
    letter.style.setProperty('--letter-delay', `${index * 45}ms`);
  });

  const replayTitle = () => {
    window.cancelAnimationFrame(replayFrame);
    window.cancelAnimationFrame(replayAnimationFrame);
    projectsTitle.classList.add('is-resetting');
    projectsTitle.classList.remove('is-building-a', 'is-building-b');
    projectsTitle.classList.remove('is-faded');
    projectsBackButton?.classList.remove('is-visible', 'is-faded');
    replayVariant = replayVariant === 'a' ? 'b' : 'a';

    if (reducedMotion.matches) {
      projectsTitle.classList.remove('is-resetting');
      projectsTitle.classList.add(`is-building-${replayVariant}`);
      projectsBackButton?.classList.add('is-visible');
      return;
    }

    replayFrame = window.requestAnimationFrame(() => {
      projectsTitle.classList.remove('is-resetting');

      replayAnimationFrame = window.requestAnimationFrame(() => {
        projectsTitle.classList.add(`is-building-${replayVariant}`);
        projectsBackButton?.classList.add('is-visible');
      });
    });
  };

  replayTitle();

  const updateTitleFade = () => {
    const heroRect = projectsHero.getBoundingClientRect();
    const fadeDistance = Math.min(Math.max(window.innerHeight * 0.22, 160), 260);
    const fadeProgress = Math.min(Math.max(-heroRect.top / fadeDistance, 0), 1);

    projectsTitle.style.setProperty('--hero-fade', fadeProgress.toFixed(3));
    projectsTitle.style.setProperty('--hero-shift', `${(-fadeProgress * 28).toFixed(2)}px`);
    projectsTitle.style.setProperty('--hero-scale', (1 - fadeProgress * 0.02).toFixed(3));

    if (projectsBackButton) {
      projectsBackButton.style.setProperty('--back-fade', fadeProgress.toFixed(3));
      projectsBackButton.style.setProperty('--back-scroll-shift', `${(-fadeProgress * 18).toFixed(2)}px`);
      projectsBackButton.classList.toggle('is-faded', fadeProgress >= 1 && !reducedMotion.matches);
    }

    if (reducedMotion.matches) {
      projectsTitle.classList.remove('is-faded');
      replayArmed = false;
    } else if (fadeProgress >= 1) {
      projectsTitle.classList.add('is-faded');
      replayArmed = true;
    } else if (fadeProgress <= 0.08 && replayArmed) {
      replayTitle();
      replayArmed = false;
    }

    fadeScheduled = false;
  };

  const requestTitleFadeUpdate = () => {
    if (!fadeScheduled) {
      fadeScheduled = true;
      window.requestAnimationFrame(updateTitleFade);
    }
  };

  window.addEventListener('scroll', requestTitleFadeUpdate, { passive: true });
  window.addEventListener('resize', requestTitleFadeUpdate);
  requestTitleFadeUpdate();
}

if (projectsBackButton) {
  projectsBackButton.addEventListener('click', () => {
    let hasSafeHistory = false;

    if (window.history.length > 1 && document.referrer) {
      try {
        hasSafeHistory = new URL(document.referrer).origin === window.location.origin;
      } catch {
        hasSafeHistory = false;
      }
    }

    if (hasSafeHistory) {
      window.history.back();
    } else {
      window.location.assign('./index.html');
    }
  });
}

if (projectsGrid) {
  if ('IntersectionObserver' in window) {
    const gridObserver = new IntersectionObserver(
      ([entry]) => {
        projectsGrid.classList.toggle('is-visible', entry.isIntersecting);
      },
      {
        threshold: 0.01,
        rootMargin: '0px 0px -8% 0px',
      },
    );

    gridObserver.observe(projectsGrid);
  } else {
    projectsGrid.classList.add('is-visible');
  }
}

function setCardState(card, isFlipped) {
  card.classList.toggle('is-flipped', isFlipped);
  card.setAttribute('aria-pressed', String(isFlipped));
}

function closeOtherCards(activeCard) {
  projectCards.forEach((card) => {
    if (card !== activeCard) {
      setCardState(card, false);
    }
  });
}

function toggleCard(card) {
  const shouldFlip = !card.classList.contains('is-flipped');
  closeOtherCards(card);
  setCardState(card, shouldFlip);
}

projectCards.forEach((card) => {
  let pointerType = '';

  card.addEventListener('pointerdown', (event) => {
    pointerType = event.pointerType;
  });

  card.addEventListener('click', () => {
    if (pointerType === 'mouse' && precisePointer.matches) {
      pointerType = '';
      return;
    }

    toggleCard(card);
    pointerType = '';
  });

  card.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    pointerType = '';
    toggleCard(card);
  });
});

const clientsSection = document.querySelector('.clients-section');

if (clientsSection) {
  let clientsAnimationScheduled = false;
  let clientsAmbientTimer = 0;
  let lastClientsScrollY = window.scrollY;
  let clientsScrollDirection = 'down';
  const clientsLastRowDelay = 1050;
  const clientsEntryDuration = 620;
  const clientsAmbientPause = 320;
  const clientsAmbientDelay = clientsLastRowDelay + clientsEntryDuration + clientsAmbientPause;

  const stopClientsAmbient = () => {
    window.clearTimeout(clientsAmbientTimer);
    clientsAmbientTimer = 0;
    clientsSection.classList.remove('is-ambient');
  };

  const activateClients = () => {
    if (clientsSection.classList.contains('is-active')) {
      return;
    }

    stopClientsAmbient();
    clientsSection.classList.add('is-active');

    if (!reducedMotion.matches) {
      clientsAmbientTimer = window.setTimeout(() => {
        if (clientsSection.classList.contains('is-active')) {
          clientsSection.classList.add('is-ambient');
        }
      }, clientsAmbientDelay);
    }
  };

  const deactivateClients = () => {
    stopClientsAmbient();
    clientsSection.classList.remove('is-active');
  };

  const updateClientsAnimation = () => {
    const sectionRect = clientsSection.getBoundingClientRect();
    const visibleHeight = Math.max(
      Math.min(sectionRect.bottom, window.innerHeight) - Math.max(sectionRect.top, 0),
      0,
    );
    const visibleRatio = sectionRect.height > 0 ? visibleHeight / sectionRect.height : 0;
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - lastClientsScrollY;
    const projectsExitProgress = Math.min(Math.max(visibleRatio / 0.24, 0), 1);

    if (projectsGrid && !reducedMotion.matches) {
      projectsGrid.style.setProperty('--projects-scene-opacity', (1 - projectsExitProgress).toFixed(3));
      projectsGrid.style.setProperty('--projects-scene-shift', `${(-projectsExitProgress * 30).toFixed(2)}px`);
    }

    if (Math.abs(scrollDelta) >= 4) {
      clientsScrollDirection = scrollDelta > 0 ? 'down' : 'up';
      lastClientsScrollY = currentScrollY;
    }

    if (reducedMotion.matches) {
      activateClients();
    } else if (visibleRatio === 0) {
      deactivateClients();
    } else if (clientsScrollDirection === 'down' && visibleRatio >= 0.24) {
      activateClients();
    } else if (clientsScrollDirection === 'up' && visibleRatio <= 0.78) {
      deactivateClients();
    }

    clientsAnimationScheduled = false;
  };

  const requestClientsAnimationUpdate = () => {
    if (!clientsAnimationScheduled) {
      clientsAnimationScheduled = true;
      window.requestAnimationFrame(updateClientsAnimation);
    }
  };

  window.addEventListener('scroll', requestClientsAnimationUpdate, { passive: true });
  window.addEventListener('resize', requestClientsAnimationUpdate);
  requestClientsAnimationUpdate();
}
