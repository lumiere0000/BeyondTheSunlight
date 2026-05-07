const simulator = document.getElementById("simulator");
const oceanBg = document.getElementById("ocean-bg");
const oceanParticles = document.getElementById("ocean-particles");
const terrainLayer = document.getElementById("terrain-layer");
const miningLayer = document.getElementById("mining-layer");
const debrisLayer = document.getElementById("debris-layer");
const marineLayer = document.getElementById("marine-layer");
const fishSchoolLayer = document.getElementById("fish-school-layer");
const jellyfishLayer = document.getElementById("jellyfish-layer");
const lanternfishLayer = document.getElementById("lanternfish-layer");
const hatchetfishLayer = document.getElementById("hatchetfish-layer");
const viperfishLayer = document.getElementById("viperfish-layer");
const combJellyLayer = document.getElementById("comb-jelly-layer");
const anglerfishLayer = document.getElementById("anglerfish-layer");
const atollaJellyfishLayer = document.getElementById("atolla-jellyfish-layer");
const dumboOctopusLayer = document.getElementById("dumbo-octopus-layer");

const depthValue = document.getElementById("depthValue");
const zoneName = document.getElementById("zoneName");
const visibilityValue = document.getElementById("visibilityValue");
const pressureValue = document.getElementById("pressureValue");
const bioValue = document.getElementById("bioValue");
const tempValue = document.getElementById("tempValue");
const floodState = document.getElementById("floodState");
const oxygenValue = document.getElementById("oxygenValue");
const oxygenFill = document.getElementById("oxygenFill");
const oxygenMode = document.getElementById("oxygenMode");

const debrisPercent = document.getElementById("debrisPercent");
const glowPercent = document.getElementById("glowPercent");
const energyText = document.getElementById("energyText");

const secretCard = document.getElementById("secretCard");

const whiteModeBtn = document.getElementById("whiteModeBtn");
const offModeBtn = document.getElementById("offModeBtn");
const redModeBtn = document.getElementById("redModeBtn");

const depthTrack = document.getElementById("depthTrack");

const infoButtons = document.querySelectorAll(".info-btn");
const infoPopup = document.getElementById("infoPopup");
const infoPopupTitle = document.getElementById("infoPopupTitle");
const infoPopupBody = document.getElementById("infoPopupBody");
const closeInfoPopup = document.getElementById("closeInfoPopup");

const miningPopupOverlay = document.getElementById("miningPopupOverlay");
const miningPopupBody = document.getElementById("miningPopupBody");
const closeMiningPopup = document.getElementById("closeMiningPopup");

const miningAlarmBtn = document.getElementById("miningAlarmBtn");
const alarmQuickBtn = document.getElementById("alarmQuickBtn");
const miningBlip = document.getElementById("miningBlip");
const radarAnimalDots = document.getElementById("radarAnimalDots");
const surfaceWaves = document.getElementById("surface-waves");
const descentStatus = document.getElementById("descentStatus");
const logCarouselBtn = document.getElementById("logCarouselBtn");
const scanFieldBtn = document.getElementById("scanFieldBtn");
const soundToggleBtn = document.getElementById("soundToggleBtn");
const scannerFieldOverlay = document.getElementById("scannerFieldOverlay");
const scannerStatus = document.getElementById("scannerStatus");
const logCarouselOverlay = document.getElementById("logCarouselOverlay");
const closeLogCarousel = document.getElementById("closeLogCarousel");
const logCarouselZone = document.getElementById("logCarouselZone");
const animalCarouselTrack = document.getElementById("animalCarouselTrack");
const logCarouselPrev = document.getElementById("logCarouselPrev");
const logCarouselNext = document.getElementById("logCarouselNext");
const logCarouselMenu = document.getElementById("logCarouselMenu");
const animalDetailView = document.getElementById("animalDetailView");
const animalDetailNav = document.getElementById("animalDetailNav");
const animalHeroImage = document.getElementById("animalHeroImage");
const animalScientificName = document.getElementById("animalScientificName");
const animalZone = document.getElementById("animalZone");
const animalPurpose = document.getElementById("animalPurpose");
const animalSensitivity = document.getElementById("animalSensitivity");
const backToCarousel = document.getElementById("backToCarousel");
const commsBtn = document.getElementById("commsBtn");
const missionBriefOverlay = document.getElementById("missionBriefOverlay");
const closeMissionBrief = document.getElementById("closeMissionBrief");
const mapBtn = document.getElementById("mapBtn");
const mapOverlay = document.getElementById("mapOverlay");
const closeMap = document.getElementById("closeMap");
const missionCompleteOverlay = document.getElementById("missionCompleteOverlay");
const beginNewDescentBtn = document.getElementById("beginNewDescentBtn");


const backgroundSound = new Audio("sound.mp3");
backgroundSound.loop = true;
backgroundSound.preload = "auto";
backgroundSound.volume = 0.75;
let isSoundOn = true;
let soundAutoplayPending = false;

function updateSoundToggleButton(error = false) {
  if (!soundToggleBtn) return;
  soundToggleBtn.classList.toggle("sound-on", isSoundOn);
  soundToggleBtn.classList.toggle("sound-error", error);
  soundToggleBtn.setAttribute("aria-pressed", String(isSoundOn));
  soundToggleBtn.textContent = error ? "SOUND ERR" : (isSoundOn ? "SOUND ON" : "SOUND OFF");
}

function playBackgroundSound({ restart = false } = {}) {
  if (!isSoundOn) return;
  if (restart) backgroundSound.currentTime = 0;
  backgroundSound.play()
    .then(() => {
      soundAutoplayPending = false;
      updateSoundToggleButton();
    })
    .catch((error) => {
      console.warn("Sound will start after the first user interaction:", error);
      soundAutoplayPending = true;
      updateSoundToggleButton();
    });
}

function tryPendingAutoplay() {
  if (isSoundOn && soundAutoplayPending) playBackgroundSound();
}

function toggleBackgroundSound() {
  if (!soundToggleBtn) return;

  if (isSoundOn) {
    backgroundSound.pause();
    backgroundSound.currentTime = 0;
    isSoundOn = false;
    soundAutoplayPending = false;
    updateSoundToggleButton();
    return;
  }

  isSoundOn = true;
  soundAutoplayPending = false;
  updateSoundToggleButton();
  playBackgroundSound({ restart: true });
}

function forceSoundOn({ restart = false } = {}) {
  isSoundOn = true;
  soundAutoplayPending = false;
  updateSoundToggleButton();
  playBackgroundSound({ restart });
}


const SURFACE_HOLD_PROGRESS = 0.08;

let maxDepth = 11000;
let currentDepth = 0;
let currentMode = "white";
let redObservationActive = false;
let redObservationTimeout = null;

let atollaJellyfish = [];
let atollaJellyfishCtx = null;
let atollaJellyfishAnimId = null;

let miningSystemBuilt = false;
let miningAlertActive = false;
let miningVisible = false;
let miningCycleStart = performance.now();
let miningPassInterval = 10000;
let miningPassDuration = 3500;
let miningDirection = 1;
let previousMiningVisible = false;

const infoText = {
  bio: {
    title: "Bio Activity",
    body: "This shows how much bioluminescent behavior is visible around the vehicle in the current zone."
  },
  temp: {
    title: "Temp",
    body: "This shows the surrounding water temperature around the submersible."
  },
  light: {
    title: "Floodlight",
    body: "White light is bright, Off keeps the scene dark, and Red helps observation with less disturbance."
  }
};

const animalLogData = [
  {
    id: "jellyfish",
    name: "Jellyfish",
    scientificName: "Aequorea victoria",
    zones: ["Sunlight Zone"],
    image: "images/jellyfish.png",
    purpose: "The jelly produces a bluish-green light when stimulated by mechanical or electrical shock, often a defense mechanism.",
    miningSensitivity: "Artificial light can overwhelm its natural glow, making communication and defense less effective."
  },
  {
    id: "comb-jellies",
    name: "Comb Jellies",
    scientificName: "Ctenophora",
    zones: ["Sunlight Zone", "Abyssal Zone"],
    image: "images/comb-jellies.png",
    purpose: "Use blue-green bioluminescent comb rows along their bodies to glow in the dark, while rainbow colors are from light refraction, not bioluminescence.",
    miningSensitivity: "Water turbulence from mining can physically damage their fragile, gelatinous bodies."
  },
  {
    id: "lantern-fish",
    name: "Lantern Fish",
    scientificName: "Myctophidae",
    zones: ["Twilight Zone"],
    image: "images/lantern-fish.png",
    purpose: "Uses rows of glowing photophores on its body to blend in with light from above and to signal to others.",
    miningSensitivity: "Light pollution can confuse their daily vertical migration patterns and group behavior."
  },
  {
    id: "viper-fish",
    name: "Viperfish",
    scientificName: "Chauliodus sloani",
    zones: ["Twilight Zone"],
    image: "images/viper-fish.png",
    purpose: "Uses glowing photophores along its belly to hide from predators and a lighted lure near its mouth to attract and quickly snap up prey.",
    miningSensitivity: "Changes in prey availability from ecosystem disruption can reduce feeding success."
  },
  {
    id: "deep-sea-hatchetfish",
    name: "Deep-sea Hatchetfish",
    scientificName: "Sternoptychidae",
    zones: ["Twilight Zone"],
    image: "images/deep-sea-hatchetfish.png",
    purpose: "Light producing organs cover its body, pointing downward to counter-illuminate against the faint light from above.",
    miningSensitivity: "Fine sediment can clog gills and reduce oxygen intake, weakening the fish over time."
  },
  {
    id: "angler-fish",
    name: "Angler Fish",
    scientificName: "Oneirodes eschrichtii",
    zones: ["Midnight Zone"],
    image: "images/angler-fish.png",
    purpose: "Uses a glowing lure on their head, powered by symbiotic bacteria, to attract prey close enough to catch.",
    miningSensitivity: "Noise and vibrations from mining equipment can disrupt its ability to detect nearby prey."
  },
  {
    id: "atolla-jellyfish",
    name: "Atolla Jellyfish",
    scientificName: "Atolla wyvillei",
    zones: ["Midnight Zone"],
    image: "images/atolla-jellyfish.png",
    purpose: "Flashes blue light from its body to attract prey and scare or distract predators, sometimes drawing in larger predators for protection.",
    miningSensitivity: "Disrupted water conditions can reduce the effectiveness of its flashing defense signals."
  },
  {
    id: "dumbo-octopus",
    name: "Dumbo Octopus",
    scientificName: "Grimpoteuthis",
    zones: ["Midnight Zone"],
    image: "images/dumbo-octopus.png",
    purpose: "Uses bioluminescence from its body especially its skin to communicate, attract mates, and possibly scare away predators in the dark deep sea.",
    miningSensitivity: "Seafloor disturbance can destroy habitat areas where it feeds and shelters."
  }
];

let scannedAnimalIds = new Set();
let hasNewLogUnlocks = false;
let scanFieldActive = false;
let scanFieldTimeout = null;
let lastScannedAnimalId = null;
let missionBriefSeen = false;
let missionCompleteAwaitingLogReview = false;
let missionCompleteShown = false;

function saveScannedAnimals() {
  // Intentionally session-only: refreshing the page resets all logbook unlocks.
}


function isMissionComplete() {
  return animalLogData.every((animal) => scannedAnimalIds.has(animal.id));
}

function openMissionCompletePanel() {
  missionCompleteAwaitingLogReview = false;
  missionCompleteShown = true;
  forceSoundOn({ restart: true });
  if (!missionCompleteOverlay) return;
  missionCompleteOverlay.classList.remove("hidden");
  missionCompleteOverlay.setAttribute("aria-hidden", "false");
}

function closeMissionCompletePanel() {
  if (!missionCompleteOverlay) return;
  missionCompleteOverlay.classList.add("hidden");
  missionCompleteOverlay.setAttribute("aria-hidden", "true");
}

function resetSessionProgress() {
  forceSoundOn({ restart: true });
  scannedAnimalIds = new Set();
  hasNewLogUnlocks = false;
  lastScannedAnimalId = null;
  missionBriefSeen = false;
  missionCompleteAwaitingLogReview = false;
  missionCompleteShown = false;
  currentLogZoneName = "Sunlight Zone";
  carouselOrder = [...animalLogData];
  carouselFocusIndex = 0;
  closeMissionCompletePanel();
  closeMissionBriefPanel();
  closeMapPanel();
  if (logCarouselOverlay) logCarouselOverlay.classList.add("hidden");
  if (animalDetailView) animalDetailView.classList.add("hidden");
  updateLogButtonUnlockState();
  window.scrollTo({ top: 0, behavior: "auto" });
  currentDepth = 0;
  handleScroll();
}

const IDLE_RESET_MS = 60000;
let idleResetTimer = null;
function scheduleIdleReset() {
  clearTimeout(idleResetTimer);
  idleResetTimer = setTimeout(resetSessionProgress, IDLE_RESET_MS);
}

function markActivity() {
  scheduleIdleReset();
  tryPendingAutoplay();
}

function isAnimalPresentInZone(animal, zone) {
  return animal.zones.includes(zone);
}

const radarDotLayout = [
  { x: 62, y: 32 },
  { x: 35, y: 63 },
  { x: 70, y: 60 },
  { x: 45, y: 28 },
  { x: 57, y: 72 },
  { x: 28, y: 45 }
];
let lastRadarZoneKey = "";
let lastRadarAnimalCount = -1;

function getAnimalsForRadarZone(zoneName) {
  if (!zoneName || zoneName === "System Standby") return [];
  return animalLogData.filter((animal) => isAnimalPresentInZone(animal, zoneName));
}

function updateRadarAnimalDots(zoneName, standby = false) {
  if (!radarAnimalDots) return;

  const animals = standby ? [] : getAnimalsForRadarZone(zoneName);
  const zoneKey = standby ? "System Standby" : zoneName;

  if (zoneKey === lastRadarZoneKey && animals.length === lastRadarAnimalCount) return;

  lastRadarZoneKey = zoneKey;
  lastRadarAnimalCount = animals.length;
  radarAnimalDots.innerHTML = "";
  radarAnimalDots.setAttribute("aria-label", animals.length ? `${animals.length} animal radar contact${animals.length === 1 ? "" : "s"}` : "No animal radar contacts");

  animals.forEach((animal, index) => {
    const dot = document.createElement("span");
    const pos = radarDotLayout[index % radarDotLayout.length];
    dot.className = "radar-animal-dot";
    dot.title = animal.name;
    dot.style.setProperty("--radar-x", `${pos.x}%`);
    dot.style.setProperty("--radar-y", `${pos.y}%`);
    dot.style.setProperty("--pulse-delay", `${index * 0.18}s`);
    radarAnimalDots.appendChild(dot);
  });
}


let carouselOrder = [...animalLogData];
let carouselFocusIndex = 0;
let currentLogZoneName = "Sunlight Zone";

function getCurrentLogZoneName() {
  if (isSurfaceLanding()) return "System Standby";
  return getZone(currentDepth).name;
}

function isAnimalUnlockedForZone(animal, zone) {
  if (zone === "System Standby") return false;
  return scannedAnimalIds.has(animal.id);
}

function getUnlockedAnimalsForZone(zone) {
  if (zone === "System Standby") return [];
  return animalLogData.filter((animal) => scannedAnimalIds.has(animal.id));
}

function updateLogButtonUnlockState() {
  if (!logCarouselBtn) return;
  logCarouselBtn.classList.toggle("has-unlocked-log", hasNewLogUnlocks);
  logCarouselBtn.setAttribute("aria-label", hasNewLogUnlocks ? "Logbook has newly unlocked animals" : "Logbook all animals locked or viewed");
}

function getScannerCenterPoint() {
  const visualSize = Math.max(190, Math.min(window.innerWidth * 0.28, 300));
  return {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2 - window.innerHeight * 0.08,
    radius: visualSize / 2
  };
}

function isPointInsideScanner(item, scanner) {
  if (!item || typeof item.x !== "number" || typeof item.y !== "number") return false;
  const dx = item.x - scanner.x;
  const dy = item.y - scanner.y;
  return Math.sqrt(dx * dx + dy * dy) <= scanner.radius;
}

