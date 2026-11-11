/* =====================================================================
   SCRIPT.JS
   1) Menu do celular (abrir/fechar)
   2) Placa da capa: "aberto / fechado" + próximo horário de abrir
   3) Marca o dia de hoje na tabela de horários
   4) Galeria: abre a foto em tamanho grande
   5) Ano automático no rodapé
   ===================================================================== */

/* ---------- 1) MENU DO CELULAR ---------- */
const burger = document.querySelector('.burger');
const menu = document.getElementById('menu');

function fecharMenu() {
  menu.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-label', 'Abrir menu');
  document.body.classList.remove('menu-open');
}

burger.addEventListener('click', () => {
  const abrir = !menu.classList.contains('open');
  menu.classList.toggle('open', abrir);
  burger.setAttribute('aria-expanded', String(abrir));
  burger.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
  document.body.classList.toggle('menu-open', abrir);
});

// clicou num link do menu: fecha o menu
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', fecharMenu));

// se a tela crescer (ex.: celular deitado virou computador), fecha o menu
window.matchMedia('(min-width: 900px)').addEventListener('change', fecharMenu);


/* ---------- 2) PLACA DE ABERTO / FECHADO ---------- */
/* HORARIOS: [abre, fecha] em minutos desde a meia-noite. null = fechado.
   Ex.: 09:30 = 9*60+30. A posição na lista é o dia: 0 = domingo, 1 = segunda ... 6 = sábado.
   Se os horários mudarem, troque aqui E na tabela do index.html. */
const HORARIOS = [
  null,                      // domingo
  [9 * 60, 18 * 60],           // segunda
  [9 * 60, 18 * 60],           // terça
  [9 * 60, 18 * 60],           // quarta
  [9 * 60, 18 * 60],           // quinta
  [9 * 60, 18 * 60],           // sexta
  [9 * 60 + 30, 14 * 60]       // sábado
];

const placa = document.querySelector('.placa');
const placaStatus = document.getElementById('placaStatus');
const placaHora = document.getElementById('placaHora');

// nomes dos dias, na mesma ordem da lista HORARIOS (0 = domingo)
const NOMES_DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

// pega a hora de Brasília, mesmo que o visitante esteja em outro fuso
function agoraBrasilia() {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo', hour12: false,
    weekday: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).formatToParts(new Date());
  const v = {};
  partes.forEach(p => { v[p.type] = p.value; });
  const dias = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { dia: dias[v.weekday], h: Number(v.hour) % 24, m: Number(v.minute) };
}

// transforma minutos em texto de hora: 570 -> "09:30"
const hora = min => String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0');

// procura o próximo dia (a partir de hoje) em que a loja abre
function proximaAbertura(t) {
  const minutos = t.h * 60 + t.m;
  for (let i = 0; i < 7; i++) {
    const dia = (t.dia + i) % 7;
    const h = HORARIOS[dia];
    if (!h) continue;                      // dia fechado: pula
    if (i === 0 && minutos >= h[0]) continue; // hoje já passou do horário de abrir: pula
    let quando;
    if (i === 0) quando = 'hoje';
    else if (i === 1) quando = 'amanhã (' + NOMES_DIAS[dia] + ')';
    else quando = NOMES_DIAS[dia];
    return 'Abre ' + quando + ' às ' + hora(h[0]);
  }
  return '';
}

function atualizarPlaca() {
  const t = agoraBrasilia();
  const hoje = HORARIOS[t.dia];
  const minutos = t.h * 60 + t.m;
  const aberto = hoje && minutos >= hoje[0] && minutos < hoje[1];

  if (aberto) {
    placaStatus.textContent = '● Aberto agora';
    placaHora.textContent = 'Fecha hoje às ' + hora(hoje[1]);
  } else {
    placaStatus.textContent = '● Fechado agora';
    placaHora.textContent = proximaAbertura(t);
  }
  placa.classList.toggle('fechado', !aberto);
  return t;
}

const inicio = atualizarPlaca();
setInterval(atualizarPlaca, 30000); // confere de novo a cada 30 segundos


/* ---------- 3) DIA DE HOJE NA TABELA ---------- */
const linhaHoje = document.querySelector('.hours tr[data-dias="' + inicio.dia + '"]');
if (linhaHoje) linhaHoje.classList.add('hoje');


/* ---------- 4) GALERIA: FOTO GRANDE ---------- */
const lightbox = document.getElementById('lightbox');
const fotoGrande = lightbox.querySelector('img');

document.querySelectorAll('.gallery .g').forEach(botao => {
  botao.addEventListener('click', () => {
    const img = botao.querySelector('img');
    fotoGrande.src = img.src;
    fotoGrande.alt = img.alt;
    lightbox.showModal();
  });
});

// fecha no "×" ou clicando fora da foto (a tecla Esc já fecha sozinha)
lightbox.querySelector('.lb-close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.close(); });


/* ---------- 5) ANO NO RODAPÉ ---------- */
document.getElementById('ano').textContent = new Date().getFullYear();
