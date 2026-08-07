const projectsHero = document.querySelector('.projects-intro');
const projectsTitle = document.querySelector('.projects-title');
const projectsTitleLetters = [...document.querySelectorAll('.projects-title-letter')];
const projectsGrid = document.querySelector('.projects-grid');
const projectCards = [...document.querySelectorAll('.project-card')];
const precisePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (projectsHero && projectsTitle) {
  let fadeScheduled = false;
  let replayArmed = false;

  projectsTitleLetters.forEach((letter, index) => {
    letter.style.setProperty('--letter-delay', `${index * 45}ms`);
  });

  const replayTitle = () => {
    projectsTitle.classList.remove('is-building');

    if (!reducedMotion.matches) {
      void projectsTitle.offsetWidth;
    }

    projectsTitle.classList.add('is-building');
  };

  replayTitle();

  const updateTitleFade = () => {
    const heroRect = projectsHero.getBoundingClientRect();
    const fadeDistance = Math.min(Math.max(window.innerHeight * 0.22, 160), 260);
    const fadeProgress = Math.min(Math.max(-heroRect.top / fadeDistance, 0), 1);

    projectsTitle.style.setProperty('--hero-fade', fadeProgress.toFixed(3));
    projectsTitle.style.setProperty('--hero-shift', `${(-fadeProgress * 28).toFixed(2)}px`);
    projectsTitle.style.setProperty('--hero-scale', (1 - fadeProgress * 0.02).toFixed(3));
    projectsTitle.classList.toggle('is-faded', fadeProgress >= 1 && !reducedMotion.matches);

    if (fadeProgress >= 1) {
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
  let lastClientsScrollY = window.scrollY;
  let clientsScrollDirection = 'down';

  const updateClientsAnimation = () => {
    const sectionRect = clientsSection.getBoundingClientRect();
    const visibleHeight = Math.max(
      Math.min(sectionRect.bottom, window.innerHeight) - Math.max(sectionRect.top, 0),
      0,
    );
    const visibleRatio = sectionRect.height > 0 ? visibleHeight / sectionRect.height : 0;
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - lastClientsScrollY;

    if (Math.abs(scrollDelta) >= 4) {
      clientsScrollDirection = scrollDelta > 0 ? 'down' : 'up';
      lastClientsScrollY = currentScrollY;
    }

    if (reducedMotion.matches) {
      clientsSection.classList.add('is-active');
    } else if (visibleRatio === 0) {
      clientsSection.classList.remove('is-active');
    } else if (clientsScrollDirection === 'down' && visibleRatio >= 0.24) {
      clientsSection.classList.add('is-active');
    } else if (clientsScrollDirection === 'up' && visibleRatio <= 0.78) {
      clientsSection.classList.remove('is-active');
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