function getAnimalsInsideScannerForCurrentZone() {
  const zone = getCurrentLogZoneName();
  if (zone === "System Standby") return [];
  const scanner = getScannerCenterPoint();
  const candidates = [
    { id: "jellyfish", items: jellyfish },
    { id: "comb-jellies", items: combJellies },
    { id: "lantern-fish", items: lanternfish },
    { id: "viper-fish", items: viperfish },
    { id: "deep-sea-hatchetfish", items: hatchetfish },
    { id: "angler-fish", items: anglerfish },
    { id: "atolla-jellyfish", items: atollaJellyfish },
    { id: "dumbo-octopus", items: dumboOctopus }
  ];

  return candidates
    .map((candidate) => animalLogData.find((animal) =>
      animal.id === candidate.id &&
      isAnimalPresentInZone(animal, zone) &&
      Array.isArray(candidate.items) &&
      candidate.items.some((item) => isPointInsideScanner(item, scanner))
    ))
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function getDetectedAnimalsForCurrentZone() {
  return getAnimalsInsideScannerForCurrentZone()
    .filter((animal) => !scannedAnimalIds.has(animal.id));
}

function sortAnimalsForZone(zone) {
  const alphabetical = [...animalLogData].sort((a, b) => a.name.localeCompare(b.name));
  const unlocked = alphabetical.filter((animal) => scannedAnimalIds.has(animal.id));
  const locked = alphabetical.filter((animal) => !scannedAnimalIds.has(animal.id));

  // Keep unlocked animals together in the center of the carousel so newly found
  // animals are visible immediately, while all animal names remain alphabetical
  // inside the unlocked and locked groups.
  const leftLockedCount = Math.floor(locked.length / 2);
  return [
    ...locked.slice(0, leftLockedCount),
    ...unlocked,
    ...locked.slice(leftLockedCount)
  ];
}

function getUnlockedCenterIndex(order, zone) {
  if (lastScannedAnimalId) {
    const lastScannedIndex = order.findIndex((animal) => animal.id === lastScannedAnimalId && scannedAnimalIds.has(animal.id));
    if (lastScannedIndex >= 0) return lastScannedIndex;
  }

  const unlockedIndexes = order
    .map((animal, index) => scannedAnimalIds.has(animal.id) ? index : -1)
    .filter((index) => index >= 0);

  if (unlockedIndexes.length) {
    return unlockedIndexes[Math.floor(unlockedIndexes.length / 2)];
  }

  return Math.floor(order.length / 2);
}

function getCarouselOffset(index, focusIndex, total) {
  let offset = index - focusIndex;
  const half = total / 2;
  if (offset > half) offset -= total;
  if (offset < -half) offset += total;
  return offset;
}

function openLogCarousel() {
  hasNewLogUnlocks = false;
  updateLogButtonUnlockState();
  currentLogZoneName = getCurrentLogZoneName();
  carouselOrder = sortAnimalsForZone(currentLogZoneName);
  carouselFocusIndex = getUnlockedCenterIndex(carouselOrder, currentLogZoneName);
  logCarouselZone.textContent = currentLogZoneName;
  animalDetailView.classList.add("hidden");
  logCarouselMenu.classList.remove("hidden");
  logCarouselOverlay.classList.remove("hidden");
  logCarouselOverlay.setAttribute("aria-hidden", "false");
  renderAnimalCarousel();
  updateLogButtonUnlockState();

  if (missionCompleteAwaitingLogReview && isMissionComplete() && !missionCompleteShown) {
    setTimeout(openMissionCompletePanel, 900);
  }
}

function closeLogCarouselPanel() {
  logCarouselOverlay.classList.add("hidden");
  logCarouselOverlay.setAttribute("aria-hidden", "true");
}

function moveCarousel(direction) {
  carouselFocusIndex = (carouselFocusIndex + direction + carouselOrder.length) % carouselOrder.length;
  renderAnimalCarousel();
}

function renderAnimalCarousel() {
  animalCarouselTrack.innerHTML = "";
  carouselOrder.forEach((animal, index) => {
    const unlocked = isAnimalUnlockedForZone(animal, currentLogZoneName);
    const offset = getCarouselOffset(index, carouselFocusIndex, carouselOrder.length);
    const card = document.createElement("button");
    card.className = "animal-carousel-card";
    card.style.setProperty("--offset", offset);
    card.style.setProperty("--abs-offset", Math.abs(offset));
    card.dataset.locked = unlocked ? "false" : "true";
    card.dataset.active = offset === 0 ? "true" : "false";
    card.innerHTML = `
      <div class="animal-card-image-wrap">
        <img src="${animal.image}" alt="${animal.name}" class="animal-card-image animal-card-image--${animal.id}" onerror="this.style.display=\'none\'" />
        <div class="animal-image-placeholder">${animal.name}</div>
        ${unlocked ? "" : '<div class="animal-card-lock">🔒</div>'}
      </div>
      <div class="animal-card-name">${animal.name}</div>
      <div class="animal-card-zone">${unlocked ? "Unlocked" : "Locked"}</div>
    `;
    card.addEventListener("click", () => {
      if (!unlocked) return;
      if (index !== carouselFocusIndex) {
        carouselFocusIndex = index;
        renderAnimalCarousel();
        return;
      }
      openAnimalDetail(animal);
    });
    animalCarouselTrack.appendChild(card);
  });
}

function openAnimalDetail(activeAnimal) {
  logCarouselMenu.classList.add("hidden");
  animalDetailView.classList.remove("hidden");
  renderAnimalDetailNav(activeAnimal.id);
  fillAnimalDetail(activeAnimal);
}

function renderAnimalDetailNav(activeId) {
  const unlockedAnimals = carouselOrder
    .filter((animal) => isAnimalUnlockedForZone(animal, currentLogZoneName))
    .sort((a, b) => a.name.localeCompare(b.name));
  animalDetailNav.innerHTML = "";
  unlockedAnimals.forEach((animal) => {
    const btn = document.createElement("button");
    btn.className = "animal-nav-btn";
    btn.dataset.active = animal.id === activeId ? "true" : "false";
    btn.textContent = animal.name;
    btn.addEventListener("click", () => {
      renderAnimalDetailNav(animal.id);
      fillAnimalDetail(animal);
    });
    animalDetailNav.appendChild(btn);
  });
}

function fillAnimalDetail(animal) {
  animalHeroImage.style.display = "block";
  animalHeroImage.onerror = () => { animalHeroImage.style.display = "none"; };
  animalHeroImage.src = animal.image;
  animalHeroImage.alt = animal.name;
  animalHeroImage.dataset.animalId = animal.id;
  animalScientificName.textContent = animal.scientificName;
  animalZone.textContent = animal.zones.join(" / ");
  animalPurpose.textContent = animal.purpose;
  animalSensitivity.textContent = animal.miningSensitivity;
}


const miningSummaryHTML = `
  <p><strong>Direct harm to marine life:</strong> Heavy mining machines can kill slow-moving deep-sea animals by crushing them. They also make thick sediment clouds that can cover and suffocate living things. Hot or polluted wastewater may also poison or overheat marine life.</p>
  <p><strong>Long term damage:</strong> Deep-sea mining adds strong noise and bright light to a place that is naturally dark and quiet. This can disturb feeding and breeding. Some deep-sea species grow very slowly, so if their habitat is removed, they may never recover.</p>
  <p><strong>Risk to fishing and food security:</strong> Waste from mining ships may spread far beyond the mining site. That could harm fish and other animals important to ocean food webs and fisheries.</p>
  <p><strong>Social and fairness risks:</strong> Mining would still need coastal facilities on land, which can affect communities that depend on marine resources. There are also concerns that profits may mostly benefit wealthy countries or mining companies.</p>
  <p><strong>Climate risk:</strong> The ocean helps store carbon. Damaging deep-sea ecosystems may weaken part of the ocean’s natural role in regulating climate.</p>
`;

const zoneData = [
  {
    name: "Sunlight Zone",
    min: 0,
    max: 200,
    visibility: "Very High",
    bio: "Low",
    temp: "18°C",
    oxygen: 98,
    gradient: "radial-gradient(circle at 50% 12%, rgba(255,255,255,0.22), transparent 30%), linear-gradient(to bottom, #9be5ff 0%, #6fccff 30%, #2d8dd3 68%, #0d3d73 100%)"
  },
  {
    name: "Twilight Zone",
    min: 200,
    max: 1000,
    visibility: "Medium",
    bio: "High",
    temp: "12°C",
    oxygen: 88,
    gradient: "radial-gradient(circle at 50% 10%, rgba(255,255,255,0.14), transparent 24%), linear-gradient(to bottom, #5cbdf7 0%, #2d7fcb 36%, #12467d 68%, #081e3f 100%)"
  },
  {
    name: "Midnight Zone",
    min: 1000,
    max: 4000,
    visibility: "Low",
    bio: "Extreme",
    temp: "6°C",
    oxygen: 62,
    gradient: "radial-gradient(circle at 50% 8%, rgba(255,255,255,0.08), transparent 18%), linear-gradient(to bottom, #214f97 0%, #0f2b5c 34%, #07152f 70%, #010713 100%)"
  },
  {
    name: "Abyssal Zone",
    min: 4000,
    max: 6000,
    visibility: "Very Low",
    bio: "Moderate",
    temp: "3°C",
    oxygen: 41,
    gradient: "radial-gradient(circle at 50% 7%, rgba(255,255,255,0.04), transparent 14%), linear-gradient(to bottom, #102750 0%, #06152d 35%, #010811 72%, #000000 100%)"
  },
  {
    name: "Hadal Zone",
    min: 6000,
    max: 11000,
    visibility: "Minimal",
    bio: "Low",
    temp: "2°C",
    oxygen: 22,
    gradient: "radial-gradient(circle at 50% 6%, rgba(84,247,255,0.04), transparent 14%), linear-gradient(to bottom, #07152e 0%, #020814 32%, #000000 100%)"
  }
];


/* SURFACE WAVES */
let waveCtx = null;
let waveAnimationFrame = null;
let waveOffset = 0;
let surfaceTransitionProgress = 0;

function setupSurfaceWaves() {
  if (!surfaceWaves) return;
  waveCtx = surfaceWaves.getContext("2d");
  resizeSurfaceWaves();
  animateSurfaceWaves();
}

function resizeSurfaceWaves() {
  if (!surfaceWaves || !waveCtx) return;
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;
  surfaceWaves.width = w * dpr;
  surfaceWaves.height = h * dpr;
  surfaceWaves.style.width = `${w}px`;
  surfaceWaves.style.height = `${h}px`;
  waveCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

const WAVE_LAYER_COLORS = [
  [5, 37, 127],
  [16, 90, 180],
  [70, 155, 225],
  [150, 220, 255]
];

function drawWaveLayer(baseY, amplitude, wavelength, alpha, phaseShift, color) {
  if (!waveCtx) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  waveCtx.beginPath();
  waveCtx.moveTo(0, h);

  for (let x = 0; x <= w + 12; x += 12) {
    const y = baseY
      + Math.sin((x / wavelength) + waveOffset + phaseShift) * amplitude
      + Math.sin((x / (wavelength * 0.55)) + waveOffset * 1.35 + phaseShift * 0.5) * (amplitude * 0.22);
    waveCtx.lineTo(x, y);
  }

  waveCtx.lineTo(w, h);
  waveCtx.closePath();
  waveCtx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
  waveCtx.fill();
}

function animateSurfaceWaves() {
  if (!waveCtx) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const fade = 1 - surfaceTransitionProgress;
  const lift = surfaceTransitionProgress;

  waveCtx.clearRect(0, 0, w, h);

  drawWaveLayer(h * (0.62 - lift * 0.20), 16 + lift * 2, 210, 0.22 * fade, 0.0, WAVE_LAYER_COLORS[0]);
  drawWaveLayer(h * (0.64 - lift * 0.22), 22 + lift * 3, 260, 0.26 * fade, 0.7, WAVE_LAYER_COLORS[1]);
  drawWaveLayer(h * (0.66 - lift * 0.24), 28 + lift * 4, 320, 0.3 * fade, 1.3, WAVE_LAYER_COLORS[2]);
  drawWaveLayer(h * (0.69 - lift * 0.26), 34 + lift * 5, 380, 0.34 * fade, 2.0, WAVE_LAYER_COLORS[3]);

  waveOffset += 0.022;
  waveAnimationFrame = requestAnimationFrame(animateSurfaceWaves);
}

function setSurfaceTransition(rawProgress = getScrollProgress()) {
  const transition = Math.max(0, Math.min(rawProgress / SURFACE_HOLD_PROGRESS, 1));
  surfaceTransitionProgress = transition;

  if (surfaceWaves) {
    const fade = Math.max(0, 1 - transition);
    const blur = transition * 8;
    const liftY = transition * -140;
    const rotateX = transition * 18;
    const scale = 1 + transition * 0.06;
    surfaceWaves.style.opacity = `${fade}`;
    surfaceWaves.style.transform = `perspective(1200px) translateY(${liftY}px) rotateX(${rotateX}deg) scale(${scale})`;
    surfaceWaves.style.filter = `blur(${blur}px)`;
  }

  if (descentStatus) {
    const panelFade = Math.max(0, 1 - transition * 1.22);
    const panelScale = 1 - transition * 0.05;
    const panelBlur = transition * 0.7;
    descentStatus.style.opacity = `${panelFade}`;
    descentStatus.style.transform = `scale(${panelScale})`;
    descentStatus.style.filter = `blur(${panelBlur}px)`;
  }
}

function getExperienceProgress() {
  const raw = getScrollProgress();
  if (raw <= SURFACE_HOLD_PROGRESS) return 0;
  return Math.min((raw - SURFACE_HOLD_PROGRESS) / (1 - SURFACE_HOLD_PROGRESS), 1);
}

function isSurfaceLanding(rawProgress = getScrollProgress()) {
  return rawProgress <= SURFACE_HOLD_PROGRESS;
}

function setSurfaceLandingState(active) {
  document.body.classList.toggle("surface-landing", active);
}

function setActiveModeButton(mode) {
  [whiteModeBtn, offModeBtn, redModeBtn].forEach((btn) => btn.classList.remove("active"));

  if (mode === "white") whiteModeBtn.classList.add("active");
  if (mode === "off") offModeBtn.classList.add("active");
  if (mode === "red") redModeBtn.classList.add("active");
}

function triggerRedObservation() {
  redObservationActive = true;
  secretCard.classList.remove("show");

  clearTimeout(redObservationTimeout);

  updateEnvironment(getScrollProgress());

  redObservationTimeout = setTimeout(() => {
    redObservationActive = false;
    secretCard.classList.remove("show");
    updateEnvironment(getScrollProgress());
  }, 1000);
}

function setMode(mode) {
  currentMode = mode;
  simulator.classList.remove("mode-white", "mode-off", "mode-red");
  simulator.classList.add(`mode-${mode}`);
  setActiveModeButton(mode);

  if (mode === "white") floodState.textContent = "WHITE";
  if (mode === "off") floodState.textContent = "OFF";
  if (mode === "red") floodState.textContent = "RED";

  updateEnvironment(getScrollProgress());
}

whiteModeBtn.addEventListener("click", () => {
  setMode("white");
});

offModeBtn.addEventListener("click", () => {
  setMode("off");
});

redModeBtn.addEventListener("click", () => {
  setMode("red");
  triggerRedObservation();
});

infoButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.info;
    infoPopupTitle.textContent = infoText[key].title;
    infoPopupBody.textContent = infoText[key].body;
    infoPopup.classList.remove("hidden");
  });
});

closeInfoPopup.addEventListener("click", () => {
  infoPopup.classList.add("hidden");
});

closeMiningPopup.addEventListener("click", () => {
  miningPopupOverlay.classList.add("hidden");
});

function getScrollProgress() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) return 0;
  return Math.max(0, Math.min(window.scrollY / maxScroll, 1));
}

/* DEPTH TICKS */
function buildDepthTicks() {
  depthTrack.innerHTML = "";
  const totalTicks = 21;

  for (let i = 0; i < totalTicks; i++) {
    const tick = document.createElement("div");
    tick.className = "tick";
    if (i % 5 === 0) tick.classList.add("major");
    tick.dataset.index = i;
    depthTrack.appendChild(tick);
  }
}

function updateDepthTicks(progress) {
  const ticks = [...depthTrack.querySelectorAll(".tick")];
  const center = (ticks.length - 1) / 2;
  const floatShift = progress * 220;

  ticks.forEach((tick, i) => {
    const y = (i - center) * 18 + 84 - (floatShift % 18);
    tick.style.top = `${y}px`;

    const dist = Math.abs(y - 150);
    const fade = Math.min(dist / 150, 1);

    tick.style.opacity = `${1 - fade * 0.85}`;
    tick.style.transform = `translateX(-50%) scale(${1 - fade * 0.16})`;

    if (y < -20 || y > 300) {
      tick.classList.add("hidden");
    } else {
      tick.classList.remove("hidden");
    }
  });
}

/* BUBBLES */
function createBubbles() {
  oceanParticles.innerHTML = "";
  for (let i = 0; i < 48; i++) {
    const b = document.createElement("div");
    b.className = "bubble";
    resetBubble(b, true);
    oceanParticles.appendChild(b);
  }
}

function resetBubble(el, randomY = false) {
  el.style.left = `${Math.random() * 100}%`;
  el.style.top = randomY ? `${Math.random() * 100}%` : `${100 + Math.random() * 10}%`;
  el.dataset.speed = (0.08 + Math.random() * 0.22).toFixed(3);

  const size = (2 + Math.random() * 3).toFixed(2);
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.opacity = (0.14 + Math.random() * 0.35).toFixed(2);
}

function animateParticles() {
  const bubbles = document.querySelectorAll(".bubble");

  bubbles.forEach((b) => {
    const currentTop = parseFloat(b.style.top);
    const speed = parseFloat(b.dataset.speed);
    b.style.top = `${currentTop - speed}%`;

    if (currentTop < -5) {
      resetBubble(b, false);
    }
  });

  requestAnimationFrame(animateParticles);
}

/* TERRAIN */
function updateTerrain(depth) {
  terrainLayer.innerHTML = "";
  const depthProgress = depth / maxDepth;
  const ridgeCount = Math.floor(3 + depthProgress * 8);

  for (let i = 0; i < ridgeCount; i++) {
    const ridge = document.createElement("div");
    ridge.className = "terrain-ridge";

    const width = 180 + Math.random() * 260 - depthProgress * 50;
    const height = 60 + Math.random() * 90 + depthProgress * 80;
    const left = (i / ridgeCount) * 100 + (Math.random() * 8 - 4);

    ridge.style.width = `${Math.max(100, width)}px`;
    ridge.style.height = `${height}px`;
    ridge.style.left = `calc(${left}% - ${width / 2}px)`;
    ridge.style.opacity = `${0.16 + depthProgress * 0.36}`;

    terrainLayer.appendChild(ridge);
  }
}

/* DEBRIS */
function updateDebris(depth) {
  debrisLayer.innerHTML = "";

  const depthProgress = depth / maxDepth;
  const debrisValue = Math.min(89, Math.floor(depthProgress * 100));
  debrisPercent.textContent = `${debrisValue}%`;
}

/* MARINE */
function spawnMarine(depth, mode) {
  marineLayer.innerHTML = "";

  let creatureCount = 0;
  let bioCount = 0;
  let showLoosejaw = false;

  if (depth > 400) creatureCount = 4;
  if (depth > 1200) creatureCount = 7;
  if (depth > 4000) creatureCount = 10;

  if (mode === "off") {
    if (depth > 800) bioCount = 8;
    if (depth > 2500) bioCount = 14;
    if (depth > 6000) bioCount = 18;
  }

  if (mode === "red") {
    if (depth > 800) bioCount = 10;
    if (depth > 2500) bioCount = 16;
    if (depth > 6000) bioCount = 20;
  }

  if (mode === "white") {
    if (depth > 800) bioCount = 4;
    if (depth > 2500) bioCount = 8;
    if (depth > 6000) bioCount = 10;
  }

  if (mode === "red" && redObservationActive && depth > 2500) {
    showLoosejaw = true;
  }

  const zone = getZone(depth);
  const oxygenFactor = Math.max(0.25, zone.oxygen / 100);
  const glowStrength = mode === "white" ? oxygenFactor * 0.7 : oxygenFactor;

  for (let i = 0; i < creatureCount; i++) {
    const c = document.createElement("div");
    c.className = "creature";

    const w = 14 + Math.random() * 44;
    const h = 6 + Math.random() * 18;

    c.style.width = `${w}px`;
    c.style.height = `${h}px`;
    c.style.left = `${10 + Math.random() * 80}%`;
    c.style.top = `${18 + Math.random() * 56}%`;
    c.style.opacity = mode === "white"
      ? (0.06 + Math.random() * 0.08).toFixed(2)
      : (0.14 + Math.random() * 0.14).toFixed(2);

    marineLayer.appendChild(c);
  }

  for (let i = 0; i < bioCount; i++) {
    const p = document.createElement("div");
    p.className = "bio-pulse";
    p.style.left = `${10 + Math.random() * 80}%`;
    p.style.top = `${14 + Math.random() * 62}%`;

    const duration = (2 + (1 - oxygenFactor) * 4 + Math.random() * 2).toFixed(2);
    p.style.animation = `bioBlink ${duration}s ease-in-out ${Math.random() * 3}s infinite`;
    p.style.opacity = `${0.15 + glowStrength * 0.4}`;
    p.style.transform = `scale(${0.7 + glowStrength * 0.5})`;

    if (mode === "red") {
      p.style.background = "rgba(255,90,90,0.95)";
      p.style.boxShadow = "0 0 12px rgba(255,90,90,0.7), 0 0 24px rgba(255,90,90,0.22)";
    }

    marineLayer.appendChild(p);
  }

  if (showLoosejaw) {
    const loosejaw = document.createElement("div");
    loosejaw.className = "loosejaw-secret";
    loosejaw.style.left = "58%";
    loosejaw.style.top = "46%";
    loosejaw.style.opacity = "1";
    marineLayer.appendChild(loosejaw);
    secretCard.classList.add("show");
  } else {
    secretCard.classList.remove("show");
  }
}

