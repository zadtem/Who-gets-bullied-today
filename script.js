const SEGMENTS = [
  { name: 'Abel',  color: '#ff3d6e' },
  { name: 'Abrsh', color: '#3ab0ff' },
  { name: 'Abel',  color: '#ff7aa5' },
  { name: 'Tem',   color: '#a06cd5' },
];

const WEIGHTS = { Abel: 2, Abrsh: 1, Tem: 1 };

const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('spinBtn');
const againBtn = document.getElementById('againBtn');
const resultCard = document.getElementById('resultCard');
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
    svg += `<path d="${pieSlice(r, start, end)}" fill="${SEGMENTS[i].color}" stroke="#ffffff" stroke-width="2" stroke-linejoin="round" />`;
  }

  for (let i = 0; i < segCount; i++) {
    const mid = i * segAngle;
    const labelR = r * 0.6;
    const { x, y } = polar(labelR, mid);
    const tilt = mid > 90 && mid < 270 ? mid + 180 : mid;
    svg += `<g transform="translate(${x.toFixed(3)} ${y.toFixed(3)}) rotate(${tilt})">
      <text text-anchor="middle" dominant-baseline="middle"
        font-family="'Luckiest Guy', cursive" font-size="20"
        fill="#ffffff" stroke="rgba(0,0,0,0.4)" stroke-width="0.7"
        paint-order="stroke">${SEGMENTS[i].name}</text>
    </g>`;
  }

  for (let i = 0; i < segCount; i++) {
    const mid = i * segAngle;
    const dotR = r * 0.92;
    const { x, y } = polar(dotR, mid);
    svg += `<circle cx="${x.toFixed(3)}" cy="${y.toFixed(3)}" r="3" fill="#ffffff" opacity="0.85" />`;
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

function hideResult() {
  resultCard.classList.remove('show');
  resultCard.classList.add('hidden');
}

function showResult(name) {
  resultName.textContent = name;
  resultLine.textContent = `${name} gets bullied today`;
  resultCard.classList.remove('hidden');
  requestAnimationFrame(() => resultCard.classList.add('show'));
}

function fireConfetti() {
  if (typeof confetti !== 'function') return;
  const colors = ['#ff3d6e', '#ffd23f', '#3ab0ff', '#a06cd5', '#4cd3c2', '#ff7aa5'];

  confetti({
    particleCount: 160,
    spread: 100,
    startVelocity: 50,
    origin: { y: 0.55 },
    colors,
    scalar: 1.1,
  });

  setTimeout(() => {
    confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors });
    confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors });
  }, 250);

  const duration = 2200;
  const end = Date.now() + duration;
  (function frame() {
    confetti({ particleCount: 3, angle: 60, spread: 75, origin: { x: 0, y: 0.8 }, colors });
    confetti({ particleCount: 3, angle: 120, spread: 75, origin: { x: 1, y: 0.8 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

function spin() {
  if (spinning) return;
  spinning = true;
  spinBtn.disabled = true;
  hideResult();

  const winner = weightedPick();
  const segIndex = pickSegmentIndex(winner);
  const segAngle = 360 / SEGMENTS.length;
  const segCenter = segIndex * segAngle;

  const jitter = (Math.random() - 0.5) * (segAngle * 0.55);
  const desiredEnd = ((-segCenter + jitter) % 360 + 360) % 360;
  const currentMod = ((currentRotation % 360) + 360) % 360;
  const extraSpins = 6 + Math.floor(Math.random() * 3);
  let delta = (desiredEnd - currentMod + 360) % 360 + extraSpins * 360;

  currentRotation += delta;
  wheel.classList.add('spinning');
  wheel.style.transform = `rotate(${currentRotation}deg)`;

  setTimeout(() => {
    spinning = false;
    spinBtn.disabled = false;
    showResult(winner);
    fireConfetti();
  }, 5050);
}

spinBtn.addEventListener('click', spin);
againBtn.addEventListener('click', () => {
  hideResult();
  spin();
});

buildWheel();
