const SEGMENTS = [
  { name: 'Abel',  color: '#b5451f' },
  { name: 'Abrsh', color: '#d9b26a' },
  { name: 'Abel',  color: '#7a2a10' },
  { name: 'Tem',   color: '#8a5a2b' },
];

const WEIGHTS = { Abel: 2, Abrsh: 1, Tem: 1 };

const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('spinBtn');
const againBtn = document.getElementById('againBtn');
const modal = document.getElementById('modal');
const resultName = document.getElementById('resultName');
const resultLine = document.getElementById('resultLine');

let currentRotation = 0;
let spinning = false;

function polar(r, angleDeg) {
  const a = (angleDeg - 90) * Math.PI / 180;
  return { x: r * Math.cos(a), y: r * Math.sin(a) };
}

function pieSlice(r, startAngle, endAngle) {
  const start = polar(r, startAngle);
  const end = polar(r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M 0 0 L ${start.x.toFixed(3)} ${start.y.toFixed(3)} A ${r} ${r} 0 ${largeArc} 1 ${end.x.toFixed(3)} ${end.y.toFixed(3)} Z`;
}

function buildWheel() {
  const r = 100;
  const segCount = SEGMENTS.length;
  const segAngle = 360 / segCount;
  let svg = '';

  for (let i = 0; i < segCount; i++) {
    const start = i * segAngle - segAngle / 2;
    const end = start + segAngle;
    svg += `<path d="${pieSlice(r, start, end)}" fill="${SEGMENTS[i].color}" stroke="#4a2b14" stroke-width="2" stroke-linejoin="round" />`;
  }

  for (let i = 0; i < segCount; i++) {
    const mid = i * segAngle;
    const labelR = r * 0.6;
    const { x, y } = polar(labelR, mid);
    const tilt = mid > 90 && mid < 270 ? mid + 180 : mid;
    svg += `<g transform="translate(${x.toFixed(3)} ${y.toFixed(3)}) rotate(${tilt})">
      <text text-anchor="middle" dominant-baseline="middle"
        font-family="'Rye', 'Bungee', cursive" font-size="18"
        fill="#fff3db" stroke="#4a2b14" stroke-width="0.8"
        paint-order="stroke">${SEGMENTS[i].name}</text>
    </g>`;
  }

  wheel.innerHTML = svg;
}

function weightedPick() {
  const total = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (const [name, w] of Object.entries(WEIGHTS)) {
    r -= w;
    if (r < 0) return name;
  }
  return Object.keys(WEIGHTS)[0];
}

function pickSegmentIndex(name) {
  const matches = SEGMENTS.reduce((acc, s, i) => (s.name === name ? acc.concat(i) : acc), []);
  return matches[Math.floor(Math.random() * matches.length)];
}

function openModal(name) {
  resultName.textContent = name;
  resultLine.textContent = `${name} gets bullied today`;
  modal.classList.remove('hidden');
}

function closeModal() {
  modal.classList.add('hidden');
}

function fireConfetti() {
  if (typeof confetti !== 'function') return;
  const colors = ['#b5451f', '#d9b26a', '#7a2a10', '#fff3db', '#8a5a2b', '#f1d79a'];

  confetti({
    particleCount: 140,
    spread: 100,
    startVelocity: 48,
    origin: { y: 0.5 },
    colors,
    scalar: 1.05,
  });

  setTimeout(() => {
    confetti({ particleCount: 70, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors });
    confetti({ particleCount: 70, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors });
  }, 220);
}

function spin() {
  if (spinning) return;
  spinning = true;
  spinBtn.disabled = true;
  closeModal();

  const winner = weightedPick();
  const segIndex = pickSegmentIndex(winner);
  const segAngle = 360 / SEGMENTS.length;
  const segCenter = segIndex * segAngle;

  const jitter = (Math.random() - 0.5) * (segAngle * 0.55);
  const desiredEnd = ((-segCenter + jitter) % 360 + 360) % 360;
  const currentMod = ((currentRotation % 360) + 360) % 360;
  const extraSpins = 6 + Math.floor(Math.random() * 3);
  const delta = (desiredEnd - currentMod + 360) % 360 + extraSpins * 360;

  currentRotation += delta;
  wheel.classList.add('spinning');
  wheel.style.transform = `rotate(${currentRotation}deg)`;

  setTimeout(() => {
    spinning = false;
    spinBtn.disabled = false;
    openModal(winner);
    fireConfetti();
  }, 5050);
}

spinBtn.addEventListener('click', spin);
againBtn.addEventListener('click', () => {
  closeModal();
  spin();
});
modal.addEventListener('click', (e) => {
  if (e.target.dataset.close) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

buildWheel();