/* BACKGROUND FISH SCHOOL */
function buildFishSchool() {
    if (!fishSchoolLayer) return;
  
    fishSchoolLayer.innerHTML = "";
  
    const viewportHeight = window.innerHeight;
  
    // keep fish clearly above cockpit / radar
    const safeBottomPx = viewportHeight - 330;
    const safeBottomPercent = Math.max(20, (safeBottomPx / viewportHeight) * 100);
  
    // fixed swim lanes so groups don't pile up
    const lanes = [
      12,
      20,
      28,
      36,
      44,
      Math.min(52, safeBottomPercent - 10)
    ];
  
    const formations = [
      { count: 1, lane: lanes[0], depth: "far", direction: "left" },
      { count: 2, lane: lanes[1], depth: "mid", direction: "right" },
      { count: 1, lane: lanes[2], depth: "mid", direction: "left" },
      { count: 3, lane: lanes[3], depth: "far", direction: "right" },
      { count: 2, lane: lanes[4], depth: "near", direction: "left" },
      { count: 1, lane: lanes[5], depth: "mid", direction: "right" }
    ];
  
    formations.forEach((group, index) => {
      spawnPlannedGroup({
        count: group.count,
        laneTop: group.lane,
        depthClass: group.depth,
        direction: group.direction,
        groupIndex: index
      });
    });
  }
  
  function spawnPlannedGroup({ count, laneTop, depthClass, direction, groupIndex }) {
    let offsets = [0];
  
    if (count === 2) offsets = [-1.8, 1.8];
    if (count === 3) offsets = [-3, 0, 3];
    if (count === 4) offsets = [-4.2, -1.4, 1.4, 4.2];
    if (count === 5) offsets = [-5.2, -2.6, 0, 2.6, 5.2];
  
    offsets.forEach((offset, i) => {
      const fish = createSchoolFish({
        top: laneTop + offset,
        size: getFishSize(depthClass) * randomRange(0.94, 1.04),
        duration: getFishDuration(depthClass) + randomRange(-1.4, 1.4),
        delay: getNegativeDelay(12, 30) - i * 1.1 - groupIndex * 0.5,
        depthClass,
        direction
      });
  
      fishSchoolLayer.appendChild(fish);
    });
  }
  
  function createSchoolFish({ top, size, duration, delay, depthClass, direction }) {
    const wrapper = document.createElement("div");
    wrapper.className = `school-fish ${depthClass} ${direction === "right" ? "use-right" : "use-left"}`;
  
    wrapper.style.top = `${top}%`;
    wrapper.style.width = `${size}px`;
    wrapper.style.height = `${size * 0.44}px`;
    wrapper.style.animationDuration = `${duration}s`;
    wrapper.style.animationDelay = `${delay}s`;
  
    if (depthClass === "far") {
      wrapper.style.opacity = `${0.05 + Math.random() * 0.02}`;
      wrapper.style.filter = `blur(1px) brightness(${0.78 + Math.random() * 0.08})`;
    } else if (depthClass === "near") {
      wrapper.style.opacity = `${0.14 + Math.random() * 0.04}`;
      wrapper.style.filter = `blur(0.15px) brightness(${0.9 + Math.random() * 0.1})`;
    } else {
      wrapper.style.opacity = `${0.09 + Math.random() * 0.03}`;
      wrapper.style.filter = `blur(0.45px) brightness(${0.84 + Math.random() * 0.1})`;
    }
  
    wrapper.innerHTML = `
      <svg viewBox="0 0 235 104" aria-hidden="true">
        <g class="fish-body">
          <use href="#fish-symbol"></use>
        </g>
      </svg>
    `;
  
    return wrapper;
  }
  
  function getFishSize(depthClass) {
    if (depthClass === "far") return randomRange(34, 48);
    if (depthClass === "near") return randomRange(84, 112);
    return randomRange(56, 72);
  }
  
  function getFishDuration(depthClass) {
    if (depthClass === "far") return randomRange(24, 30);
    if (depthClass === "near") return randomRange(15, 20);
    return randomRange(18, 24);
  }
  
  function getNegativeDelay(minDuration, maxDuration) {
    return -randomRange(minDuration, maxDuration);
  }
  
  function randomRange(min, max) {
    return min + Math.random() * (max - min);
  }


/* LANTERNFISH - TWILIGHT ZONE ONLY */
let lanternfishCtx = null;
let lanternfish = [];
let lanternfishAnimId = null;

function setupLanternfishLayer() {
  if (!lanternfishLayer) return;
  lanternfishCtx = lanternfishLayer.getContext("2d", { alpha: true });
  resizeLanternfishCanvas();
  createLanternfishSet();

  if (!lanternfishAnimId) {
    lanternfishAnimId = requestAnimationFrame(animateLanternfish);
  }
}

function resizeLanternfishCanvas() {
  if (!lanternfishLayer || !lanternfishCtx) return;

  const w = window.innerWidth;
  const h = window.innerHeight;

  lanternfishLayer.width = w;
  lanternfishLayer.height = h;
  lanternfishLayer.style.width = `${w}px`;
  lanternfishLayer.style.height = `${h}px`;
}

function createLanternfishSet() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  lanternfish = [
    makeLanternfish({
      startX: w * 0.18,
      startY: h * 0.28,
      scale: 0.58,
      speed: 0.34,
      lane: h * 0.28,
      drift: 12,
      depth: "far"
    }),
    makeLanternfish({
      startX: w * 0.72,
      startY: h * 0.38,
      scale: 0.72,
      speed: -0.48,
      lane: h * 0.38,
      drift: 16,
      depth: "mid"
    }),
    makeLanternfish({
      startX: w * 0.34,
      startY: h * 0.48,
      scale: 0.84,
      speed: 0.58,
      lane: h * 0.48,
      drift: 19,
      depth: "near"
    })
  ];
}

function makeLanternfish({ startX, startY, scale, speed, lane, drift, depth }) {
  return {
    x: startX,
    y: startY,
    baseY: lane,
    scale,
    speed,
    drift,
    depth,
    phase: Math.random() * Math.PI * 2,
    tailPhase: Math.random() * Math.PI * 2,
    glowPhase: Math.random() * Math.PI * 2,
    bodyTilt: Math.random() * Math.PI * 2,
    eyeSize: randomRange(6, 8.4) * scale,
    bodyLength: 94 * scale,
    bodyHeight: 34 * scale,
    alpha: depth === "near" ? 0.96 : depth === "mid" ? 0.82 : 0.68
  };
}

function animateLanternfish(time) {
  if (!lanternfishCtx || !lanternfishLayer) {
    lanternfishAnimId = requestAnimationFrame(animateLanternfish);
    return;
  }

  const w = lanternfishLayer.width;
  const h = lanternfishLayer.height;

  lanternfishCtx.clearRect(0, 0, w, h);

  if (currentDepth > 200 && currentDepth <= 1000) {
    for (const fish of lanternfish) {
      fish.x += fish.speed;
      fish.y = fish.baseY + Math.sin(time * 0.001 + fish.phase) * fish.drift;

      if (fish.speed > 0 && fish.x > w + 260) {
        fish.x = -260;
        fish.baseY = randomRange(h * 0.24, h * 0.52);
      }

      if (fish.speed < 0 && fish.x < -260) {
        fish.x = w + 260;
        fish.baseY = randomRange(h * 0.24, h * 0.52);
      }

      drawLanternfish(lanternfishCtx, fish, time, currentMode);
    }
  }

  lanternfishAnimId = requestAnimationFrame(animateLanternfish);
}

