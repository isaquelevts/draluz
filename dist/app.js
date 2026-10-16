
const track = document.querySelector('#testimonial-track');
const prevReview = document.querySelector('.carousel-prev');
const nextReview = document.querySelector('.carousel-next');

const reviewCards = [...track.querySelectorAll('.testimonial')];
const reviewCount = reviewCards.length;
reviewCards.forEach((card, i) => {
  card.setAttribute('role', 'group');
  card.setAttribute('aria-roledescription', 'slide');
  card.setAttribute('aria-label', `${i + 1} de ${reviewCount}`);
});
function cloneReviews() {
  const fragment = document.createDocumentFragment();
  reviewCards.forEach(card => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    fragment.append(clone);
  });
  return fragment;
}
track.prepend(cloneReviews());
track.append(cloneReviews());
let reviewIndex = reviewCount;
let reviewStep = 0;
let settleTimer;
let reviewMoving = false;
const reviewQueue = [];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function reviewOffset(index) {
  const cards = track.children;
  return cards[index].offsetLeft - cards[0].offsetLeft;
}

function finishReviewMove() {
  clearTimeout(settleTimer);
  reviewIndex = Math.round(track.scrollLeft / reviewStep);
  const normalized = reviewCount + ((reviewIndex % reviewCount) + reviewCount) % reviewCount;
  if (normalized !== reviewIndex) {
    reviewIndex = normalized;
    track.scrollTo({ left: reviewOffset(reviewIndex), behavior: 'instant' });
  }
  reviewMoving = false;

  if (reviewQueue.length) moveReview(reviewQueue.shift());
}
function moveReview(direction) {
  if (!reviewStep) return;
  if (reviewMoving) { reviewQueue.push(direction); return; }
  reviewIndex = Math.round(track.scrollLeft / reviewStep) + direction;
  reviewMoving = true;
  track.scrollTo({ left: reviewOffset(reviewIndex), behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  clearTimeout(settleTimer);
  settleTimer = setTimeout(finishReviewMove, reducedMotion.matches ? 30 : 180);

}
prevReview.disabled = false;
nextReview.disabled = false;
prevReview.addEventListener('click', () => moveReview(-1));
nextReview.addEventListener('click', () => moveReview(1));
track.addEventListener('scroll', () => {
  clearTimeout(settleTimer);
  settleTimer = setTimeout(finishReviewMove, 140);
}, { passive: true });
track.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    moveReview(event.key === 'ArrowRight' ? 1 : -1);
  }
});
function sizeReviews() {
  clearTimeout(settleTimer);
  reviewQueue.length = 0;
  reviewMoving = false;
  reviewIndex = reviewCount + ((reviewIndex % reviewCount) + reviewCount) % reviewCount;
  reviewStep = reviewOffset(1);
  track.scrollTo({ left: reviewOffset(reviewIndex), behavior: 'instant' });

}
new ResizeObserver(sizeReviews).observe(track);
sizeReviews();
const reviewSection = document.querySelector('#depoimentos');

let autoplayTimer;
let autoplayPaused = reducedMotion.matches;
let pointerOverReviews = false;
function scheduleReviews() {
  clearInterval(autoplayTimer);
  if (autoplayPaused || pointerOverReviews || document.hidden || reviewSection.contains(document.activeElement)) return;
  autoplayTimer = setInterval(() => {
    if (!reviewMoving && !reviewQueue.length) moveReview(1);
  }, 4000);
}


reviewSection.addEventListener('pointerenter', event => {
  if (event.pointerType === 'mouse') { pointerOverReviews = true; scheduleReviews(); }
});
reviewSection.addEventListener('pointerleave', () => { pointerOverReviews = false; scheduleReviews(); });
reviewSection.addEventListener('focusin', scheduleReviews);
reviewSection.addEventListener('focusout', () => setTimeout(scheduleReviews, 0));
track.addEventListener('touchstart', () => clearInterval(autoplayTimer), { passive: true });
track.addEventListener('touchend', scheduleReviews, { passive: true });
document.addEventListener('visibilitychange', scheduleReviews);
reducedMotion.addEventListener('change', () => { autoplayPaused = reducedMotion.matches;  scheduleReviews(); });

scheduleReviews();
const whatsappFloat=document.createElement('a');
whatsappFloat.className='whatsapp-float';
whatsappFloat.href='https://wa.me/556181757514?text=Ol%C3%A1%2C%20vi%20o%20site%20da%20Dra.%20Luz%20Marina%20e%20gostaria%20de%20agendar%20uma%20avalia%C3%A7%C3%A3o.';
whatsappFloat.target='_blank';whatsappFloat.rel='noopener noreferrer';whatsappFloat.textContent='Falar pelo WhatsApp';
let lastConversionAt=0;function gtag_report_conversion(){const now=Date.now();if(now-lastConversionAt<1200)return;lastConversionAt=now;if(typeof gtag==='function')gtag('event','conversion',{send_to:'AW-18451415875/5W4YCPSApfwcEMOGqd5E',value:1.0,currency:'BRL'})}
whatsappFloat.addEventListener('click',gtag_report_conversion);
document.body.append(whatsappFloat);
document.querySelectorAll('a[href*="wa.me"]').forEach(link=>{if(link!==whatsappFloat)link.addEventListener('click',gtag_report_conversion)});
