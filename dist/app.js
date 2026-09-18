
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
const symptoms=['Feridas que demoram para cicatrizar','Feridas abertas por semanas ou meses','Feridas que não apresentam boa evolução','Dificuldades no processo de cicatrização','Feridas que exigem cuidados especializados','Cicatrizes que causam incômodo estético'];
document.querySelector('#symptoms').innerHTML=symptoms.map(t=>`<div class="symptom"><span class="icon">✧</span>${t}</div>`).join('');
const treatments=[['Pé diabético','Avaliação e acompanhamento de feridas nos pés de pessoas com diabetes, com cuidado individualizado.'],['Úlceras venosas e arteriais','Avaliação das características da ferida e das necessidades de cuidado, considerando a importância do acompanhamento vascular.'],['Lesões por pressão (escaras)','Cuidados com feridas relacionadas à pressão sobre a pele, com orientação ao paciente e a quem cuida.'],['Feridas pós-operatórias e deiscências','Acompanhamento de feridas após cirurgias, incluindo casos em que ocorre abertura da incisão.'],['Feridas de difícil cicatrização','Avaliação de feridas que permanecem abertas ou não apresentam boa evolução, para definir o plano de cuidado.'],['Estética de cicatrizes','Avaliação da cicatriz e de possibilidades de cuidado com sua aparência, incluindo camuflagem paramédica quando indicada.']];
const treatmentImages = ['pe-diabetico-curativo','ulceras','escaras','pos-operatorio','cicatrizacao-dra-luz','cicatrizes'];
document.querySelector('#treatments').innerHTML=treatments.map(([t,p],i)=>`<article class="card service-card"><img src="images/${treatmentImages[i]}.jpg" alt="Imagem ilustrativa de ${t.toLowerCase()}" loading="lazy" decoding="async" width="1536" height="1024"><div class="service-copy"><h3>${t}</h3><p>${p}</p></div></article>`).join('');
const resources=[['Laserterapia','Recurso terapêutico utilizado conforme a avaliação profissional e as necessidades específicas do processo de cuidado e cicatrização.'],['Ozonioterapia','Abordagem utilizada dentro de uma estratégia individualizada, conforme indicação e avaliação de cada caso.'],['Plasma rico em plaquetas (PRP)','Recurso que pode integrar o plano de cuidado de feridas, conforme avaliação e indicação profissional para cada caso.'],['Matriz de fibrina','Recurso aplicado em situações específicas como parte da abordagem voltada ao processo de reparação tecidual.'],['Camuflagem paramédica','Técnica voltada à estética da cicatriz, buscando melhorar sua aparência e proporcionar maior harmonia visual à pele.'],['Curativos especializados','Seleção da abordagem e dos cuidados adequados às características e necessidades de cada ferida.']];
document.querySelector('#resources').innerHTML=resources.map(([t,p],i)=>`<article class="resource"><b>0${i+1}</b><h3>${t}</h3><p>${p}</p></article>`).join('');
const steps=[['Avaliação','O primeiro passo é compreender o caso. A ferida ou cicatriz é avaliada cuidadosamente, considerando as necessidades individuais do paciente.'],['Definição da conduta','É definida a estratégia de cuidado mais adequada. Quando necessário, são considerados recursos e tecnologias para a abordagem.'],['Tratamento','O paciente inicia o tratamento de acordo com a conduta definida para suas necessidades.'],['Acompanhamento','A evolução é acompanhada ao longo do processo, permitindo ajustar os cuidados conforme a necessidade.']];
document.querySelector('#steps').innerHTML=steps.map(([t,p],i)=>`<article><div class="step-number">0${i+1}</div><h3>${t}</h3><p>${p}</p></article>`).join('');
const faq=[['Quando devo procurar uma profissional especializada em tratamento de feridas?','Quando uma ferida apresenta dificuldade para evoluir, demora mais do que o esperado para cicatrizar ou necessita de cuidados específicos, uma avaliação especializada pode ajudar a compreender melhor as necessidades do caso.'],['Toda ferida recebe o mesmo tipo de tratamento?','Não. Cada ferida possui características próprias. A conduta e os recursos utilizados dependem da avaliação profissional e das necessidades individuais de cada paciente.'],['Quais tratamentos e recursos podem ser utilizados?','A Dra. Luz Marina trabalha com recursos como laserterapia, ozonioterapia, plasma rico em plaquetas (PRP), matriz de fibrina, curativos especializados e camuflagem paramédica, sempre de acordo com a avaliação e indicação para cada caso.'],['A Dra. Luz Marina também atende casos relacionados a cicatrizes?','Sim. Além da atuação em cicatrização de feridas, possui ênfase em estética da cicatriz, incluindo técnicas como a camuflagem paramédica.'],['Quanto tempo uma ferida leva para cicatrizar?','O tempo varia de acordo com as características da ferida, as condições individuais do paciente e sua evolução durante o acompanhamento. Por isso, cada caso precisa ser avaliado individualmente.'],['Onde é realizado o atendimento?','O atendimento é domiciliar em Brasília – DF. Entre em contato pelo WhatsApp, informe seu bairro e consulte a disponibilidade para agendar uma avaliação em casa.']];
document.querySelector('#faq').innerHTML=faq.map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('');
const leadDialog=document.querySelector('#lead-dialog');
document.querySelectorAll('a.btn').forEach(button=>button.addEventListener('click',event=>{if(button.closest('#lead-dialog'))return;event.preventDefault();leadDialog.showModal();document.querySelector('#lead-name').focus()}));
document.querySelector('.close').addEventListener('click',()=>leadDialog.close());
leadDialog.addEventListener('click',event=>{if(event.target===leadDialog)leadDialog.close()});
const leadForm=document.querySelector('#lead-form');
leadForm.method='post';leadForm.action='/api/leads';
const treatment=document.querySelector('#lead-treatment');
if(treatment){treatment.value='Orientação sobre tratamento de feridas';treatment.hidden=true;treatment.previousElementSibling.hidden=true;}
const messageField=document.querySelector('#lead-message');
if(messageField){messageField.required=true;messageField.placeholder='Conte brevemente o que está acontecendo';}
const consentLabel=document.createElement('label');
consentLabel.style.cssText='display:flex;gap:10px;align-items:flex-start;font-weight:400';
const consent=document.createElement('input');consent.type='checkbox';consent.required=true;consent.name='consent';consent.style.cssText='width:18px;flex:0 0 18px;margin-top:4px';
consentLabel.append(consent,document.createTextNode('Autorizo o armazenamento destes dados e o contato da equipe da Dra. Luz Marina sobre minha solicitação.'));
// O formulário foi reduzido para facilitar o preenchimento por familiares e cuidadores.
const leadError=document.createElement('p');leadError.setAttribute('role','alert');leadForm.append(leadError);
let requestId=crypto.randomUUID();
leadForm.addEventListener('submit',async event=>{
  event.preventDefault();if(!leadForm.reportValidity())return;
  const submit=leadForm.querySelector('button[type="submit"]');submit.disabled=true;leadError.textContent='';
  try{
    const values=Object.fromEntries(new FormData(leadForm));
    const response=await fetch('/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...values,consent:true,requestId})});
    const result=await response.json();
    if(!response.ok||!result.ok)throw Error(result.error||'Não foi possível salvar seus dados.');
    location.assign('/obrigado');
  }catch(error){leadError.textContent='Não conseguimos enviar agora. Seus dados continuam no formulário. Tente novamente ou fale pelo WhatsApp.';
    const link=document.createElement('a');link.href='https://wa.me/556181757514';link.textContent=' Falar pelo WhatsApp';link.target='_blank';link.rel='noopener noreferrer';leadError.append(link);submit.disabled=false;}
});
const whatsappFloat=document.createElement('a');
whatsappFloat.className='whatsapp-float';
whatsappFloat.href='https://wa.me/556181757514?text=Ol%C3%A1%2C%20vi%20o%20site%20da%20Dra.%20Luz%20Marina%20e%20gostaria%20de%20agendar%20uma%20avalia%C3%A7%C3%A3o.';
whatsappFloat.target='_blank';whatsappFloat.rel='noopener noreferrer';whatsappFloat.textContent='Falar pelo WhatsApp';
function gtag_report_conversion(url){const callback=()=>{if(url)window.open(url,'_blank','noopener')};if(typeof gtag==='function')gtag('event','conversion',{send_to:'AW-18451415875/5W4YCPSApfwcEMOGqd5E',value:1.0,currency:'BRL',event_callback:callback});else callback();return false}
whatsappFloat.addEventListener('click',event=>{event.preventDefault();gtag_report_conversion(whatsappFloat.href)});
document.body.append(whatsappFloat);