function drawLanternfish(ctx, fish, time, mode) {
  const L = fish.bodyLength;
  const H = fish.bodyHeight;
  const tailBeat = Math.sin(time * 0.008 + fish.tailPhase) * H * 0.18;
  const bodyWave = Math.sin(time * 0.003 + fish.phase) * 0.06;
  const facingRight = fish.speed > 0;
  const dir = facingRight ? -1 : 1;
  const glowPulse = 0.82 + (Math.sin(time * 0.005 + fish.glowPhase) * 0.18 + 0.18);

  ctx.save();
  ctx.translate(fish.x, fish.y);
  ctx.scale(dir, 1);
  ctx.rotate(Math.sin(time * 0.0015 + fish.bodyTilt) * 0.08 + bodyWave);
  ctx.globalAlpha = fish.alpha;

  const bodyGradient = ctx.createLinearGradient(-L * 0.52, -H * 0.55, L * 0.48, H * 0.42);
  bodyGradient.addColorStop(0, "rgba(210,226,245,0.94)");
  bodyGradient.addColorStop(0.22, "rgba(168,188,220,0.92)");
  bodyGradient.addColorStop(0.5, "rgba(108,124,165,0.9)");
  bodyGradient.addColorStop(0.78, "rgba(34,42,72,0.96)");
  bodyGradient.addColorStop(1, "rgba(8,10,18,0.98)");

  const backFin = new Path2D();
  backFin.moveTo(L * 0.12, -H * 0.46);
  backFin.quadraticCurveTo(L * 0.22, -H * 0.94, L * 0.33, -H * 0.38);
  backFin.quadraticCurveTo(L * 0.24, -H * 0.34, L * 0.12, -H * 0.46);
  ctx.fillStyle = mode === "white" ? "rgba(168,186,214,0.34)" : "rgba(118,146,196,0.24)";
  ctx.fill(backFin);

  const pelvicFin = new Path2D();
  pelvicFin.moveTo(-L * 0.02, H * 0.20);
  pelvicFin.quadraticCurveTo(L * 0.03, H * 0.80, L * 0.12, H * 0.34);
  pelvicFin.quadraticCurveTo(L * 0.04, H * 0.28, -L * 0.02, H * 0.20);
  ctx.fillStyle = mode === "white" ? "rgba(168,186,214,0.28)" : "rgba(112,136,186,0.2)";
  ctx.fill(pelvicFin);

  ctx.beginPath();
  ctx.moveTo(-L * 0.52, 0);
  ctx.quadraticCurveTo(-L * 0.48, -H * 0.62, -L * 0.18, -H * 0.56);
  ctx.quadraticCurveTo(L * 0.18, -H * 0.54, L * 0.48, -H * 0.18);
  ctx.quadraticCurveTo(L * 0.58, -H * 0.08, L * 0.56, 0);
  ctx.quadraticCurveTo(L * 0.58, H * 0.14, L * 0.48, H * 0.24);
  ctx.quadraticCurveTo(L * 0.16, H * 0.56, -L * 0.24, H * 0.48);
  ctx.quadraticCurveTo(-L * 0.48, H * 0.38, -L * 0.52, 0);
  ctx.closePath();
  ctx.fillStyle = bodyGradient;
  ctx.fill();

  ctx.strokeStyle = mode === "white" ? "rgba(226,238,255,0.30)" : "rgba(145,176,224,0.18)";
  ctx.lineWidth = fish.depth === "near" ? 1.2 : 0.9;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(L * 0.42, -H * 0.13);
  ctx.quadraticCurveTo(L * 0.67, -H * 0.56 + tailBeat * 0.35, L * 0.90, -H * 0.10 + tailBeat);
  ctx.quadraticCurveTo(L * 0.72, -H * 0.03, L * 0.52, -H * 0.01);
  ctx.closePath();
  ctx.fillStyle = mode === "white" ? "rgba(188,205,228,0.22)" : "rgba(118,145,196,0.16)";
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(L * 0.42, H * 0.13);
  ctx.quadraticCurveTo(L * 0.67, H * 0.56 + tailBeat * 0.35, L * 0.90, H * 0.10 + tailBeat);
  ctx.quadraticCurveTo(L * 0.72, H * 0.03, L * 0.52, H * 0.01);
  ctx.closePath();
  ctx.fill();

  const bodySheen = ctx.createLinearGradient(-L * 0.40, -H * 0.46, L * 0.30, 0);
  bodySheen.addColorStop(0, "rgba(255,255,255,0.20)");
  bodySheen.addColorStop(0.36, "rgba(160,205,255,0.12)");
  bodySheen.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = bodySheen;
  ctx.beginPath();
  ctx.moveTo(-L * 0.40, -H * 0.18);
  ctx.quadraticCurveTo(-L * 0.06, -H * 0.48, L * 0.40, -H * 0.17);
  ctx.quadraticCurveTo(0, -H * 0.04, -L * 0.40, -H * 0.18);
  ctx.fill();

  ctx.strokeStyle = "rgba(35,44,78,0.55)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-L * 0.18, H * 0.05);
  ctx.quadraticCurveTo(L * 0.04, H * 0.09, L * 0.42, H * 0.02);
  ctx.stroke();

  // softened body texture to avoid visible dark lines sticking out of the fish
  const bodyTexture = ctx.createLinearGradient(-L * 0.06, -H * 0.30, L * 0.42, H * 0.18);
  bodyTexture.addColorStop(0, "rgba(90,108,150,0.10)");
  bodyTexture.addColorStop(1, "rgba(18,24,42,0.04)");
  ctx.strokeStyle = bodyTexture;
  for (let i = 0; i < 7; i++) {
    const sx = L * 0.02 + i * (L * 0.05);
    ctx.beginPath();
    ctx.moveTo(sx, -H * 0.26);
    ctx.quadraticCurveTo(sx + L * 0.015, -H * 0.04, sx + L * 0.005, H * 0.16);
    ctx.stroke();
  }

  const glowColor = mode === "red"
    ? `rgba(255, 116, 116, ${0.30 + glowPulse * 0.12})`
    : mode === "white"
      ? `rgba(150, 238, 255, ${0.42 + glowPulse * 0.18})`
      : `rgba(62, 220, 255, ${0.34 + glowPulse * 0.22})`;
  const glowOuter = mode === "red"
    ? `rgba(255, 92, 92, ${0.16 + glowPulse * 0.10})`
    : mode === "white"
      ? `rgba(88, 200, 255, ${0.24 + glowPulse * 0.14})`
      : `rgba(40, 170, 255, ${0.16 + glowPulse * 0.16})`;

  {
    const stomachGlow = ctx.createRadialGradient(-L * 0.04, H * 0.13, 0, -L * 0.04, H * 0.13, L * 0.38);
    stomachGlow.addColorStop(0, glowColor);
    stomachGlow.addColorStop(0.45, glowOuter);
    stomachGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = stomachGlow;
    ctx.beginPath();
    ctx.ellipse(-L * 0.02, H * 0.12, L * 0.30, H * 0.22, -0.08, 0, Math.PI * 2);
    ctx.fill();
  }

  const photoCount = 11;
  for (let i = 0; i < photoCount; i++) {
    const t = i / (photoCount - 1);
    const px = -L * 0.02 + t * L * 0.52;
    const py = H * 0.18 + Math.sin(t * Math.PI * 1.1) * H * 0.05;
    const pr = (fish.depth === "near" ? 2.8 : fish.depth === "mid" ? 2.3 : 1.9) * (0.88 + Math.sin(time * 0.004 + fish.glowPhase + i * 0.8) * 0.16);

    const dot = ctx.createRadialGradient(px, py, 0, px, py, pr * 3.8);
    if (mode === "red") {
      dot.addColorStop(0, `rgba(255, 210, 210, ${0.55 + glowPulse * 0.18})`);
      dot.addColorStop(0.28, `rgba(255, 108, 108, ${0.44 + glowPulse * 0.16})`);
      dot.addColorStop(1, "rgba(255,90,90,0)");
    } else if (mode === "off") {
      dot.addColorStop(0, `rgba(240, 255, 255, ${0.78 + glowPulse * 0.12})`);
      dot.addColorStop(0.26, `rgba(90, 232, 255, ${0.58 + glowPulse * 0.18})`);
      dot.addColorStop(1, "rgba(38,168,255,0)");
    } else {
      dot.addColorStop(0, `rgba(235, 248, 255, ${0.82 + glowPulse * 0.10})`);
      dot.addColorStop(0.24, `rgba(120, 224, 255, ${0.64 + glowPulse * 0.14})`);
      dot.addColorStop(0.52, `rgba(78, 174, 245, ${0.34 + glowPulse * 0.08})`);
      dot.addColorStop(1, "rgba(38,168,255,0)");
    }

    ctx.fillStyle = dot;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = mode === "white" ? "rgba(200,216,242,0.18)" : "rgba(84,212,255,0.20)";
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(-L * 0.06, H * 0.14);
  ctx.quadraticCurveTo(L * 0.22, H * 0.24, L * 0.50, H * 0.18);
  ctx.stroke();

  ctx.fillStyle = "rgba(188,215,236,0.92)";
  ctx.beginPath();
  ctx.ellipse(-L * 0.38, -H * 0.02, fish.eyeSize * 1.12, fish.eyeSize * 1.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(10,18,32,0.96)";
  ctx.beginPath();
  ctx.arc(-L * 0.38, -H * 0.02, fish.eyeSize * 0.58, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = mode === "red" ? "rgba(255,120,120,0.55)" : "rgba(102,255,255,0.45)";
  ctx.beginPath();
  ctx.arc(-L * 0.41, -H * 0.07, fish.eyeSize * 0.18, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(28,36,56,0.34)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-L * 0.52, H * 0.05);
  ctx.quadraticCurveTo(-L * 0.46, H * 0.13, -L * 0.37, H * 0.13);
  ctx.stroke();

  ctx.strokeStyle = "rgba(222,234,255,0.22)";
  ctx.beginPath();
  ctx.moveTo(-L * 0.50, -H * 0.02);
  ctx.quadraticCurveTo(-L * 0.42, -H * 0.20, -L * 0.25, -H * 0.18);
  ctx.stroke();

  
ctx.restore();
}


/* DEEP-SEA HATCHETFISH - TWILIGHT ZONE ONLY */
let hatchetfishCtx = null;
let hatchetfish = [];
let hatchetfishAnimId = null;

function setupHatchetfishLayer() {
  if (!hatchetfishLayer) return;
  hatchetfishCtx = hatchetfishLayer.getContext("2d", { alpha: true });
  resizeHatchetfishCanvas();
  createHatchetfishSet();

  if (!hatchetfishAnimId) {
    hatchetfishAnimId = requestAnimationFrame(animateHatchetfish);
  }
}

function resizeHatchetfishCanvas() {
  if (!hatchetfishLayer || !hatchetfishCtx) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  hatchetfishLayer.width = w;
  hatchetfishLayer.height = h;
  hatchetfishLayer.style.width = `${w}px`;
  hatchetfishLayer.style.height = `${h}px`;
}

function createHatchetfishSet() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  hatchetfish = [
    makeHatchetfish({
      startX: w * 0.24,
      startY: h * 0.31,
      scale: 0.25,
      speed: 0.28,
      lane: h * 0.31,
      drift: 10,
      depth: "far",
      lightPatternOffset: 0
    }),
    makeHatchetfish({
      startX: w * 0.78,
      startY: h * 0.43,
      scale: 0.27,
      speed: -0.32,
      lane: h * 0.43,
      drift: 13,
      depth: "mid",
      lightPatternOffset: 1
    }),
    makeHatchetfish({
      startX: w * 0.42,
      startY: h * 0.56,
      scale: 0.30,
      speed: 0.36,
      lane: h * 0.56,
      drift: 15,
      depth: "near",
      lightPatternOffset: 2
    })
  ];
}

function makeHatchetfish({ startX, startY, scale, speed, lane, drift, depth, lightPatternOffset = 0 }) {
  return {
    x: startX,
    y: startY,
    baseY: lane,
    scale,
    speed,
    drift,
    depth,
    lightPatternOffset,
    phase: Math.random() * Math.PI * 2,
    tailPhase: Math.random() * Math.PI * 2,
    glowPhase: Math.random() * Math.PI * 2,
    bodyTilt: Math.random() * Math.PI * 2,
    eyeSize: randomRange(8, 10.5) * scale,
    bodyLength: 112 * scale,
    bodyHeight: 92 * scale,
    alpha: depth === "near" ? 0.96 : depth === "mid" ? 0.82 : 0.68
  };
}

function animateHatchetfish(time) {
  if (!hatchetfishCtx || !hatchetfishLayer) {
    hatchetfishAnimId = requestAnimationFrame(animateHatchetfish);
    return;
  }

  const w = hatchetfishLayer.width;
  const h = hatchetfishLayer.height;

  hatchetfishCtx.clearRect(0, 0, w, h);

  if (currentDepth > 200 && currentDepth <= 1000) {
    for (const fish of hatchetfish) {
      fish.x += fish.speed;
      fish.y = fish.baseY + Math.sin(time * 0.001 + fish.phase) * fish.drift;

      if (fish.speed > 0 && fish.x > w + 160) {
        fish.x = -160;
        fish.baseY = randomRange(h * 0.24, h * 0.60);
      }

      if (fish.speed < 0 && fish.x < -160) {
        fish.x = w + 160;
        fish.baseY = randomRange(h * 0.24, h * 0.60);
      }

      drawHatchetfish(hatchetfishCtx, fish, time, currentMode);
    }
  }

  hatchetfishAnimId = requestAnimationFrame(animateHatchetfish);
}

function drawHatchetfish(ctx, fish, time, mode) {
  const L = fish.bodyLength;
  const H = fish.bodyHeight;
  const tailBeat = Math.sin(time * 0.010 + fish.tailPhase) * H * 0.05;
  const bodyWave = Math.sin(time * 0.0028 + fish.phase) * 0.04;
  const dir = fish.speed > 0 ? -1 : 1;
  const glowPulse = 0.82 + (Math.sin(time * 0.006 + fish.glowPhase) * 0.18 + 0.18);

  ctx.save();
  ctx.translate(fish.x, fish.y);
  ctx.scale(dir, 1);
  ctx.rotate(Math.sin(time * 0.0014 + fish.bodyTilt) * 0.06 + bodyWave);
  ctx.globalAlpha = fish.alpha;

  const bodyGradient = ctx.createLinearGradient(-L * 0.50, -H * 0.44, L * 0.34, H * 0.46);
  bodyGradient.addColorStop(0, "rgba(220,232,245,0.96)");
  bodyGradient.addColorStop(0.22, "rgba(180,194,214,0.94)");
  bodyGradient.addColorStop(0.52, "rgba(112,124,148,0.92)");
  bodyGradient.addColorStop(0.82, "rgba(28,34,52,0.96)");
  bodyGradient.addColorStop(1, "rgba(8,10,16,0.98)");

  const bodyPath = new Path2D();
  bodyPath.moveTo(-L * 0.46, 0);
  bodyPath.quadraticCurveTo(-L * 0.44, -H * 0.40, -L * 0.22, -H * 0.50);
  bodyPath.quadraticCurveTo(L * 0.02, -H * 0.54, L * 0.16, -H * 0.26);
  bodyPath.quadraticCurveTo(L * 0.28, -H * 0.08, L * 0.26, 0);
  bodyPath.quadraticCurveTo(L * 0.30, H * 0.16, L * 0.14, H * 0.38);
  bodyPath.quadraticCurveTo(-L * 0.02, H * 0.58, -L * 0.24, H * 0.52);
  bodyPath.quadraticCurveTo(-L * 0.42, H * 0.42, -L * 0.46, 0);
  bodyPath.closePath();
  ctx.fillStyle = bodyGradient;
  ctx.fill(bodyPath);

  ctx.strokeStyle = mode === "white" ? "rgba(236,242,255,0.26)" : "rgba(112,186,228,0.16)";
  ctx.lineWidth = fish.depth === "near" ? 1.1 : 0.9;
  ctx.stroke(bodyPath);

  const dorsalFin = new Path2D();
  dorsalFin.moveTo(-L * 0.02, -H * 0.44);
  dorsalFin.quadraticCurveTo(L * 0.04, -H * 0.72, L * 0.12, -H * 0.38);
  dorsalFin.quadraticCurveTo(L * 0.04, -H * 0.36, -L * 0.02, -H * 0.44);
  ctx.fillStyle = mode === "white" ? "rgba(178,196,220,0.24)" : "rgba(108,144,186,0.18)";
  ctx.fill(dorsalFin);

  const pelvicFin = new Path2D();
  pelvicFin.moveTo(-L * 0.04, H * 0.22);
  pelvicFin.quadraticCurveTo(L * 0.00, H * 0.48, L * 0.08, H * 0.26);
  pelvicFin.quadraticCurveTo(L * 0.02, H * 0.24, -L * 0.04, H * 0.22);
  ctx.fill(pelvicFin);

  ctx.beginPath();
  ctx.moveTo(L * 0.20, -H * 0.06);
  ctx.quadraticCurveTo(L * 0.44, -H * 0.28 + tailBeat * 0.35, L * 0.72, -H * 0.04 + tailBeat);
  ctx.quadraticCurveTo(L * 0.48, 0, L * 0.24, H * 0.02);
  ctx.closePath();
  ctx.fillStyle = mode === "white" ? "rgba(190,210,232,0.18)" : "rgba(118,145,186,0.15)";
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(L * 0.20, H * 0.06);
  ctx.quadraticCurveTo(L * 0.44, H * 0.28 + tailBeat * 0.35, L * 0.72, H * 0.04 + tailBeat);
  ctx.quadraticCurveTo(L * 0.48, 0, L * 0.24, -H * 0.02);
  ctx.closePath();
  ctx.fill();

  const bellySheen = ctx.createLinearGradient(-L * 0.24, H * 0.04, L * 0.14, H * 0.56);
  bellySheen.addColorStop(0, "rgba(255,255,255,0.12)");
  bellySheen.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = bellySheen;
  ctx.beginPath();
  ctx.ellipse(-L * 0.05, H * 0.20, L * 0.26, H * 0.26, -0.16, 0, Math.PI * 2);
  ctx.fill();

  const headPlate = ctx.createLinearGradient(-L * 0.44, -H * 0.12, -L * 0.14, H * 0.18);
  headPlate.addColorStop(0, "rgba(162,176,196,0.72)");
  headPlate.addColorStop(1, "rgba(38,46,64,0.08)");
  ctx.fillStyle = headPlate;
  ctx.beginPath();
  ctx.moveTo(-L * 0.44, 0);
  ctx.quadraticCurveTo(-L * 0.36, -H * 0.26, -L * 0.18, -H * 0.18);
  ctx.quadraticCurveTo(-L * 0.26, H * 0.22, -L * 0.44, 0);
  ctx.fill();

  ctx.strokeStyle = "rgba(46,54,74,0.40)";
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(-L * 0.18, -H * 0.16);
  ctx.quadraticCurveTo(-L * 0.08, 0, -L * 0.12, H * 0.20);
  ctx.stroke();

  ctx.fillStyle = "rgba(194,214,236,0.94)";
  ctx.beginPath();
  ctx.ellipse(-L * 0.28, -H * 0.04, fish.eyeSize * 1.18, fish.eyeSize * 1.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(18,22,38,0.98)";
  ctx.beginPath();
  ctx.arc(-L * 0.28, -H * 0.04, fish.eyeSize * 0.60, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = mode === "red" ? "rgba(255,126,126,0.48)" : "rgba(118,245,255,0.42)";
  ctx.beginPath();
  ctx.arc(-L * 0.31, -H * 0.09, fish.eyeSize * 0.18, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(26,32,46,0.40)";
  ctx.beginPath();
  ctx.moveTo(-L * 0.45, H * 0.05);
  ctx.quadraticCurveTo(-L * 0.33, H * 0.18, -L * 0.20, H * 0.16);
  ctx.stroke();

  const photoRows = [
    { yOffset: 0.20, count: 5, spread: 0.34, size: 2.1 },
    { yOffset: 0.28, count: 6, spread: 0.42, size: 2.2 }
  ];

  for (let rowIndex = 0; rowIndex < photoRows.length; rowIndex++) {
    const row = photoRows[rowIndex];
    for (let i = 0; i < row.count; i++) {
      const t = row.count === 1 ? 0 : i / (row.count - 1);
      const px = -L * 0.16 + t * L * row.spread;
      const py = H * row.yOffset + Math.sin((t * Math.PI * 1.2) + fish.lightPatternOffset * 0.45 + rowIndex * 0.6) * H * 0.018;
      const pr = row.size * fish.scale * (0.94 + Math.sin(time * 0.004 + fish.glowPhase + i * 0.7 + rowIndex) * 0.18);
      const dot = ctx.createRadialGradient(px, py, 0, px, py, pr * 4.4);

      if (mode === "red") {
        dot.addColorStop(0, `rgba(255, 232, 232, ${0.48 + glowPulse * 0.12})`);
        dot.addColorStop(0.32, `rgba(255, 110, 110, ${0.38 + glowPulse * 0.14})`);
        dot.addColorStop(1, "rgba(255,90,90,0)");
      } else if (mode === "off") {
        dot.addColorStop(0, `rgba(238, 252, 255, ${0.70 + glowPulse * 0.10})`);
        dot.addColorStop(0.26, `rgba(110, 236, 255, ${0.52 + glowPulse * 0.18})`);
        dot.addColorStop(1, "rgba(44,170,255,0)");
      } else {
        dot.addColorStop(0, `rgba(246, 252, 255, ${0.76 + glowPulse * 0.10})`);
        dot.addColorStop(0.28, `rgba(124, 230, 255, ${0.58 + glowPulse * 0.14})`);
        dot.addColorStop(0.58, `rgba(78, 178, 248, ${0.28 + glowPulse * 0.08})`);
        dot.addColorStop(1, "rgba(38,168,255,0)");
      }

      ctx.fillStyle = dot;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}


/* VIPERFISH - TWILIGHT ZONE ONLY */
let viperfishCtx = null;
let viperfish = [];
let viperfishAnimId = null;

function setupViperfishLayer() {
  if (!viperfishLayer) return;
  viperfishCtx = viperfishLayer.getContext("2d", { alpha: true });
  resizeViperfishCanvas();
  createViperfishSet();

  if (!viperfishAnimId) {
    viperfishAnimId = requestAnimationFrame(animateViperfish);
  }
}

function resizeViperfishCanvas() {
  if (!viperfishLayer || !viperfishCtx) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  viperfishLayer.width = w;
  viperfishLayer.height = h;
  viperfishLayer.style.width = `${w}px`;
  viperfishLayer.style.height = `${h}px`;
}

function createViperfishSet() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  viperfish = [
    makeViperfish({ startX: w * 0.70, startY: h * 0.24, scale: 0.78, speed: -0.26, lane: h * 0.24, drift: 10, depth: "far" }),
    makeViperfish({ startX: w * 0.84, startY: h * 0.40, scale: 0.88, speed: -0.34, lane: h * 0.40, drift: 14, depth: "mid" }),
    makeViperfish({ startX: w * 0.48, startY: h * 0.58, scale: 0.98, speed: -0.30, lane: h * 0.58, drift: 12, depth: "near" })
  ];
}

function makeViperfish({ startX, startY, scale, speed, lane, drift, depth }) {
  return {
    x: startX, y: startY, baseY: lane, scale, speed, drift, depth,
    phase: Math.random() * Math.PI * 2,
    tailPhase: Math.random() * Math.PI * 2,
    glowPhase: Math.random() * Math.PI * 2,
    bodyTilt: Math.random() * Math.PI * 2,
    eyeSize: randomRange(4.8, 6.4) * scale,
    bodyLength: 190 * scale,
    bodyHeight: 26 * scale,
    alpha: depth === "near" ? 0.92 : depth === "mid" ? 0.76 : 0.62
  };
}

function animateViperfish(time) {
  if (!viperfishCtx || !viperfishLayer) {
    viperfishAnimId = requestAnimationFrame(animateViperfish);
    return;
  }
  const w = viperfishLayer.width;
  const h = viperfishLayer.height;
  viperfishCtx.clearRect(0, 0, w, h);

  if (currentDepth > 200 && currentDepth <= 1000) {
    for (const fish of viperfish) {
      fish.x += fish.speed;
      fish.y = fish.baseY + Math.sin(time * 0.0012 + fish.phase) * fish.drift;

      if (fish.speed < 0 && fish.x < -240) {
        fish.x = w + 240;
        fish.baseY = randomRange(h * 0.20, h * 0.62);
      }

      drawViperfish(viperfishCtx, fish, time, currentMode);
    }
  }

  viperfishAnimId = requestAnimationFrame(animateViperfish);
}

function drawViperfish(ctx, fish, time, mode) {
  const L = fish.bodyLength;
  const H = fish.bodyHeight;
  const tailBeat = Math.sin(time * 0.009 + fish.tailPhase) * H * 0.22;
  const bodyWave = Math.sin(time * 0.0035 + fish.phase) * 0.05;
  const glowPulse = 0.78 + (Math.sin(time * 0.006 + fish.glowPhase) * 0.18 + 0.18);
  const dir = fish.speed > 0 ? -1 : 1;

  ctx.save();
  ctx.translate(fish.x, fish.y);
  ctx.scale(dir, 1);
  ctx.rotate(Math.sin(time * 0.0016 + fish.bodyTilt) * 0.07 + bodyWave);
  ctx.globalAlpha = fish.alpha;

  const bodyGradient = ctx.createLinearGradient(-L * 0.52, -H * 0.4, L * 0.52, H * 0.34);
  bodyGradient.addColorStop(0, "rgba(92,108,140,0.14)");
  bodyGradient.addColorStop(0.16, "rgba(122,134,156,0.34)");
  bodyGradient.addColorStop(0.48, "rgba(116,100,92,0.52)");
  bodyGradient.addColorStop(0.78, "rgba(52,42,40,0.82)");
  bodyGradient.addColorStop(1, "rgba(12,12,16,0.92)");

  ctx.beginPath();
  ctx.moveTo(-L * 0.56, 0);
  ctx.quadraticCurveTo(-L * 0.42, -H * 0.40, L * 0.20, -H * 0.46);
  ctx.quadraticCurveTo(L * 0.50, -H * 0.44, L * 0.56, -H * 0.14);
  ctx.quadraticCurveTo(L * 0.62, 0, L * 0.54, H * 0.20);
  ctx.quadraticCurveTo(L * 0.30, H * 0.46, -L * 0.22, H * 0.34);
  ctx.quadraticCurveTo(-L * 0.48, H * 0.26, -L * 0.56, 0);
  ctx.closePath();
  ctx.fillStyle = bodyGradient;
  ctx.fill();

  ctx.strokeStyle = mode === "white" ? "rgba(212,226,255,0.18)" : "rgba(110,144,188,0.14)";
  ctx.lineWidth = fish.depth === "near" ? 1 : 0.8;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(L * 0.42, -H * 0.07);
  ctx.quadraticCurveTo(L * 0.70, -H * 0.44 + tailBeat * 0.25, L * 0.94, -H * 0.12 + tailBeat);
  ctx.quadraticCurveTo(L * 0.72, -H * 0.02, L * 0.52, 0);
  ctx.closePath();
  ctx.fillStyle = "rgba(110,126,160,0.18)";
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(L * 0.42, H * 0.07);
  ctx.quadraticCurveTo(L * 0.70, H * 0.44 + tailBeat * 0.25, L * 0.94, H * 0.12 + tailBeat);
  ctx.quadraticCurveTo(L * 0.72, H * 0.02, L * 0.52, 0);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-L * 0.06, -H * 0.34);
  ctx.quadraticCurveTo(L * 0.03, -H * 0.84, L * 0.10, -H * 0.20);
  ctx.strokeStyle = "rgba(118,134,174,0.22)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-L * 0.08, -H * 0.28);
  ctx.quadraticCurveTo(L * 0.18, -H * 1.32, L * 0.26, -H * 0.24);
  ctx.strokeStyle = mode === "red" ? "rgba(255,120,120,0.30)" : "rgba(180,220,255,0.22)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "rgba(16,18,24,0.84)";
  ctx.beginPath();
  ctx.moveTo(-L * 0.56, -H * 0.02);
  ctx.quadraticCurveTo(-L * 0.48, -H * 0.42, -L * 0.34, -H * 0.34);
  ctx.quadraticCurveTo(-L * 0.28, -H * 0.06, -L * 0.44, H * 0.04);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-L * 0.54, H * 0.02);
  ctx.quadraticCurveTo(-L * 0.46, H * 0.42, -L * 0.30, H * 0.28);
  ctx.quadraticCurveTo(-L * 0.28, H * 0.08, -L * 0.44, 0);
  ctx.closePath();
  ctx.fillStyle = "rgba(24,22,28,0.92)";
  ctx.fill();

  ctx.strokeStyle = mode === "red" ? "rgba(255,236,236,0.92)" : "rgba(248,250,255,0.92)";
  ctx.lineWidth = fish.depth === "near" ? 0.46 : fish.depth === "mid" ? 0.40 : 0.34;
  ctx.lineCap = "round";
  // Smaller viperfish needle teeth, fitted tightly inside the mouth so they do not look like hair.
  for (let i = 0; i < 20; i++) {
    const t = i / 19;
    const baseX = -L * 0.535 + t * L * 0.205;
    const baseY = -H * (0.015 + 0.060 * Math.sin(t * Math.PI));
    const len = H * (0.24 + 0.10 * Math.abs(Math.sin(i * 1.7)));
    const tipX = baseX - L * (0.010 + 0.006 * Math.sin(i));
    const tipY = baseY + len;
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();
  }
  for (let i = 0; i < 20; i++) {
    const t = i / 19;
    const baseX = -L * 0.532 + t * L * 0.205;
    const baseY = H * (0.035 + 0.052 * Math.sin(t * Math.PI));
    const len = H * (0.25 + 0.11 * Math.abs(Math.cos(i * 1.9)));
    const tipX = baseX - L * (0.009 + 0.006 * Math.cos(i));
    const tipY = baseY - len;
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();
  }


  const glowColor = mode === "red" ? `rgba(255, 116, 116, ${0.28 + glowPulse * 0.12})` : mode === "white" ? `rgba(150, 238, 255, ${0.34 + glowPulse * 0.16})` : `rgba(62, 220, 255, ${0.38 + glowPulse * 0.18})`;
  const glowOuter = mode === "red" ? `rgba(255, 92, 92, ${0.14 + glowPulse * 0.10})` : mode === "white" ? `rgba(88, 200, 255, ${0.20 + glowPulse * 0.12})` : `rgba(40, 170, 255, ${0.20 + glowPulse * 0.15})`;

  const bellyGlow = ctx.createRadialGradient(L * 0.02, H * 0.14, 0, L * 0.02, H * 0.14, L * 0.42);
  bellyGlow.addColorStop(0, glowColor);
  bellyGlow.addColorStop(0.42, glowOuter);
  bellyGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = bellyGlow;
  ctx.beginPath();
  ctx.ellipse(L * 0.00, H * 0.12, L * 0.30, H * 0.18, -0.04, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const px = -L * 0.22 + t * L * 0.72;
    const py = H * 0.18 + Math.sin(t * Math.PI * 1.1) * H * 0.04;
    const pr = (fish.depth === "near" ? 2.2 : fish.depth === "mid" ? 1.9 : 1.6) * (0.9 + Math.sin(time * 0.004 + fish.glowPhase + i * 0.8) * 0.14);
    const dot = ctx.createRadialGradient(px, py, 0, px, py, pr * 3.8);
    if (mode === "red") {
      dot.addColorStop(0, `rgba(255, 210, 210, ${0.52 + glowPulse * 0.14})`);
      dot.addColorStop(0.30, `rgba(255, 108, 108, ${0.40 + glowPulse * 0.14})`);
      dot.addColorStop(1, "rgba(255,90,90,0)");
    } else if (mode === "off") {
      dot.addColorStop(0, `rgba(240, 255, 255, ${0.76 + glowPulse * 0.10})`);
      dot.addColorStop(0.28, `rgba(90, 232, 255, ${0.56 + glowPulse * 0.14})`);
      dot.addColorStop(1, "rgba(38,168,255,0)");
    } else {
      dot.addColorStop(0, `rgba(235, 248, 255, ${0.80 + glowPulse * 0.08})`);
      dot.addColorStop(0.26, `rgba(120, 224, 255, ${0.60 + glowPulse * 0.12})`);
      dot.addColorStop(0.54, `rgba(78, 174, 245, ${0.30 + glowPulse * 0.08})`);
      dot.addColorStop(1, "rgba(38,168,255,0)");
    }

    ctx.fillStyle = dot;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }

  const headGlow = ctx.createLinearGradient(-L * 0.52, -H * 0.32, -L * 0.18, H * 0.18);
  headGlow.addColorStop(0, "rgba(210,220,235,0.20)");
  headGlow.addColorStop(0.35, "rgba(128,132,146,0.12)");
  headGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = headGlow;
  ctx.beginPath();
  ctx.moveTo(-L * 0.50, -H * 0.22);
  ctx.quadraticCurveTo(-L * 0.36, -H * 0.46, -L * 0.22, -H * 0.22);
  ctx.quadraticCurveTo(-L * 0.30, H * 0.08, -L * 0.46, H * 0.04);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(198,215,232,0.84)";
  ctx.beginPath();
  ctx.ellipse(-L * 0.34, -H * 0.02, fish.eyeSize * 1.2, fish.eyeSize * 1.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(8,16,28,0.95)";
  ctx.beginPath();
  ctx.arc(-L * 0.34, -H * 0.02, fish.eyeSize * 0.62, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/* ANGLERFISH - MIDNIGHT ZONE ONLY - small, behind controls, viperfish-style swim */
let anglerfishCtx = null;
let anglerfish = [];
let anglerfishAnimId = null;

function setupAnglerfishLayer() {
  if (!anglerfishLayer) return;
  anglerfishCtx = anglerfishLayer.getContext("2d", { alpha: true });
  resizeAnglerfishCanvas();
  createAnglerfishSet();
  if (!anglerfishAnimId) anglerfishAnimId = requestAnimationFrame(animateAnglerfish);
}
function resizeAnglerfishCanvas() {
  if (!anglerfishLayer || !anglerfishCtx) return;
  const w = window.innerWidth, h = window.innerHeight;
  anglerfishLayer.width = w; anglerfishLayer.height = h;
  anglerfishLayer.style.width = `${w}px`; anglerfishLayer.style.height = `${h}px`;
}
function createAnglerfishSet() {
  const w = window.innerWidth, h = window.innerHeight;
  anglerfish = [
    { x:w*.88, y:h*.30, baseY:h*.30, scale:.34, speed:-.23, drift:9, p:1.2, a:.78 },
    { x:w*1.06, y:h*.46, baseY:h*.46, scale:.40, speed:-.29, drift:12, p:2.5, a:.86 },
    { x:w*.72, y:h*.55, baseY:h*.55, scale:.47, speed:-.26, drift:8, p:4.1, a:.90 }
  ];
}
function animateAnglerfish(time) {
  if (!anglerfishCtx || !anglerfishLayer) { anglerfishAnimId = requestAnimationFrame(animateAnglerfish); return; }
  const w = anglerfishLayer.width, h = anglerfishLayer.height;
  anglerfishCtx.clearRect(0,0,w,h);
  if (currentDepth >= 1000 && currentDepth <= 4000) {
    for (const f of anglerfish) {
      f.x += f.speed;
      f.y = f.baseY + Math.sin(time*.0011 + f.p) * f.drift;
      if (f.speed > 0 && f.x > w + 250) { f.x = -250; f.baseY = randomRange(h*.20,h*.68); }
      if (f.speed < 0 && f.x < -170) { f.x = w + 170; f.baseY = randomRange(h*.24,h*.64); }
      drawAnglerfish(anglerfishCtx, f, time, currentMode);
    }
  }
  anglerfishAnimId = requestAnimationFrame(animateAnglerfish);
}
function drawAnglerfish(ctx, f, time, mode) {
  const S=f.scale, L=210*S, H=84*S, dir=f.speed>0?-1:1;
  const blue = mode === "off" || mode === "red";
  const pulse = .8 + Math.sin(time*.006+f.p)*.2;
  ctx.save(); ctx.translate(f.x,f.y); ctx.scale(dir,1); ctx.rotate(Math.sin(time*.0015+f.p)*.06); ctx.globalAlpha=f.a;
  const tail = Math.sin(time*.008+f.p)*12*S;
  ctx.fillStyle='rgba(42,56,68,.55)'; ctx.strokeStyle='rgba(125,160,185,.26)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(L*.42,-H*.18); ctx.quadraticCurveTo(L*.82,-H*.55+tail,L*.98,-H*.08+tail); ctx.quadraticCurveTo(L*.75,0,L*.98,H*.23+tail); ctx.quadraticCurveTo(L*.76,H*.55+tail,L*.42,H*.18); ctx.closePath(); ctx.fill(); ctx.stroke();
  const g=ctx.createLinearGradient(-L*.66,-H*.6,L*.5,H*.5);
  g.addColorStop(0,'rgba(92,72,55,.95)'); g.addColorStop(.38,'rgba(46,38,34,.98)'); g.addColorStop(.75,'rgba(18,17,19,.99)'); g.addColorStop(1,'rgba(4,5,8,.99)');
  ctx.fillStyle=g; ctx.strokeStyle='rgba(180,200,220,.18)'; ctx.lineWidth=1.2*S;
  ctx.beginPath(); ctx.moveTo(-L*.64,-H*.06); ctx.bezierCurveTo(-L*.58,-H*.78,-L*.12,-H*.72,L*.34,-H*.30); ctx.bezierCurveTo(L*.58,-H*.06,L*.56,H*.25,L*.18,H*.44); ctx.bezierCurveTo(-L*.20,H*.66,-L*.56,H*.46,-L*.66,H*.16); ctx.bezierCurveTo(-L*.73,H*.02,-L*.70,-H*.03,-L*.64,-H*.06); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle='rgba(95,118,138,.32)'; ctx.beginPath(); ctx.moveTo(-L*.06,-H*.52); ctx.quadraticCurveTo(L*.04,-H*1.02,L*.18,-H*.47); ctx.quadraticCurveTo(L*.05,-H*.40,-L*.06,-H*.52); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-L*.02,H*.08); ctx.quadraticCurveTo(L*.14,H*.55,L*.28,H*.10); ctx.quadraticCurveTo(L*.11,H*.02,-L*.02,H*.08); ctx.fill();
  // Anglerfish mouth backing: shaped to follow the teeth cluster instead of looking like a separate round circle.
  // Only the black mouth shape was changed here; fish size, teeth, glow, swimming, and placement stay the same.
  ctx.fillStyle='rgba(30,20,10,0.98)';
  ctx.beginPath();
  ctx.moveTo(-L*.86, H*.05);
  ctx.bezierCurveTo(-L*.76, -H*.02, -L*.54, H*.00, -L*.33, H*.07);
  ctx.quadraticCurveTo(-L*.22, H*.11, -L*.18, H*.18);
  ctx.quadraticCurveTo(-L*.25, H*.29, -L*.38, H*.37);
  ctx.bezierCurveTo(-L*.58, H*.49, -L*.79, H*.47, -L*.88, H*.35);
  ctx.bezierCurveTo(-L*.96, H*.25, -L*.95, H*.13, -L*.86, H*.05);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle=blue?'rgba(215,248,255,.98)':'rgba(245,250,255,.95)'; ctx.lineWidth=0.62*S; ctx.lineCap='round';
  // Dense, uneven, interlocking translucent needle teeth for the gaping anglerfish mouth.
  // Lowered to sit inside the black mouth shape.
  const mouthToothDrop = H * 0.16;
  for(let i=0;i<28;i++){let t=i/27,x=-L*.82+t*L*.47;let top=-H*(.01+.22*Math.sin(t*Math.PI)) + mouthToothDrop;let len=H*(.12+.14*Math.abs(Math.sin(i*1.7)));ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x+L*(.010+.008*Math.sin(i)),top+len);ctx.stroke();}
  for(let i=0;i<28;i++){let t=i/27,x=-L*.82+t*L*.47;let bot=H*(.05+.23*Math.sin(t*Math.PI)) + mouthToothDrop;let len=H*(.13+.15*Math.abs(Math.cos(i*1.9)));ctx.beginPath();ctx.moveTo(x,bot);ctx.lineTo(x-L*(.009+.008*Math.cos(i)),bot-len);ctx.stroke();}
  ctx.fillStyle=blue?'rgba(150,225,255,.95)':'rgba(175,190,205,.72)'; ctx.beginPath(); ctx.arc(-L*.43,-H*.30,7*S,0,Math.PI*2); ctx.fill(); ctx.fillStyle='rgba(2,7,14,.96)'; ctx.beginPath(); ctx.arc(-L*.43,-H*.30,3.4*S,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle=blue?'rgba(95,220,255,.82)':'rgba(155,165,175,.45)'; ctx.lineWidth=2*S; ctx.beginPath(); ctx.moveTo(-L*.30,-H*.54); ctx.quadraticCurveTo(-L*.50,-H*1.15,-L*.12,-H*1.36); ctx.stroke();
  const lx=-L*.12, ly=-H*1.36;
  if(blue){const bg=ctx.createRadialGradient(lx,ly,0,lx,ly,60*S*pulse); bg.addColorStop(0,'rgba(250,255,255,1)'); bg.addColorStop(.22,'rgba(80,230,255,.96)'); bg.addColorStop(.58,'rgba(25,150,255,.58)'); bg.addColorStop(1,'rgba(0,90,255,0)'); ctx.fillStyle=bg; ctx.beginPath(); ctx.arc(lx,ly,60*S*pulse,0,Math.PI*2); ctx.fill();}
  ctx.fillStyle=blue?'rgba(235,255,255,1)':'rgba(190,195,205,.60)'; ctx.beginPath(); ctx.ellipse(lx,ly,10*S,7*S,.35,0,Math.PI*2); ctx.fill();
  if(blue){ctx.strokeStyle=`rgba(70,220,255,${.36+pulse*.2})`;ctx.lineWidth=1.4*S;ctx.beginPath();ctx.moveTo(-L*.48,H*.34);ctx.quadraticCurveTo(-L*.05,H*.52,L*.36,H*.25);ctx.stroke();for(let i=0;i<12;i++){let t=i/11,px=-L*.45+t*L*.82,py=H*(.29+.08*Math.sin(t*Math.PI));let d=ctx.createRadialGradient(px,py,0,px,py,9*S);d.addColorStop(0,'rgba(235,255,255,.95)');d.addColorStop(.4,'rgba(80,225,255,.75)');d.addColorStop(1,'rgba(30,145,255,0)');ctx.fillStyle=d;ctx.beginPath();ctx.arc(px,py,3*S,0,Math.PI*2);ctx.fill();}}
  ctx.restore();
}


/* JELLYFISH - MOVING SUNLIGHT ZONE ONLY */
let jellyCtx = null;
let jellyfish = [];
let jellyAnimId = null;

function setupJellyfishLayer() {
  if (!jellyfishLayer) return;
  jellyCtx = jellyfishLayer.getContext("2d", { alpha: true });
  resizeJellyfishCanvas();
  createJellyfishSet();

  if (!jellyAnimId) {
    jellyAnimId = requestAnimationFrame(animateJellyfish);
  }
}

function resizeJellyfishCanvas() {
  if (!jellyfishLayer || !jellyCtx) return;

  const w = window.innerWidth;
  const h = window.innerHeight;

  jellyfishLayer.width = w;
  jellyfishLayer.height = h;
  jellyfishLayer.style.width = `${w}px`;
  jellyfishLayer.style.height = `${h}px`;
}

function createJellyfishSet() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  jellyfish = [
    makeJelly({
      startX: -140,
      startY: h * 0.18,
      scale: 0.60,
      depth: "far",
      speed: 0.22,
      lane: h * 0.18,
      drift: 10
    }),
    makeJelly({
      startX: w + 120,
      startY: h * 0.28,
      scale: 0.58,
      depth: "mid",
      speed: -0.34,
      lane: h * 0.28,
      drift: 14
    }),
    makeJelly({
      startX: -220,
      startY: h * 0.40,
      scale: 1.12,
      depth: "near",
      speed: 0.48,
      lane: h * 0.40,
      drift: 18
    }),
    makeJelly({
      startX: w + 160,
      startY: h * 0.14,
      scale: 0.52,
      depth: "far",
      speed: -0.18,
      lane: h * 0.14,
      drift: 8
    })
  ];
}

function makeJelly({ startX, startY, scale, depth, speed, lane, drift }) {
    const size = 25 * scale;
  
    return {
      x: startX,
      y: startY,
      baseY: lane,
      scale,
      depth,
      speed,
      drift,
      phase: Math.random() * Math.PI * 2,
      pulse: Math.random() * Math.PI * 2,
      tilt: Math.random() * Math.PI * 2,
      size,
      alpha: depth === "near" ? 0.56 : depth === "mid" ? 0.40 : 0.26,
      lineWidth: depth === "near" ? 1.6 : depth === "mid" ? 1.2 : 0.9,
      tentacles: depth === "near" ? 10 : depth === "mid" ? 9 : 8
    };
}

function animateJellyfish(time) {
  if (!jellyCtx || !jellyfishLayer) {
    jellyAnimId = requestAnimationFrame(animateJellyfish);
    return;
  }

  const w = jellyfishLayer.width;
  const h = jellyfishLayer.height;

  jellyCtx.clearRect(0, 0, w, h);

  if (currentDepth <= 200) {
    for (const j of jellyfish) {
      j.x += j.speed;
      j.y = j.baseY + Math.sin(time * 0.0012 + j.phase) * j.drift;

      if (j.speed > 0 && j.x > w + 220) {
        j.x = -220;
        j.baseY = randomRange(h * 0.10, h * 0.46);
      }

      if (j.speed < 0 && j.x < -220) {
        j.x = w + 220;
        j.baseY = randomRange(h * 0.10, h * 0.46);
      }

      drawBetterJellyfish(jellyCtx, j, time, currentMode);
    }
  }

  jellyAnimId = requestAnimationFrame(animateJellyfish);
}

function drawBetterJellyfish(ctx, j, time, mode) {
    const pulse = 1 + Math.sin(time * 0.003 + j.pulse) * 0.05;
    const r = j.size * pulse;
    const facingRight = j.speed > 0;
    const dir = facingRight ? 1 : -1;
    const tilt = Math.sin(time * 0.0013 + j.tilt) * 0.10;
  
    ctx.save();
    ctx.translate(j.x, j.y);
    ctx.scale(dir, 1);
    ctx.rotate(tilt);
    ctx.globalAlpha = j.alpha;
  
    const capHalfW = r * 1.22;
    const capTopY = -r * 0.92;
    const capBottomY = r * 0.08;
  
   /* core-only bioluminescent glow in dark/red modes */
  const coreGlowActive = mode === "off" || mode === "red";
  const coreGlowPulse = 0.78 + Math.sin(time * 0.004 + j.pulse) * 0.22;
  if (coreGlowActive) {
    const glow = ctx.createRadialGradient(0, -r * 0.04, 0, 0, -r * 0.04, r * 0.95);
    glow.addColorStop(0, `rgba(235,248,255, ${0.50 + coreGlowPulse * 0.22})`);
    glow.addColorStop(0.28, `rgba(128,220,255, ${0.22 + coreGlowPulse * 0.12})`);
    glow.addColorStop(0.62, `rgba(55,150,235, ${0.08 + coreGlowPulse * 0.06})`);
    glow.addColorStop(1, "rgba(25,70,140,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, -r * 0.04, r * 0.85, 0, Math.PI * 2);
    ctx.fill();
  }
  
    /* dome fill */
    const domeGrad = ctx.createLinearGradient(0, capTopY, 0, capBottomY);
    domeGrad.addColorStop(0, "rgba(245,248,255,0.18)");
    domeGrad.addColorStop(0.35, "rgba(145,195,245,0.12)");
    domeGrad.addColorStop(0.75, "rgba(45,85,145,0.10)");
    domeGrad.addColorStop(1, "rgba(20,45,85,0.02)");
    ctx.fillStyle = domeGrad;
  
    ctx.beginPath();
    ctx.moveTo(-capHalfW, capBottomY);
    ctx.quadraticCurveTo(-capHalfW * 0.82, capTopY, 0, capTopY);
    ctx.quadraticCurveTo(capHalfW * 0.82, capTopY, capHalfW, capBottomY);
    ctx.quadraticCurveTo(0, capBottomY + r * 0.34, -capHalfW, capBottomY);
    ctx.closePath();
    ctx.fill();
  
    const core = ctx.createRadialGradient(0, -r * 0.02, 0, 0, -r * 0.02, r * 0.50);

  if (coreGlowActive) {
    // Bioluminescent center/core. Red light does not recolor this glow.
    core.addColorStop(0, `rgba(250,255,255, ${0.82 + coreGlowPulse * 0.12})`);
    core.addColorStop(0.22, `rgba(175,235,255, ${0.50 + coreGlowPulse * 0.18})`);
    core.addColorStop(0.55, `rgba(62,175,255, ${0.26 + coreGlowPulse * 0.12})`);
    core.addColorStop(1, "rgba(20,60,130,0)");
  } else {
    // Soft non-glowing core in white floodlight.
    core.addColorStop(0, "rgba(160,190,230,0.35)");
    core.addColorStop(0.4, "rgba(60,100,160,0.25)");
    core.addColorStop(1, "rgba(20,40,80,0)");
  }

  ctx.save();
  if (coreGlowActive) {
    ctx.shadowBlur = r * 0.42;
    ctx.shadowColor = "rgba(115,220,255,0.85)";
  }
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(0, -r * 0.02, r * 0.50, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  
    /* dome outline */
    ctx.lineWidth = j.lineWidth;
    ctx.strokeStyle = "rgba(215,232,255,0.20)";
    ctx.beginPath();
    ctx.moveTo(-capHalfW, capBottomY);
    ctx.quadraticCurveTo(-capHalfW * 0.82, capTopY, 0, capTopY);
    ctx.quadraticCurveTo(capHalfW * 0.82, capTopY, capHalfW, capBottomY);
    ctx.stroke();
  
    /* underside closing line */
    ctx.strokeStyle = "rgba(205,226,255,0.18)";
    ctx.beginPath();
    ctx.moveTo(-capHalfW * 0.98, capBottomY);
    ctx.lineTo(capHalfW * 0.98, capBottomY);
    ctx.stroke();
  
    /* outer shell bands */
    for (let i = 1; i <= 4; i++) {
      const s = 1 + i * 0.16;
      ctx.beginPath();
      ctx.strokeStyle = i % 2 === 0
        ? "rgba(90,145,205,0.11)"
        : "rgba(220,236,255,0.11)";
      ctx.moveTo(-capHalfW * s, capBottomY);
      ctx.quadraticCurveTo(-capHalfW * 0.82 * s, capTopY - r * 0.02 * i, 0, capTopY - r * 0.02 * i);
      ctx.quadraticCurveTo(capHalfW * 0.82 * s, capTopY - r * 0.02 * i, capHalfW * s, capBottomY);
      ctx.stroke();
    }
  
    /* inner ribs */
    const ribCount = 7;
    for (let i = 0; i < ribCount; i++) {
      const spread = -0.84 + (i / (ribCount - 1)) * 1.68;
      const endX = spread * capHalfW * 0.92;
  
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.04);
      ctx.quadraticCurveTo(
        spread * r * 0.34,
        capTopY * 0.92,
        endX,
        capBottomY
      );
      ctx.strokeStyle = i % 2 === 0
        ? "rgba(225,240,255,0.10)"
        : "rgba(80,135,195,0.10)";
      ctx.lineWidth = Math.max(0.7, j.lineWidth * 0.9);
      ctx.stroke();
    }
  
    /* fuller tentacle curtain */
    const tentacleCount = j.tentacles;
    const tentacleSpread = capHalfW * 0.92;
  
    for (let i = 0; i < tentacleCount; i++) {
      const t = tentacleCount === 1 ? 0.5 : i / (tentacleCount - 1);
      const spread = -1 + t * 2;
  
      const startX = spread * tentacleSpread * 0.62;
      const startY = capBottomY + r * 0.04;
  
      const swayA = Math.sin(time * 0.0017 + j.phase + i * 0.32) * r * 0.10;
      const swayB = Math.cos(time * 0.00125 + j.phase + i * 0.27) * r * 0.08;
  
      const len = r * (2.45 + t * 0.55);
  
      const c1x = startX + swayA * 0.25;
      const c1y = startY + len * 0.28;
  
      const c2x = startX + swayA * 0.65 + swayB * 0.4;
      const c2y = startY + len * 0.62;
  
      const endX = startX + swayA + swayB * 0.65;
      const endY = startY + len;
  
      const grad = ctx.createLinearGradient(startX, startY, endX, endY);
      grad.addColorStop(0, i % 2 === 0
        ? "rgba(245,247,255,0.34)"
        : "rgba(120,175,230,0.28)");
      grad.addColorStop(0.45, i % 2 === 0
        ? "rgba(220,230,245,0.18)"
        : "rgba(75,120,175,0.18)");
      grad.addColorStop(1, "rgba(22,44,82,0)");
  
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(c1x, c1y, c2x, c2y, endX, endY);
      ctx.strokeStyle = grad;
      ctx.lineWidth = i % 2 === 0 ? j.lineWidth : Math.max(0.75, j.lineWidth * 0.92);
      ctx.stroke();
    }
  
    /* a few longer outer drifts */
    for (let i = 0; i < 3; i++) {
      const side = i === 0 ? -1 : i === 1 ? 0 : 1;
      const startX = side * capHalfW * 0.24;
      const startY = capBottomY + r * 0.10;
      const drift = Math.sin(time * 0.0014 + j.phase + i) * r * 0.18;
  
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(
        startX + drift * 0.4,
        startY + r * 0.8,
        startX + drift,
        startY + r * 1.7,
        startX + drift * 1.5,
        startY + r * 2.9
      );
      ctx.strokeStyle = "rgba(80,120,170,0.10)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  
    ctx.restore();
  }

/* COMB JELLIES - CANVAS VERSION */
let combCtx = null;
let combJellies = [];
let combAnimId = null;

function setupCombJellyLayer() {
  if (!combJellyLayer) return;

  combCtx = combJellyLayer.getContext("2d", { alpha: true });
  resizeCombJellyCanvas();
  createCombJellies();

  if (!combAnimId) {
    combAnimId = requestAnimationFrame(animateCombJellies);
  }
}

function resizeCombJellyCanvas() {
  if (!combJellyLayer || !combCtx) return;

  const w = window.innerWidth;
  const h = window.innerHeight;

  combJellyLayer.width = w;
  combJellyLayer.height = h;
  combJellyLayer.style.width = `${w}px`;
  combJellyLayer.style.height = `${h}px`;
}

function createCombJellies() {
    const w = window.innerWidth;
    const h = window.innerHeight;
  
    combJellies = [
      makeCombJelly({
        x: w * 0.12,          // starts already visible
        y: h * 0.14,          // a bit higher so it's not too close to jellyfish
        scale: 0.32,
        speed: 0.22,
        drift: 8,
        ribCount: 8,
        particleCount: 10,
        depth: "far"
      }),
      makeCombJelly({
        x: w * 0.78,          // starts visible on the right side
        y: h * 0.22,          // spaced away vertically
        scale: 0.46,
        speed: -0.30,
        drift: 10,
        ribCount: 10,
        particleCount: 14,
        depth: "mid"
      }),
      makeCombJelly({
        x: w * 0.32,          // starts visible near middle-left
        y: h * 0.30,          // separated from the others
        scale: 0.62,
        speed: 0.40,
        drift: 14,
        ribCount: 12,
        particleCount: 18,
        depth: "near"
      }),
      makeCombJelly({
        x: w * 0.58,
        y: h * 0.18,
        scale: 0.40,
        speed: -0.24,
        drift: 9,
        ribCount: 9,
        particleCount: 12,
        depth: "mid"
      })
    ];
}

function makeCombJelly({ x, y, scale, speed, drift, ribCount, particleCount, depth }) {
  const baseHeight = 120 * scale;
  const baseWidth = 42 * scale;

  const glowPalette = [
    "rgba(120, 255, 255, 0.6)", // cyan
    "rgba(90, 170, 255, 0.6)",  // electric blue
    "rgba(190, 255, 230, 0.6)", // pale mint
    "rgba(210, 180, 255, 0.6)"  // soft violet
  ];

  const jelly = {
    x,
    y,
    baseY: y,
    scale,
    speed,
    drift,
    ribCount,
    particleCount,
    depth,
    phase: Math.random() * Math.PI * 2,
    spin: Math.random() * Math.PI * 2,
    baseHeight,
    baseWidth,
    particles: []
  };

  for (let i = 0; i < particleCount; i++) {
    jelly.particles.push({
      ribIndex: Math.floor(Math.random() * ribCount),
      t: Math.random(),
      speed: 0.003 + Math.random() * 0.004,
      size: 2 + Math.random() * 3, // 2px to 5px
      color: glowPalette[Math.floor(Math.random() * glowPalette.length)],
      alphaPhase: Math.random() * Math.PI * 2
    });
  }

  return jelly;
}

function animateCombJellies(time) {
  if (!combCtx || !combJellyLayer) {
    combAnimId = requestAnimationFrame(animateCombJellies);
    return;
  }

  const w = combJellyLayer.width;
  const h = combJellyLayer.height;

  combCtx.clearRect(0, 0, w, h);

  const inAbyssalZone = currentDepth >= 4000 && currentDepth < 6000;
  if (currentDepth <= 200 || inAbyssalZone) {
    const visibleCombJellies = currentDepth <= 200 ? combJellies.slice(0, 3) : combJellies;

    for (const jelly of visibleCombJellies) {
      updateCombJelly(jelly, w, h);
      drawCombJelly(combCtx, jelly, time);
    }
  }

  combAnimId = requestAnimationFrame(animateCombJellies);
}

function updateCombJelly(jelly, w, h) {
  const inAbyssalZone = currentDepth >= 4000 && currentDepth < 6000;
  const abyssalSmoothFactor = inAbyssalZone ? 0.55 : 1;

  jelly.x += jelly.speed * abyssalSmoothFactor;
  if (inAbyssalZone && jelly.baseY < h * 0.38) {
    jelly.baseY = randomRange(h * 0.42, h * 0.64);
  }
  jelly.y = jelly.baseY + Math.sin(performance.now() * 0.0012 + jelly.phase) * jelly.drift * abyssalSmoothFactor;

  const respawnOffset = 40; // much closer to screen edge

  if (jelly.speed > 0 && jelly.x > w + respawnOffset) {
    jelly.x = -respawnOffset;
    jelly.baseY = inAbyssalZone ? randomRange(h * 0.42, h * 0.64) : randomRange(h * 0.10, h * 0.32);
  }

  if (jelly.speed < 0 && jelly.x < -respawnOffset) {
    jelly.x = w + respawnOffset;
    jelly.baseY = inAbyssalZone ? randomRange(h * 0.42, h * 0.64) : randomRange(h * 0.10, h * 0.32);
  }

  for (const particle of jelly.particles) {
    particle.t += particle.speed * abyssalSmoothFactor;

    if (particle.t > 1) {
      particle.t = 0;
      particle.ribIndex = Math.floor(Math.random() * jelly.ribCount);
      particle.speed = 0.003 + Math.random() * 0.004;
      particle.size = 2 + Math.random() * 3;
    }
  }
}

function drawCombJelly(ctx, jelly, time) {
    const frame = time * 0.03 + jelly.phase * 30;
    const pulse = Math.pow(Math.sin(frame * 0.018), 2);
  
    const restHeight = jelly.baseHeight;
    const minHeight = restHeight * 0.32;
    const maxHeight = restHeight * 1.5;
  
    const h = maxHeight - (maxHeight - minHeight) * pulse;
  
    const squashRatio = 1 - (h / maxHeight);
    const widthBoost = 1 + squashRatio * 1.8;
    const w = jelly.baseWidth * widthBoost;
  
    const centerY = jelly.y;
  
    const top = {
      x: jelly.x,
      y: centerY - h * 0.5
    };
  
    const bottom = {
      x: jelly.x,
      y: centerY + h * 0.5
    };
  
    const ribs = [];
    for (let i = 0; i < jelly.ribCount; i++) {
      ribs.push(getCombRibGeometry(jelly, i, top, bottom, h, w, frame, pulse));
    }
  
    ribs.sort((a, b) => a.depth - b.depth);
  
    // LIGHT STATE
    const lightMode = getCombJellyLightMode();
  
    let ribAlpha = 0.06;         // almost invisible when no light
    let ribColor = "180, 220, 255";
    let ribLineWidth = jelly.depth === "near" ? 1 : 0.5;
    let particleBoost = 1.0;
    let particleGlow = 15;
  
    if (lightMode === "white") {
      ribAlpha = 0.30;
      ribColor = "235, 245, 255";
      ribLineWidth = jelly.depth === "near" ? 1.2 : 0.8;
      particleBoost = 1.6;
      particleGlow = 32;
    } else if (lightMode === "red") {
      ribAlpha = 0.22;
      ribColor = "255, 210, 210";
      ribLineWidth = jelly.depth === "near" ? 1.1 : 0.7;
      particleBoost = 1.6;
      particleGlow = 32;
    }
  
    // ribs
    ctx.save();
    ctx.strokeStyle = `rgba(${ribColor}, ${ribAlpha})`;
    ctx.lineWidth = ribLineWidth;
  
    for (const rib of ribs) {
      ctx.beginPath();
      ctx.moveTo(rib.top.x, rib.top.y);
      ctx.bezierCurveTo(
        rib.c1.x, rib.c1.y,
        rib.c2.x, rib.c2.y,
        rib.bottom.x, rib.bottom.y
      );
      ctx.stroke();
    }
    ctx.restore();
  
    // particles
    ctx.save();
ctx.shadowBlur = lightMode === "white" ? 28 : lightMode === "red" ? 24 : 15;
ctx.shadowColor = "rgba(180,245,255,0.95)";

for (const particle of jelly.particles) {
  const rib = ribs[particle.ribIndex % ribs.length];

  const pt = cubicBezierPoint(
    rib.top.x, rib.top.y,
    rib.c1.x, rib.c1.y,
    rib.c2.x, rib.c2.y,
    rib.bottom.x, rib.bottom.y,
    particle.t
  );

  const fade = 0.35 + 0.35 * Math.sin((particle.t * Math.PI * 2) + particle.alphaPhase);
  let alpha = Math.max(0.12, Math.min(0.6, fade));
  alpha = Math.min(0.95, alpha * particleBoost);

  const color = brightenCombParticleColor(particle.color, alpha, lightMode);

  // ✅ LIGHTWEIGHT rib highlight (NO loops)
  if (lightMode === "white" || lightMode === "red") {
    const ahead = Math.min(1, particle.t + 0.06);

    const pt2 = cubicBezierPoint(
      rib.top.x, rib.top.y,
      rib.c1.x, rib.c1.y,
      rib.c2.x, rib.c2.y,
      rib.bottom.x, rib.bottom.y,
      ahead
    );

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lightMode === "white" ? 2 : 1.5;
    ctx.globalAlpha = 0.5;

    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    ctx.lineTo(pt2.x, pt2.y);
    ctx.stroke();

    ctx.restore();
  }

  // particle core
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(pt.x, pt.y, particle.size * 0.5, 0, Math.PI * 2);
  ctx.fill();
}

ctx.restore();

}


function getCombRibGeometry(jelly, ribIndex, top, bottom, h, w, frame, pulse) {
    const angle = (ribIndex / jelly.ribCount) * Math.PI * 2;
    const depth = Math.cos(angle);
    const side = Math.sin(angle);
  
    const squashAmount = pulse;
  
    const visibleWidth = w * (0.2 + 0.8 * Math.abs(depth));
    const phaseLag = ribIndex * 0.22;
    const ripple = Math.sin(frame * 0.08 + phaseLag) * w * 0.04 * (1 - squashAmount * 0.7);
    const lean = Math.sin(frame * 0.03 + jelly.spin) * w * 0.05 * (1 - squashAmount * 0.75);
    const frontBias = depth * w * 0.06;
  
    const offsetX = side * visibleWidth;
  
    const cY1 = jelly.y - h * 0.18 * (1 - squashAmount * 0.9);
    const cY2 = jelly.y + h * 0.18 * (1 - squashAmount * 0.9);
  
    return {
      top,
      bottom,
      c1: {
        x: jelly.x + offsetX + ripple + lean + frontBias,
        y: cY1
      },
      c2: {
        x: jelly.x + offsetX - ripple + lean + frontBias,
        y: cY2
      },
      depth
    };
}

function cubicBezierPoint(x1, y1, cx1, cy1, cx2, cy2, x2, y2, t) {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;

  return {
    x:
      mt2 * mt * x1 +
      3 * mt2 * t * cx1 +
      3 * mt * t2 * cx2 +
      t2 * t * x2,
    y:
      mt2 * mt * y1 +
      3 * mt2 * t * cy1 +
      3 * mt * t2 * cy2 +
      t2 * t * y2
  };
}

function getCombJellyLightMode() {
    // Adjust this to match however your site stores the current light mode.
    // This version supports a few common setups safely.
  
    if (typeof currentMode !== "undefined") {
      if (currentMode === "white" || currentMode === "red") return currentMode;
      return "off";
    }
  
    if (typeof mode !== "undefined") {
      if (mode === "white" || mode === "red") return mode;
      return "off";
    }
  
    const bodyMode =
      document.body.dataset.mode ||
      document.body.getAttribute("data-mode") ||
      document.documentElement.dataset.mode ||
      document.documentElement.getAttribute("data-mode");
  
    if (bodyMode === "white" || bodyMode === "red") return bodyMode;
  
    return "off";
}

function brightenCombParticleColor(baseColor, alpha, lightMode) {
    // default (light OFF) → keep original look
    let color = baseColor.replace(/[\d.]+\)\s*$/, `${alpha})`);
  
    if (lightMode === "white") {
      // MUCH brighter, more saturated bioluminescence
      if (baseColor.includes("120, 255, 255")) {
        color = `rgba(180, 255, 255, ${alpha})`; // intense cyan
      }
      else if (baseColor.includes("90, 170, 255")) {
        color = `rgba(120, 210, 255, ${alpha})`; // strong electric blue
      }
      else if (baseColor.includes("190, 255, 230")) {
        color = `rgba(220, 255, 240, ${alpha})`; // glowing mint
      }
      else if (baseColor.includes("210, 180, 255")) {
        color = `rgba(235, 200, 255, ${alpha})`; // brighter violet
      }
    }
  
    if (lightMode === "red") {
      // Red floodlight should not turn the comb jelly bioluminescence red.
      // Keep each particle's original cyan/blue/mint/violet color, only boost visibility.
      if (baseColor.includes("120, 255, 255")) {
        color = `rgba(120, 255, 255, ${alpha})`;
      }
      else if (baseColor.includes("90, 170, 255")) {
        color = `rgba(90, 170, 255, ${alpha})`;
      }
      else if (baseColor.includes("190, 255, 230")) {
        color = `rgba(190, 255, 230, ${alpha})`;
      }
      else if (baseColor.includes("210, 180, 255")) {
        color = `rgba(210, 180, 255, ${alpha})`;
      }
    }
  
    return color;
}

function drawReactiveRibGlow(ctx, rib, tCenter, color, depth, lightMode) {
    const steps = 24;
    const spread = lightMode === "white" ? 0.12 : 0.09; // how much of the rib lights up
    const lineWidth = lightMode === "white"
      ? (depth === "near" ? 2.2 : 1.6)
      : (depth === "near" ? 1.7 : 1.2);
  
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = lineWidth;
    ctx.shadowBlur = lightMode === "white" ? 18 : 10;
    ctx.shadowColor = color;
  
    for (let i = 0; i < steps; i++) {
      const t1 = Math.max(0, tCenter - spread + (i / steps) * (spread * 2));
      const t2 = Math.max(0, tCenter - spread + ((i + 1) / steps) * (spread * 2));
  
      if (t1 > 1 || t2 > 1) continue;
  
      const p1 = cubicBezierPoint(
        rib.top.x, rib.top.y,
        rib.c1.x, rib.c1.y,
        rib.c2.x, rib.c2.y,
        rib.bottom.x, rib.bottom.y,
        t1
      );
  
      const p2 = cubicBezierPoint(
        rib.top.x, rib.top.y,
        rib.c1.x, rib.c1.y,
        rib.c2.x, rib.c2.y,
        rib.bottom.x, rib.bottom.y,
        t2
      );
  
      // strongest at center of the particle, fades toward the ends
      const midT = (t1 + t2) * 0.5;
      const dist = Math.abs(midT - tCenter) / spread;
      const intensity = Math.max(0, 1 - dist);
  
      let segmentAlpha = 0.18 + intensity * 0.55;
      if (lightMode === "white") segmentAlpha += 0.12;
  
      ctx.strokeStyle = applyAlphaToRGBA(color, segmentAlpha);
  
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
  
    ctx.restore();
}

function applyAlphaToRGBA(rgbaString, alpha) {
    const match = rgbaString.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
    if (!match) return rgbaString;
    return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`;
}

/* DUMBO OCTOPUS - MIDNIGHT ZONE ONLY
   Three octopuses swim side-to-side like the anglerfish and Atolla jellyfish.
   White floodlight: soft white bodies. Off/Red: transparent bodies with skin bioluminescence,
   while the tentacles stay darker so they remain visible in deep water. */
let dumboOctopusCtx = null;
let dumboOctopus = [];
let dumboOctopusAnimId = null;

function setupDumboOctopusLayer() {
  if (!dumboOctopusLayer) return;
  dumboOctopusCtx = dumboOctopusLayer.getContext("2d", { alpha: true });
  resizeDumboOctopusCanvas();
  createDumboOctopusSet();
  if (!dumboOctopusAnimId) dumboOctopusAnimId = requestAnimationFrame(animateDumboOctopus);
}

function resizeDumboOctopusCanvas() {
  if (!dumboOctopusLayer || !dumboOctopusCtx) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  dumboOctopusLayer.width = w;
  dumboOctopusLayer.height = h;
  dumboOctopusLayer.style.width = `${w}px`;
  dumboOctopusLayer.style.height = `${h}px`;
}

function createDumboOctopusSet() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  dumboOctopus = [
    makeDumboOctopus({ startX: w * 0.12, startY: h * 0.26, scale: 0.40, speed: 0.30, lane: h * 0.26, drift: 13, depth: "far", phase: 0.3 }),
    makeDumboOctopus({ startX: w * 0.82, startY: h * 0.46, scale: 0.52, speed: -0.40, lane: h * 0.46, drift: 17, depth: "mid", phase: 2.0 }),
    makeDumboOctopus({ startX: w * 0.34, startY: h * 0.62, scale: 0.62, speed: 0.48, lane: h * 0.62, drift: 20, depth: "near", phase: 4.2 })
  ];
}

function makeDumboOctopus({ startX, startY, scale, speed, lane, drift, depth, phase }) {
  return {
    x: startX,
    y: startY,
    baseY: lane,
    scale,
    speed,
    drift,
    depth,
    phase,
    earPhase: Math.random() * Math.PI * 2,
    pulse: Math.random() * Math.PI * 2,
    glowPhase: Math.random() * Math.PI * 2,
    alpha: depth === "near" ? 0.94 : depth === "mid" ? 0.82 : 0.70
  };
}

function animateDumboOctopus(time) {
  if (!dumboOctopusCtx || !dumboOctopusLayer) {
    dumboOctopusAnimId = requestAnimationFrame(animateDumboOctopus);
    return;
  }

  const w = dumboOctopusLayer.width;
  const h = dumboOctopusLayer.height;
  dumboOctopusCtx.clearRect(0, 0, w, h);

  if (currentDepth >= 1000 && currentDepth <= 4000) {
    for (const o of dumboOctopus) {
      o.x += o.speed;
      o.y = o.baseY + Math.sin(time * 0.00105 + o.phase) * o.drift;

      if (o.speed > 0 && o.x > w + 190) {
        o.x = -190;
        o.baseY = randomRange(h * 0.20, h * 0.66);
      }
      if (o.speed < 0 && o.x < -190) {
        o.x = w + 190;
        o.baseY = randomRange(h * 0.20, h * 0.66);
      }

      drawDumboOctopus(dumboOctopusCtx, o, time, currentMode);
    }
  }

  dumboOctopusAnimId = requestAnimationFrame(animateDumboOctopus);
}

function drawDumboOctopus(ctx, o, time, mode) {
  const S = o.scale;
  const darkMode = mode === "off" || mode === "red";
  const redMode = mode === "red";
  const dir = o.speed > 0 ? -1 : 1;
  const swim = Math.sin(time * 0.006 + o.phase);
  const earFlap = Math.sin(time * 0.007 + o.earPhase);
  const glowPulse = 0.72 + Math.sin(time * 0.0048 + o.glowPhase) * 0.28;
  const bodyW = 86 * S;
  const bodyH = 118 * S;

  ctx.save();
  ctx.translate(o.x, o.y);
  ctx.scale(dir, 1);
  ctx.rotate(Math.sin(time * 0.0014 + o.phase) * 0.075);
  ctx.globalAlpha = o.alpha;

  if (darkMode) {
    const halo = ctx.createRadialGradient(0, -bodyH * 0.14, 0, 0, -bodyH * 0.14, bodyW * 1.45 * glowPulse);
    halo.addColorStop(0, "rgba(120,235,255,0.34)");
    halo.addColorStop(0.45, "rgba(55,190,255,0.16)");
    halo.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, -bodyH * 0.12, bodyW * 1.45 * glowPulse, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ear fins.
  const earFill = darkMode
    ? "rgba(190,245,255,0.20)"
    : "rgba(245,246,248,0.88)";
  const earStroke = darkMode
    ? "rgba(135,235,255,0.50)"
    : "rgba(210,220,230,0.45)";
  ctx.fillStyle = earFill;
  ctx.strokeStyle = earStroke;
  ctx.lineWidth = 1.1 * S;
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(side * bodyW * 0.48, -bodyH * 0.35);
    ctx.rotate(side * (0.45 + earFlap * 0.10));
    ctx.beginPath();
    ctx.ellipse(0, 0, bodyW * 0.35, bodyH * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Main mantle/body.
  const bodyGradient = ctx.createRadialGradient(-bodyW * 0.24, -bodyH * 0.50, bodyW * 0.10, 0, -bodyH * 0.12, bodyH * 0.78);
  if (darkMode) {
    bodyGradient.addColorStop(0, "rgba(225,252,255,0.24)");
    bodyGradient.addColorStop(0.45, "rgba(150,235,255,0.15)");
    bodyGradient.addColorStop(1, "rgba(255,255,255,0.045)");
  } else {
    bodyGradient.addColorStop(0, "rgba(255,255,255,0.98)");
    bodyGradient.addColorStop(0.56, "rgba(232,238,247,0.95)");
    bodyGradient.addColorStop(1, "rgba(210,195,188,0.86)");
  }
  ctx.fillStyle = bodyGradient;
  ctx.strokeStyle = darkMode
    ? "rgba(150,240,255,0.45)"
    : "rgba(210,220,228,0.58)";
  ctx.lineWidth = 1.3 * S;
  ctx.beginPath();
  ctx.moveTo(0, -bodyH * 0.78);
  ctx.bezierCurveTo(bodyW * 0.50, -bodyH * 0.70, bodyW * 0.58, -bodyH * 0.18, bodyW * 0.34, bodyH * 0.25);
  ctx.bezierCurveTo(bodyW * 0.20, bodyH * 0.55, -bodyW * 0.20, bodyH * 0.55, -bodyW * 0.34, bodyH * 0.25);
  ctx.bezierCurveTo(-bodyW * 0.58, -bodyH * 0.18, -bodyW * 0.50, -bodyH * 0.70, 0, -bodyH * 0.78);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bioluminescent skin freckles only on the mantle/skin, not on tentacles.
  if (darkMode) {
    const dotColor = [95, 230, 255];
    for (let i = 0; i < 24; i++) {
      const t = (i * 37.17 + o.phase * 40) % 100 / 100;
      const px = (Math.sin(i * 2.31 + o.phase) * 0.30 + Math.sin(i * 0.71) * 0.10) * bodyW;
      const py = -bodyH * 0.62 + t * bodyH * 0.66;
      const rx = bodyW * (0.22 + 0.20 * Math.sin(t * Math.PI));
      if (Math.abs(px) > rx) continue;
      const a = (0.22 + 0.38 * glowPulse) * (0.75 + 0.25 * Math.sin(time * 0.004 + i));
      const d = ctx.createRadialGradient(px, py, 0, px, py, 8 * S);
      d.addColorStop(0, `rgba(245,255,255,${Math.min(0.95, a + 0.18)})`);
      d.addColorStop(0.35, `rgba(${dotColor[0]},${dotColor[1]},${dotColor[2]},${a})`);
      d.addColorStop(1, `rgba(${dotColor[0]},${dotColor[1]},${dotColor[2]},0)`);
      ctx.fillStyle = d;
      ctx.beginPath();
      ctx.arc(px, py, 3.0 * S, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Two eyes.
  ctx.fillStyle = darkMode ? "rgba(210,245,255,0.78)" : "rgba(12,18,26,0.82)";
  for (const eyeX of [-bodyW * 0.16, bodyW * 0.16]) {
    ctx.beginPath();
    ctx.ellipse(eyeX, -bodyH * 0.26, 5.2 * S, 6.8 * S, eyeX < 0 ? 0.18 : -0.18, 0, Math.PI * 2);
    ctx.fill();
  }
  if (!darkMode) {
    ctx.fillStyle = "rgba(255,255,255,0.70)";
    for (const eyeX of [-bodyW * 0.18, bodyW * 0.14]) {
      ctx.beginPath();
      ctx.arc(eyeX, -bodyH * 0.29, 1.4 * S, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Tentacles: darker and less glowing than skin.
  ctx.lineCap = "round";
  ctx.strokeStyle = darkMode
    ? (redMode ? "rgba(75,20,24,0.48)" : "rgba(18,32,42,0.56)")
    : "rgba(185,166,155,0.78)";
  ctx.lineWidth = 8.5 * S;
  for (let i = 0; i < 8; i++) {
    const side = i - 3.5;
    const rootX = side * bodyW * 0.075;
    const rootY = bodyH * 0.23;
    const len = bodyH * (0.34 + 0.08 * Math.sin(i * 1.7));
    const curl = Math.sin(time * 0.006 + i + o.phase) * bodyW * 0.08;
    ctx.beginPath();
    ctx.moveTo(rootX, rootY);
    ctx.bezierCurveTo(rootX + side * bodyW * 0.035, rootY + len * 0.34, rootX + curl, rootY + len * 0.72, rootX + side * bodyW * 0.045 + curl, rootY + len);
    ctx.stroke();

    // Small sucker dots stay subtle/dim.
    ctx.fillStyle = darkMode ? "rgba(210,220,220,0.16)" : "rgba(250,238,230,0.42)";
    for (let s = 0; s < 3; s++) {
      const sy = rootY + len * (0.36 + s * 0.18);
      const sx = rootX + side * bodyW * 0.02 + curl * (0.25 + s * 0.22);
      ctx.beginPath();
      ctx.arc(sx, sy, 1.9 * S, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Gentle rim so transparent bodies still read clearly.
  if (darkMode) {
    ctx.strokeStyle = `rgba(80,220,255,${0.22 + glowPulse * 0.20})`;
    ctx.lineWidth = 1.2 * S;
    ctx.beginPath();
    ctx.moveTo(-bodyW * 0.24, bodyH * 0.22);
    ctx.quadraticCurveTo(0, bodyH * 0.39 + swim * 3 * S, bodyW * 0.24, bodyH * 0.22);
    ctx.stroke();
  }

  ctx.restore();
}


/* MINING SYSTEM */

function setupAtollaJellyfishLayer() {
  if (!atollaJellyfishLayer) return;
  atollaJellyfishCtx = atollaJellyfishLayer.getContext("2d", { alpha: true });
  resizeAtollaJellyfishCanvas();
  createAtollaJellyfishSet();
  if (!atollaJellyfishAnimId) atollaJellyfishAnimId = requestAnimationFrame(animateAtollaJellyfish);
}

function resizeAtollaJellyfishCanvas() {
  if (!atollaJellyfishLayer || !atollaJellyfishCtx) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  atollaJellyfishLayer.width = w;
  atollaJellyfishLayer.height = h;
  atollaJellyfishLayer.style.width = `${w}px`;
  atollaJellyfishLayer.style.height = `${h}px`;
}

function createAtollaJellyfishSet() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  atollaJellyfish = [
    makeAtollaJellyfish({ startX: w * 0.20, startY: h * 0.32, scale: 0.58, speed: 0.34, lane: h * 0.32, drift: 12, depth: "far" }),
    makeAtollaJellyfish({ startX: w * 0.76, startY: h * 0.43, scale: 0.72, speed: -0.48, lane: h * 0.43, drift: 16, depth: "mid" }),
    makeAtollaJellyfish({ startX: w * 0.38, startY: h * 0.56, scale: 0.84, speed: 0.58, lane: h * 0.56, drift: 18, depth: "near" })
  ];
}

function makeAtollaJellyfish({ startX, startY, scale, speed, lane, drift, depth }) {
  return {
    x: startX,
    y: startY,
    baseY: lane,
    scale,
    speed,
    drift,
    depth,
    phase: Math.random() * Math.PI * 2,
    pulse: Math.random() * Math.PI * 2,
    swimPhase: Math.random() * Math.PI * 2,
    glowPhase: Math.random() * Math.PI * 2,
    alpha: depth === "near" ? 0.92 : depth === "mid" ? 0.78 : 0.64
  };
}

function animateAtollaJellyfish(time) {
  if (!atollaJellyfishCtx || !atollaJellyfishLayer) {
    atollaJellyfishAnimId = requestAnimationFrame(animateAtollaJellyfish);
    return;
  }

  const w = atollaJellyfishLayer.width;
  const h = atollaJellyfishLayer.height;
  atollaJellyfishCtx.clearRect(0, 0, w, h);

  // Atolla jellyfish appear only in the Midnight Zone.
  if (currentDepth >= 1000 && currentDepth <= 4000) {
    for (const j of atollaJellyfish) {
      // Same side-to-side swimming style as the lanternfish layer.
      j.x += j.speed;
      j.y = j.baseY + Math.sin(time * 0.001 + j.phase) * j.drift;

      if (j.speed > 0 && j.x > w + 180) {
        j.x = -180;
        j.baseY = randomRange(h * 0.24, h * 0.62);
      }

      if (j.speed < 0 && j.x < -180) {
        j.x = w + 180;
        j.baseY = randomRange(h * 0.24, h * 0.62);
      }

      drawAtollaJellyfish(atollaJellyfishCtx, j, time, currentMode);
    }
  }

  atollaJellyfishAnimId = requestAnimationFrame(animateAtollaJellyfish);
}

function drawAtollaJellyfish(ctx, j, time, mode) {
  const S = j.scale;
  const r = 34 * S * (1 + Math.sin(time * 0.003 + j.pulse) * 0.04);
  const dir = j.speed > 0 ? -1 : 1;
  const tilt = Math.sin(time * 0.0015 + j.swimPhase) * 0.08;
  const darkMode = mode === "off" || mode === "red";
  const glowPulse = 0.78 + Math.sin(time * 0.005 + j.glowPhase) * 0.22;

  ctx.save();
  ctx.translate(j.x, j.y);
  ctx.scale(dir, 1);
  ctx.rotate(tilt);
  ctx.globalAlpha = j.alpha;

  // Back/outer blue glow removed so bioluminescence stays inside the Atolla bell.

  // Red Atolla crown and bell under light-on.
  const bell = ctx.createRadialGradient(-r * 0.25, -r * 0.35, r * 0.1, 0, 0, r * 1.3);
  if (darkMode) {
    // OFF / RED mode: keep the blue bioluminescence strong, but make the red body less visible.
    bell.addColorStop(0, "rgba(118,32,30,0.38)");
    bell.addColorStop(0.5, "rgba(165,28,18,0.30)");
    bell.addColorStop(1, "rgba(58,7,8,0.16)");
  } else {
    // LIGHT ON mode: keep the red Atolla body color unchanged.
    bell.addColorStop(0, "rgba(255,118,86,0.88)");
    bell.addColorStop(0.45, "rgba(210,42,25,0.82)");
    bell.addColorStop(1, "rgba(88,8,7,0.54)");
  }

  ctx.fillStyle = bell;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 1.18, r * 0.76, 0, 0, Math.PI * 2);
  ctx.fill();

  // Transparent raised top dome.
  const dome = ctx.createLinearGradient(0, -r * 1.05, 0, r * 0.05);
  dome.addColorStop(0, darkMode ? "rgba(120,220,255,0.28)" : "rgba(255,210,190,0.26)");
  dome.addColorStop(0.55, darkMode ? "rgba(30,170,255,0.18)" : "rgba(255,95,65,0.17)");
  dome.addColorStop(1, "rgba(255,255,255,0.03)");
  ctx.fillStyle = dome;
  ctx.beginPath();
  ctx.ellipse(0, -r * 0.38, r * 0.78, r * 0.48, 0, Math.PI, Math.PI * 2);
  ctx.lineTo(r * 0.78, -r * 0.38);
  ctx.quadraticCurveTo(0, r * 0.06, -r * 0.78, -r * 0.38);
  ctx.closePath();
  ctx.fill();

  // Bright blue bioluminescent top only in off/red.
  if (darkMode) {
    const topGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.62);
    topGlow.addColorStop(0, `rgba(220,255,255,${1.0 * glowPulse})`);
    topGlow.addColorStop(0.18, `rgba(0,255,255,${0.98 * glowPulse})`);
    topGlow.addColorStop(0.52, `rgba(0,130,255,${0.92 * glowPulse})`);
    topGlow.addColorStop(0.82, `rgba(0,38,190,${0.74 * glowPulse})`);
    topGlow.addColorStop(1, "rgba(0,12,95,0.18)");
    ctx.fillStyle = topGlow;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.46, r * 0.30, 0, 0, Math.PI * 2);
    ctx.fill();

    // Crisp inner highlight; still contained inside the center circle.
    const centerSpark = ctx.createRadialGradient(-r * 0.08, -r * 0.04, 0, -r * 0.08, -r * 0.04, r * 0.20);
    centerSpark.addColorStop(0, `rgba(255,255,255,${0.88 * glowPulse})`);
    centerSpark.addColorStop(0.45, `rgba(85,255,255,${0.55 * glowPulse})`);
    centerSpark.addColorStop(1, "rgba(0,220,255,0)");
    ctx.fillStyle = centerSpark;
    ctx.beginPath();
    ctx.ellipse(-r * 0.08, -r * 0.04, r * 0.17, r * 0.10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Small bright bioluminescent dots circling the center glow.
    // They stay inside the Atolla bell and add the dotted-ring look around the big middle circle.
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + Math.sin(time * 0.002 + j.glowPhase) * 0.08;
      const dotX = Math.cos(a) * r * 0.54;
      const dotY = Math.sin(a) * r * 0.33;
      const dotPulse = 0.72 + Math.sin(time * 0.006 + i * 0.9 + j.glowPhase) * 0.28;
      const dotR = r * (0.035 + 0.012 * dotPulse);

      const dotGlow = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, dotR * 3.2);
      dotGlow.addColorStop(0, `rgba(245,255,255,${0.95 * dotPulse})`);
      dotGlow.addColorStop(0.35, `rgba(35,255,255,${0.78 * dotPulse})`);
      dotGlow.addColorStop(0.72, `rgba(0,130,255,${0.45 * dotPulse})`);
      dotGlow.addColorStop(1, "rgba(0,60,180,0)");
      ctx.fillStyle = dotGlow;
      ctx.beginPath();
      ctx.arc(dotX, dotY, dotR * 3.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(230,255,255,${0.88 * dotPulse})`;
      ctx.beginPath();
      ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = "rgba(255,80,48,0.28)";
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.32, r * 0.56, r * 0.19, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Atolla red radial skirt lobes.
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const inner = r * 0.82;
    const outer = r * (1.22 + 0.08 * Math.sin(time * 0.004 + i));
    const x1 = Math.cos(a) * inner;
    const y1 = Math.sin(a) * inner * 0.58 + r * 0.10;
    const x2 = Math.cos(a) * outer;
    const y2 = Math.sin(a) * outer * 0.58 + r * 0.14;
    ctx.strokeStyle = darkMode ? "rgba(210,38,25,0.34)" : "rgba(235,62,38,0.82)";
    ctx.lineWidth = Math.max(1, 3.0 * S);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo((x1 + x2) * 0.5, (y1 + y2) * 0.5 + Math.sin(time * 0.003 + i) * r * 0.08, x2, y2);
    ctx.stroke();
  }

  // Long red tentacles trailing downward.
  for (let i = 0; i < 12; i++) {
    const t = (i / 11) - 0.5;
    const startX = t * r * 1.15;
    const startY = r * 0.40;
    const len = r * (1.15 + (i % 3) * 0.25);
    const sway = Math.sin(time * 0.002 + i + j.phase) * r * 0.25;
    ctx.strokeStyle = darkMode ? "rgba(198,40,30,0.28)" : "rgba(225,58,42,0.72)";
    ctx.lineWidth = Math.max(0.8, 1.8 * S);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(startX + sway * 0.25, startY + len * 0.35, startX - sway * 0.35, startY + len * 0.72, startX + sway, startY + len);
    ctx.stroke();
  }

  ctx.restore();
}


function buildMiningSystem() {
  if (miningSystemBuilt) return;

  miningLayer.innerHTML = `
  <div id="miningShadow" class="mining-shadow">
    <div class="mining-shadow-body"></div>
    <div class="mining-shadow-cabin"></div>

    <div class="mining-shadow-track"></div>

    <div class="mining-shadow-arm-left"></div>
    <div class="mining-shadow-arm-right"></div>

    <div class="mining-shadow-drill-column"></div>
    <div class="mining-shadow-drill-bit"></div>

    <div class="mining-shadow-light-left"></div>
    <div class="mining-shadow-light-right"></div>
  </div>

  <div id="miningCloud" class="mining-cloud"></div>
`;

  miningSystemBuilt = true;
}

function openMiningPopup() {
  if (!miningAlertActive) return;
  miningPopupBody.innerHTML = miningSummaryHTML;
  miningPopupOverlay.classList.remove("hidden");
}

function setAlertState(active) {
  miningAlertActive = active;

  if (active) {
    miningAlarmBtn.classList.add("alerting");
    alarmQuickBtn.classList.add("alerting");
    miningBlip.classList.add("active-alert");
  } else {
    miningAlarmBtn.classList.remove("alerting");
    alarmQuickBtn.classList.remove("alerting");
    miningBlip.classList.remove("active-alert");
  }
}

function updateMiningPass(now) {
  buildMiningSystem();

  const miningShadow = document.getElementById("miningShadow");
  const miningCloud = document.getElementById("miningCloud");

  const elapsed = (now - miningCycleStart) % miningPassInterval;
  const deepEnough = currentDepth > 3200;

  if (!deepEnough) {
    miningVisible = false;
    previousMiningVisible = false;
    miningShadow.style.opacity = "0";
    miningCloud.style.opacity = "0";
    miningCloud.classList.remove("lingering");
    setAlertState(false);
    return;
  }

  if (elapsed < miningPassDuration) {
    miningVisible = true;

    if (!previousMiningVisible) {
      miningDirection *= -1;
    }

    const t = elapsed / miningPassDuration;

    let x;
    if (miningDirection === 1) {
      x = -48 + t * 145;
    } else {
      x = 108 - t * 145;
    }

    const y = 17 + Math.sin(t * Math.PI * 1.15) * 5;

    miningShadow.style.left = `${x}%`;
    miningShadow.style.top = `${y}%`;
    miningShadow.style.opacity = "0.86";

    miningCloud.classList.remove("lingering");
    miningCloud.style.left = `${x - 12}%`;
    miningCloud.style.top = `${y + 8}%`;
    miningCloud.style.opacity = "0.48";

    setAlertState(true);

    const angle = t * Math.PI * 2;
    const radarX = 50 + Math.cos(angle) * 24;
    const radarY = 50 + Math.sin(angle) * 16;

    miningBlip.style.left = `${radarX}%`;
    miningBlip.style.top = `${radarY}%`;

    previousMiningVisible = true;
  } else {
    if (miningVisible) {
      const lastX = miningShadow.style.left;
      const lastY = miningShadow.style.top;

      miningCloud.classList.remove("lingering");
      void miningCloud.offsetWidth;
      miningCloud.style.left = `${parseFloat(lastX) - 10}%`;
      miningCloud.style.top = `${parseFloat(lastY) + 10}%`;
      miningCloud.style.opacity = "0.5";
      miningCloud.classList.add("lingering");
    }

    miningVisible = false;
    previousMiningVisible = false;
    miningShadow.style.opacity = "0";
    setAlertState(false);
  }
}

function updateCommsButtonState(isLanding = isSurfaceLanding()) {
  if (!commsBtn) return;
  commsBtn.classList.toggle("comms-flash", !missionBriefSeen && isLanding);
}

function openMissionBrief() {
  missionBriefSeen = true;
  updateCommsButtonState(false);
  if (!missionBriefOverlay) return;
  missionBriefOverlay.classList.remove("hidden");
  missionBriefOverlay.setAttribute("aria-hidden", "false");
}

function closeMissionBriefPanel() {
  if (!missionBriefOverlay) return;
  missionBriefOverlay.classList.add("hidden");
  missionBriefOverlay.setAttribute("aria-hidden", "true");
}

function openMapPanel() {
  if (!mapOverlay) return;
  mapOverlay.classList.remove("hidden");
  mapOverlay.setAttribute("aria-hidden", "false");
}

function closeMapPanel() {
  if (!mapOverlay) return;
  mapOverlay.classList.add("hidden");
  mapOverlay.setAttribute("aria-hidden", "true");
}

/* ENVIRONMENT */
function getZone(depth) {
  return zoneData.find((z) => depth >= z.min && depth < z.max) || zoneData[zoneData.length - 1];
}

function updateEnvironment(progress) {
  const rawProgress = typeof progress === "number" ? progress : getScrollProgress();
  const landing = isSurfaceLanding(rawProgress);
  const sceneProgress = getExperienceProgress();

  setSurfaceLandingState(landing);
  updateCommsButtonState(landing);
  setSurfaceTransition(rawProgress);

  currentDepth = Math.floor(sceneProgress * maxDepth);
  depthValue.textContent = currentDepth.toLocaleString();

  if (landing) {
    zoneName.textContent = "SYSTEM STANDBY";
    visibilityValue.textContent = "Surface";
    bioValue.textContent = "Standby";
    tempValue.textContent = "20°C";
    pressureValue.textContent = "1 atm";
    oxygenValue.textContent = "100%";
    oxygenFill.style.width = "100%";
    glowPercent.textContent = "100%";
    oxygenMode.textContent = "Awaiting descent. Depth tracking begins at the Sunlight Zone.";
    energyText.textContent = "Surface standby. Initiate descent to begin the zone sequence.";
    updateRadarAnimalDots("System Standby", true);
    oceanBg.style.background = "radial-gradient(circle at 50% 10%, rgba(255,255,255,0.16), transparent 30%), linear-gradient(to bottom, #b5e3f4 0%, #7fcbed 42%, #4298d3 70%, #0f5f9f 100%)";
    if (fishSchoolLayer) fishSchoolLayer.style.opacity = "0";
    if (jellyfishLayer) jellyfishLayer.style.opacity = "0";
    if (lanternfishLayer) lanternfishLayer.style.opacity = "0";
    if (hatchetfishLayer) hatchetfishLayer.style.opacity = "0";
    if (viperfishLayer) viperfishLayer.style.opacity = "0";
    if (combJellyLayer) combJellyLayer.style.opacity = "0";
    if (anglerfishLayer) anglerfishLayer.style.opacity = "0";
    if (atollaJellyfishLayer) atollaJellyfishLayer.style.opacity = "0";
    if (dumboOctopusLayer) dumboOctopusLayer.style.opacity = "0";
    updateDepthTicks(0);
    updateTerrain(0);
    updateDebris(0);
    spawnMarine(0, currentMode);
    return;
  }

  const zone = getZone(currentDepth);
  zoneName.textContent = zone.name;
  updateRadarAnimalDots(zone.name);
  visibilityValue.textContent = zone.visibility;
  bioValue.textContent = zone.bio;
  tempValue.textContent = zone.temp;
  updateLogButtonUnlockState();

  const pressure = (1 + currentDepth / 10).toFixed(0);
  pressureValue.textContent = `${pressure} atm`;

  oceanBg.style.background = zone.gradient;

  oxygenValue.textContent = `${zone.oxygen}%`;
  oxygenFill.style.width = `${zone.oxygen}%`;

  const glowEnergy = Math.max(18, Math.floor(zone.oxygen * (currentMode === "white" ? 0.74 : 1)));
  glowPercent.textContent = `${glowEnergy}%`;

  if (zone.oxygen > 80) {
    oxygenMode.textContent = "Normal glow behavior / oxygen not yet limiting output.";
    energyText.textContent = "Normal activity. Bioluminescent output is not yet strongly oxygen-limited.";
  } else if (zone.oxygen > 50) {
    oxygenMode.textContent = "Oxygen minimum pressure rising / flashing becomes more selective.";
    energyText.textContent = "Energy conservation beginning. Some organisms reduce glow frequency to preserve metabolism.";
  } else {
    oxygenMode.textContent = "Energy Conservation Mode / metabolic rate suppressed.";
    energyText.textContent = "Energy Conservation Mode: metabolic rate suppressed. Glow pulses dim and slow as oxygen becomes harder to afford.";
  }

  if (fishSchoolLayer) {
    const zoneOpacity =
      currentDepth < 1000 ? 1 :
      currentDepth < 2500 ? 0.45 :
      currentDepth < 4000 ? 0.18 : 0.04;

    fishSchoolLayer.style.opacity = zoneOpacity;
  }

  if (jellyfishLayer) {
    jellyfishLayer.style.opacity = zone.name === "Sunlight Zone" ? "0.82" : "0";
  }

  if (lanternfishLayer) {
    lanternfishLayer.style.opacity = zone.name === "Twilight Zone" ? "0.88" : "0";
  }

  if (hatchetfishLayer) {
    hatchetfishLayer.style.opacity = zone.name === "Twilight Zone" ? "0.86" : "0";
  }

  if (viperfishLayer) {
    viperfishLayer.style.opacity = zone.name === "Twilight Zone" ? "0.78" : "0";
  }

  if (combJellyLayer) {
    combJellyLayer.style.opacity = (zone.name === "Sunlight Zone" || zone.name === "Abyssal Zone") ? "0.9" : "0";
  }

  if (anglerfishLayer) {
    anglerfishLayer.style.opacity = zone.name === "Midnight Zone" ? "1" : "0";
  }

  if (atollaJellyfishLayer) {
    atollaJellyfishLayer.style.opacity = zone.name === "Midnight Zone" ? "0.94" : "0";
  }

  if (dumboOctopusLayer) {
    dumboOctopusLayer.style.opacity = zone.name === "Midnight Zone" ? "0.96" : "0";
  }

  updateDepthTicks(sceneProgress);
  updateTerrain(currentDepth);
  updateDebris(currentDepth);
  spawnMarine(currentDepth, currentMode);
}

function handleScroll() {
  updateEnvironment(getScrollProgress());
}


function refreshLogbookAfterUnlock(unlockedAnimals) {
  updateLogButtonUnlockState();
  if (logCarouselOverlay && !logCarouselOverlay.classList.contains("hidden")) {
    currentLogZoneName = getCurrentLogZoneName();
    carouselOrder = sortAnimalsForZone(currentLogZoneName);
    carouselFocusIndex = getUnlockedCenterIndex(carouselOrder, currentLogZoneName);
    logCarouselZone.textContent = currentLogZoneName;
    renderAnimalCarousel();
  }
}

function finishScanField() {
  const animalsInsideScanner = getAnimalsInsideScannerForCurrentZone();
  const unlockedAnimals = animalsInsideScanner.filter((animal) => !scannedAnimalIds.has(animal.id));
  const alreadyUnlockedAnimals = animalsInsideScanner.filter((animal) => scannedAnimalIds.has(animal.id));

  if (unlockedAnimals.length) {
    unlockedAnimals.forEach((animal) => scannedAnimalIds.add(animal.id));
    lastScannedAnimalId = unlockedAnimals[0].id;
    hasNewLogUnlocks = true;
    saveScannedAnimals();
    if (scannerStatus) scannerStatus.textContent = "UNLOCKED";
    refreshLogbookAfterUnlock(unlockedAnimals);
    if (isMissionComplete()) {
      missionCompleteAwaitingLogReview = true;
      if (scannerStatus) scannerStatus.textContent = "LOG REVIEW";
      updateLogButtonUnlockState();
    }
  } else if (alreadyUnlockedAnimals.length) {
    lastScannedAnimalId = alreadyUnlockedAnimals[0].id;
    if (scannerStatus) scannerStatus.textContent = "COMPLETE";
    updateLogButtonUnlockState();
  } else {
    if (scannerStatus) scannerStatus.textContent = "SCANNING..";
    updateLogButtonUnlockState();
  }

  setTimeout(() => {
    scanFieldActive = false;
    document.body.classList.remove("scanner-active");
    if (scannerFieldOverlay) {
      scannerFieldOverlay.classList.add("hidden");
      scannerFieldOverlay.setAttribute("aria-hidden", "true");
    }
    if (scannerStatus) scannerStatus.textContent = "SCANNING..";
  }, 950);
}

function triggerScanField() {
  if (scanFieldActive) return;
  scanFieldActive = true;
  clearTimeout(scanFieldTimeout);
  document.body.classList.add("scanner-active");
  if (scannerFieldOverlay) {
    scannerFieldOverlay.classList.remove("hidden");
    scannerFieldOverlay.setAttribute("aria-hidden", "false");
  }
  if (scannerStatus) scannerStatus.textContent = "SCANNING..";
  scanFieldTimeout = setTimeout(finishScanField, 2000);
}

/* EVENTS */
updateLogButtonUnlockState();
if (scanFieldBtn) scanFieldBtn.addEventListener("click", triggerScanField);
if (soundToggleBtn) soundToggleBtn.addEventListener("click", toggleBackgroundSound);
if (beginNewDescentBtn) beginNewDescentBtn.addEventListener("click", resetSessionProgress);
if (logCarouselBtn) logCarouselBtn.addEventListener("click", openLogCarousel);
if (closeLogCarousel) closeLogCarousel.addEventListener("click", closeLogCarouselPanel);
if (logCarouselPrev) logCarouselPrev.addEventListener("click", () => moveCarousel(-1));
if (logCarouselNext) logCarouselNext.addEventListener("click", () => moveCarousel(1));
if (backToCarousel) backToCarousel.addEventListener("click", () => {
  animalDetailView.classList.add("hidden");
  logCarouselMenu.classList.remove("hidden");
  renderAnimalCarousel();
});
if (commsBtn) commsBtn.addEventListener("click", openMissionBrief);
if (closeMissionBrief) closeMissionBrief.addEventListener("click", closeMissionBriefPanel);
if (mapBtn) mapBtn.addEventListener("click", openMapPanel);
if (closeMap) closeMap.addEventListener("click", closeMapPanel);

miningAlarmBtn.addEventListener("click", openMiningPopup);
alarmQuickBtn.addEventListener("click", openMiningPopup);
miningBlip.addEventListener("click", openMiningPopup);

window.addEventListener("click", (e) => {
  if (e.target === miningPopupOverlay) {
    miningPopupOverlay.classList.add("hidden");
  }
  if (e.target === logCarouselOverlay) {
    closeLogCarouselPanel();
  }
  if (e.target === missionBriefOverlay) {
    closeMissionBriefPanel();
  }
  if (e.target === mapOverlay) {
    closeMapPanel();
  }
});

/* LOOP */
function animateLoop(now) {
  updateMiningPass(now);
  requestAnimationFrame(animateLoop);
}

/* ANIMATION KEYFRAMES */
const style = document.createElement("style");
style.innerHTML = `
@keyframes bioBlink {
  0%, 100% { opacity: 0.08; transform: scale(0.72); }
  50% { opacity: 1; transform: scale(1.25); }
}
`;
document.head.appendChild(style);

/* INIT */
forceSoundOn({ restart: true });
scheduleIdleReset();
["pointerdown", "keydown", "touchstart", "mousemove", "scroll"].forEach((eventName) => {
  window.addEventListener(eventName, markActivity, { passive: true });
});
buildDepthTicks();
createBubbles();
buildMiningSystem();
buildFishSchool();
setupSurfaceWaves();
setupJellyfishLayer();
setupLanternfishLayer();
setupHatchetfishLayer();
setupViperfishLayer();
setupCombJellyLayer();
setupAnglerfishLayer();
setupAtollaJellyfishLayer();
setupDumboOctopusLayer();
setMode("white");
handleScroll();
animateParticles();
requestAnimationFrame(animateLoop);

window.addEventListener("scroll", handleScroll);
window.addEventListener("resize", () => {
    handleScroll();
    buildFishSchool();
    resizeSurfaceWaves();
    resizeJellyfishCanvas();
    createJellyfishSet();
    resizeLanternfishCanvas();
    createLanternfishSet();
    resizeHatchetfishCanvas();
    createHatchetfishSet();
    resizeViperfishCanvas();
    createViperfishSet();
    resizeCombJellyCanvas();
    createCombJellies();
    resizeAnglerfishCanvas();
    createAnglerfishSet();
    resizeDumboOctopusCanvas();
    createDumboOctopusSet();
  });
