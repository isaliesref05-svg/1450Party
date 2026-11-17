import { MapId } from './types';

export const ARENA_W = 1280;
export const ARENA_H = 720;

export interface MovingPlatformDef {
  x: number;
  y: number;
  w: number;
  h: number;
  dx: number;
  dy: number;
  speed: number;
  phase?: number;
}

export interface PillarDef {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface IceDef {
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
}

export interface PortalDef {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  color: string;
}

export interface LaserGateDef {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  period: number;
  offset: number;
  activeLen: number;
  warnLen: number;
}

export interface PendulumDef {
  px: number;
  py: number;
  len: number;
  amp: number;
  speed: number;
  phase: number;
  radius: number;
}

export interface BumperDef {
  x: number;
  y: number;
  r: number;
  power: number;
  color: string;
}

export interface LiftZoneDef {
  x: number;
  y: number;
  w: number;
  h: number;
  force?: number;
  color?: string;
}

export interface ArenaMapDef {
  id: Exclude<MapId, 'random'>;
  name: string;
  style:
    | 'minecraft'
    | 'pirate'
    | 'pyramid'
    | 'snow'
    | 'foundry'
    | 'neon'
    | 'lava'
    | 'citadel'
    | 'space'
    | 'forest'
    | 'vault';
  pl: [number, number, number, number][];
  sp: [number, number][];
  g?: number;
  js?: number;
  fr?: number;
  walls?: boolean;
  bounceWalls?: boolean;
  lava?: boolean;
  chasm?: boolean;
  belts?: [number, number][];
  pads?: [number, number, number][];
  moving?: MovingPlatformDef[];
  pillars?: PillarDef[];
  ice?: IceDef[];
  portals?: PortalDef[];
  lasers?: LaserGateDef[];
  pendulums?: PendulumDef[];
  bumpers?: BumperDef[];
  lifts?: LiftZoneDef[];
}

export const ARENA_MAPS: Record<Exclude<MapId, 'random'>, ArenaMapDef> = {
  minecraft: {
    id: 'minecraft',
    name: 'Minecraft Dünyası',
    style: 'minecraft',
    walls: true,
    pl: [
      [0, 625, 500, 95],
      [780, 625, 500, 95],
      [500, 635, 280, 85],
      [40, 515, 195, 28],
      [1045, 515, 195, 28],
      [120, 405, 200, 28],
      [960, 405, 200, 28],
      [515, 325, 250, 28],
    ],
    pillars: [
      { x: 285, y: 515, w: 42, h: 110 },
      { x: 953, y: 515, w: 42, h: 110 },
    ],
    sp: [
      [0, 0.42],
      [1, 0.58],
      [3, 0.5],
      [4, 0.5],
    ],
    pads: [
      [640, 635, 96],
    ],
    moving: [
      { x: 355, y: 455, w: 130, h: 26, dx: 0, dy: 60, speed: 0.025, phase: 0 },
      { x: 795, y: 455, w: 130, h: 26, dx: 0, dy: 60, speed: 0.025, phase: 0 },
    ],
  },

  pirate_ship: {
    id: 'pirate_ship',
    name: 'Korsan Gəmisi',
    style: 'pirate',
    walls: true,
    pl: [
      [0, 632, 1280, 88],
      [260, 525, 760, 34],
      [45, 420, 200, 28],
      [1035, 420, 200, 28],
      [520, 315, 240, 26],
    ],
    pillars: [
      { x: 375, y: 405, w: 36, h: 120 },
      { x: 869, y: 405, w: 36, h: 120 },
    ],
    sp: [
      [1, 0.22],
      [1, 0.78],
      [2, 0.5],
      [3, 0.5],
    ],
    pads: [
      [125, 632, 84],
      [1155, 632, 84],
    ],
    pendulums: [
      { px: 640, py: -35, len: 295, amp: 0.5, speed: 0.025, phase: 0, radius: 28 },
    ],
    bumpers: [
      { x: 425, y: 415, r: 22, power: 12.5, color: '#f59e0b' },
      { x: 855, y: 415, r: 22, power: 12.5, color: '#f59e0b' },
    ],
  },

  desert_pyramid: {
    id: 'desert_pyramid',
    name: 'Səhra Piramidası',
    style: 'pyramid',
    walls: true,
    pl: [
      [0, 632, 1280, 88],
      [220, 540, 840, 32],
      [350, 448, 580, 32],
      [480, 356, 320, 30],
      [555, 268, 170, 28],
      [35, 420, 145, 28],
      [1100, 420, 145, 28],
    ],
    pillars: [
      { x: 135, y: 514, w: 40, h: 118 },
      { x: 1105, y: 514, w: 40, h: 118 },
    ],
    sp: [
      [0, 0.14],
      [0, 0.86],
      [5, 0.5],
      [6, 0.5],
    ],
    lifts: [
      { x: 65, y: 380, w: 58, h: 252, force: 0.9, color: '#fbbf24' },
      { x: 1157, y: 380, w: 58, h: 252, force: 0.9, color: '#fbbf24' },
    ],
  },

  snow_peaks: {
    id: 'snow_peaks',
    name: 'Qarlı Zirvə',
    style: 'snow',
    walls: true,
    chasm: true,
    fr: 0.955,
    pl: [
      [0, 625, 410, 95],
      [870, 625, 410, 95],
      [55, 518, 225, 28],
      [1000, 518, 225, 28],
      [60, 340, 175, 26],
      [1045, 340, 175, 26],
    ],
    pillars: [
      { x: 255, y: 518, w: 38, h: 107 },
      { x: 987, y: 518, w: 38, h: 107 },
    ],
    ice: [
      { x: 415, y: 625, w: 220, h: 30, hp: 75 },
      { x: 645, y: 625, w: 220, h: 30, hp: 75 },
      { x: 345, y: 430, w: 210, h: 28, hp: 60 },
      { x: 725, y: 430, w: 210, h: 28, hp: 60 },
      { x: 520, y: 338, w: 240, h: 28, hp: 60 },
    ],
    sp: [
      [0, 0.46],
      [1, 0.54],
      [2, 0.5],
      [3, 0.5],
    ],
    pads: [
      [350, 625, 68],
      [930, 625, 68],
    ],
    lifts: [
      { x: 14, y: 350, w: 50, h: 275, force: 0.9, color: '#7dd3fc' },
      { x: 1216, y: 350, w: 50, h: 275, force: 0.9, color: '#7dd3fc' },
    ],
  },

  steel_foundry: {
    id: 'steel_foundry',
    name: 'Polad Zavod',
    style: 'foundry',
    walls: true,
    pl: [
      [0, 625, 1280, 95],
      [145, 520, 300, 28],
      [835, 520, 300, 28],
      [40, 410, 195, 28],
      [1045, 410, 195, 28],
      [505, 325, 270, 28],
    ],
    pillars: [
      { x: 465, y: 505, w: 38, h: 120 },
      { x: 777, y: 505, w: 38, h: 120 },
    ],
    sp: [
      [0, 0.14],
      [0, 0.86],
      [3, 0.5],
      [4, 0.5],
    ],
    belts: [
      [1, 1],
      [2, -1],
    ],
    pads: [
      [95, 625, 82],
      [1185, 625, 82],
    ],
    moving: [
      { x: 300, y: 405, w: 145, h: 26, dx: 95, dy: 0, speed: 0.024, phase: 0 },
      { x: 835, y: 405, w: 145, h: 26, dx: 95, dy: 0, speed: 0.024, phase: Math.PI },
    ],
    bumpers: [
      { x: 640, y: 425, r: 24, power: 13, color: '#fb923c' },
    ],
  },

  neon_city: {
    id: 'neon_city',
    name: 'Neon Metropol',
    style: 'neon',
    walls: true,
    pl: [
      [0, 625, 1280, 95],
      [45, 515, 225, 28],
      [1010, 515, 225, 28],
      [460, 425, 360, 28],
      [200, 330, 225, 28],
      [855, 330, 225, 28],
    ],
    pillars: [
      { x: 305, y: 515, w: 36, h: 110 },
      { x: 939, y: 515, w: 36, h: 110 },
    ],
    sp: [
      [0, 0.22],
      [0, 0.78],
      [1, 0.5],
      [2, 0.5],
    ],
    pads: [
      [640, 625, 96],
    ],
    portals: [
      { ax: 75, ay: 568, bx: 1205, by: 568, color: '#22d3ee' },
    ],
    bumpers: [
      { x: 640, y: 295, r: 24, power: 13.5, color: '#22d3ee' },
      { x: 405, y: 525, r: 20, power: 12, color: '#f472b6' },
      { x: 875, y: 525, r: 20, power: 12, color: '#f472b6' },
    ],
  },

  lava_core: {
    id: 'lava_core',
    name: 'Vulkan Krateri',
    style: 'lava',
    lava: true,
    pl: [
      [85, 540, 250, 32],
      [945, 540, 250, 32],
      [200, 430, 220, 30],
      [860, 430, 220, 30],
      [490, 345, 300, 30],
      [525, 250, 230, 28],
    ],
    pillars: [
      { x: 385, y: 455, w: 38, h: 130 },
      { x: 857, y: 455, w: 38, h: 130 },
    ],
    sp: [
      [0, 0.5],
      [1, 0.5],
      [2, 0.5],
      [3, 0.5],
    ],
    moving: [
      { x: 545, y: 550, w: 190, h: 28, dx: 0, dy: 48, speed: 0.032, phase: 0 },
    ],
  },

  sky_citadel: {
    id: 'sky_citadel',
    name: 'Qala Körpüsü',
    style: 'citadel',
    walls: true,
    pl: [
      [0, 625, 1280, 95],
      [360, 520, 560, 32],
      [45, 425, 200, 28],
      [1035, 425, 200, 28],
      [505, 405, 270, 28],
      [285, 315, 195, 28],
      [800, 315, 195, 28],
    ],
    pillars: [
      { x: 265, y: 505, w: 42, h: 120 },
      { x: 973, y: 505, w: 42, h: 120 },
    ],
    sp: [
      [0, 0.16],
      [0, 0.84],
      [2, 0.5],
      [3, 0.5],
    ],
    pads: [
      [140, 625, 80],
      [1140, 625, 80],
    ],
    pendulums: [
      { px: 430, py: -40, len: 290, amp: 0.48, speed: 0.026, phase: 0, radius: 28 },
      { px: 850, py: -40, len: 290, amp: 0.48, speed: 0.026, phase: Math.PI, radius: 28 },
    ],
  },

  space_station: {
    id: 'space_station',
    name: 'Orbital Stansiya',
    style: 'space',
    g: 0.32,
    js: 0.82,
    bounceWalls: true,
    pl: [
      [0, 630, 1280, 90],
      [60, 515, 225, 28],
      [995, 515, 225, 28],
      [245, 405, 220, 28],
      [815, 405, 220, 28],
      [525, 305, 230, 28],
    ],
    pillars: [
      { x: 305, y: 520, w: 36, h: 110 },
      { x: 939, y: 520, w: 36, h: 110 },
    ],
    sp: [
      [0, 0.18],
      [0, 0.82],
      [1, 0.5],
      [2, 0.5],
    ],
    lifts: [
      { x: 585, y: 270, w: 110, h: 360, force: 0.62, color: '#38bdf8' },
    ],
    bumpers: [
      { x: 425, y: 495, r: 24, power: 13, color: '#818cf8' },
      { x: 855, y: 495, r: 24, power: 13, color: '#818cf8' },
    ],
  },

  ancient_forest: {
    id: 'ancient_forest',
    name: 'Meşə Məbədi',
    style: 'forest',
    walls: true,
    pl: [
      [0, 625, 1280, 95],
      [65, 515, 215, 28],
      [1000, 515, 215, 28],
      [480, 420, 320, 28],
      [195, 325, 220, 28],
      [865, 325, 220, 28],
    ],
    pillars: [
      { x: 305, y: 515, w: 42, h: 110 },
      { x: 933, y: 515, w: 42, h: 110 },
    ],
    sp: [
      [0, 0.16],
      [0, 0.84],
      [1, 0.5],
      [2, 0.5],
    ],
    pads: [
      [385, 625, 80],
      [895, 625, 80],
    ],
    lifts: [
      { x: 600, y: 295, w: 80, h: 330, force: 0.88, color: '#4ade80' },
    ],
  },

  laser_vault: {
    id: 'laser_vault',
    name: 'Lazer Anbarı',
    style: 'vault',
    walls: true,
    pl: [
      [0, 625, 1280, 95],
      [430, 515, 420, 30],
      [250, 405, 215, 28],
      [815, 405, 215, 28],
      [525, 305, 230, 28],
    ],
    pillars: [
      { x: 365, y: 510, w: 38, h: 115 },
      { x: 877, y: 510, w: 38, h: 115 },
    ],
    sp: [
      [0, 0.15],
      [0, 0.85],
      [2, 0.5],
      [3, 0.5],
    ],
    moving: [
      { x: 65, y: 435, w: 155, h: 26, dx: 0, dy: 75, speed: 0.025, phase: 0 },
      { x: 1060, y: 435, w: 155, h: 26, dx: 0, dy: 75, speed: 0.025, phase: Math.PI },
    ],
    lasers: [
      { x1: 640, y1: 333, x2: 640, y2: 515, period: 260, offset: 0, warnLen: 55, activeLen: 65 },
      { x1: 365, y1: 420, x2: 915, y2: 420, period: 300, offset: 150, warnLen: 55, activeLen: 65 },
    ],
  },
};

export function randomMapKey(): Exclude<MapId, 'random'> {
  const keys = Object.keys(ARENA_MAPS) as Exclude<MapId, 'random'>[];
  return keys[Math.floor(Math.random() * keys.length)];
}

export function getMovingBounds(m: MovingPlatformDef, t: number): [number, number, number, number] {
  const ph = t * m.speed + (m.phase || 0);
  return [
    m.x + Math.sin(ph) * m.dx,
    m.y + Math.sin(ph) * m.dy,
    m.w,
    m.h,
  ];
}

export function getPendulumBob(p: PendulumDef, t: number): [number, number, number] {
  const ang = p.amp * Math.sin(t * p.speed + p.phase);
  return [p.px + Math.sin(ang) * p.len, p.py + Math.cos(ang) * p.len, ang];
}

export function getLaserState(l: LaserGateDef, t: number): 'idle' | 'warn' | 'active' {
  const cyc = (t + l.offset) % l.period;
  if (cyc > l.period - l.activeLen) return 'active';
  if (cyc > l.period - l.activeLen - l.warnLen) return 'warn';
  return 'idle';
}

function seeded(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

export function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

export function buildMapBackground(style: ArenaMapDef['style']): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = ARENA_W;
  c.height = ARENA_H;
  const g = c.getContext('2d')!;
  const r = seeded(17);

  const skyCols: Record<ArenaMapDef['style'], [string, string, string]> = {
    minecraft: ['#4d9eff', '#7ac0ff', '#bae3ff'],
    pirate: ['#091326', '#10294a', '#18426b'],
    pyramid: ['#261409', '#7c3f12', '#d97724'],
    snow: ['#030816', '#081530', '#112c54'],
    foundry: ['#0c0d11', '#1a1618', '#3d1c0f'],
    neon: ['#070516', '#160b32', '#2d1148'],
    lava: ['#0f0304', '#290707', '#5a120a'],
    citadel: ['#0f1119', '#1e2230', '#383028'],
    space: ['#020309', '#09071d', '#161036'],
    forest: ['#030d0b', '#08221b', '#124031'],
    vault: ['#07080b', '#12141a', '#1d2029'],
  };

  const [c0, c1, c2] = skyCols[style];
  const gr = g.createLinearGradient(0, 0, 0, ARENA_H);
  gr.addColorStop(0, c0);
  gr.addColorStop(0.58, c1);
  gr.addColorStop(1, c2);
  g.fillStyle = gr;
  g.fillRect(0, 0, ARENA_W, ARENA_H);

  // Subtle symmetric architectural background columns for depth
  const drawBgColonnade = (col: string, accent: string, count = 4) => {
    const positions = count === 4 ? [150, 415, 865, 1130] : [200, 640, 1080];
    for (const cx of positions) {
      g.fillStyle = col;
      g.fillRect(cx - 22, 0, 44, ARENA_H);
      g.fillStyle = accent;
      g.fillRect(cx - 22, 0, 4, ARENA_H);
      g.fillRect(cx + 18, 0, 4, ARENA_H);
    }
  };

  if (style === 'minecraft') {
    g.fillStyle = 'rgba(254,240,138,0.35)';
    g.fillRect(594, 46, 92, 92);
    g.fillStyle = '#fef08a';
    g.fillRect(608, 60, 64, 64);

    g.fillStyle = 'rgba(255,255,255,0.88)';
    for (const [cx, cy, cw] of [[110, 90, 180], [390, 68, 160], [730, 68, 160], [990, 90, 180]]) {
      g.fillRect(cx, cy, cw, 26);
      g.fillRect(cx + 28, cy - 20, cw - 56, 20);
    }

    const bs = 28;
    for (let bx = 0; bx < ARENA_W; bx += bs) {
      const symX = Math.abs(bx - ARENA_W / 2);
      const hBlocks = 3 + Math.floor(Math.cos(symX * 0.012) * 2.5 + 3);
      const topY = ARENA_H - 96 - hBlocks * bs;
      g.fillStyle = '#3b8526';
      g.fillRect(bx, topY, bs, bs);
      g.fillStyle = '#5c4028';
      g.fillRect(bx, topY + bs, bs, hBlocks * bs);
      g.fillStyle = 'rgba(0,0,0,0.08)';
      g.strokeRect(bx, topY, bs, bs);
    }

    for (const [tx, ty] of [[210, 495], [1070, 495]]) {
      g.fillStyle = '#5c3c22';
      g.fillRect(tx - 14, ty, 28, 120);
      g.fillStyle = '#3e2715';
      g.fillRect(tx - 6, ty + 14, 10, 90);
      g.fillStyle = '#2f7a24';
      g.fillRect(tx - 56, ty - 70, 112, 74);
      g.fillStyle = '#449e33';
      g.fillRect(tx - 38, ty - 98, 76, 36);
    }
  } else if (style === 'pirate') {
    const mg = g.createRadialGradient(640, 125, 10, 640, 125, 190);
    mg.addColorStop(0, 'rgba(241,245,249,0.95)');
    mg.addColorStop(0.28, 'rgba(186,230,253,0.28)');
    mg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = mg;
    g.fillRect(420, 0, 440, 320);

    g.fillStyle = '#1d120c';
    g.fillRect(628, 40, 24, 590);
    g.fillRect(360, 215, 560, 16);
    g.fillRect(420, 105, 440, 14);
    g.fillStyle = 'rgba(226,232,240,0.14)';
    g.beginPath();
    g.moveTo(390, 225);
    g.quadraticCurveTo(640, 265, 890, 225);
    g.lineTo(840, 415);
    g.quadraticCurveTo(640, 375, 440, 415);
    g.closePath();
    g.fill();

    g.fillStyle = '#0c2745';
    g.fillRect(0, 520, ARENA_W, 200);
    g.fillStyle = '#164675';
    g.beginPath();
    g.moveTo(0, 555);
    for (let x = 0; x <= ARENA_W; x += 64) {
      g.quadraticCurveTo(x + 32, 535, x + 64, 555);
    }
    g.lineTo(ARENA_W, ARENA_H);
    g.lineTo(0, ARENA_H);
    g.closePath();
    g.fill();
  } else if (style === 'pyramid') {
    drawBgColonnade('rgba(69,26,3,0.45)', 'rgba(251,191,36,0.12)', 4);
    const sg = g.createRadialGradient(640, 185, 16, 640, 185, 220);
    sg.addColorStop(0, '#fef08a');
    sg.addColorStop(0.35, 'rgba(251,146,60,0.55)');
    sg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = sg;
    g.fillRect(380, 0, 520, 430);

    const drawPyr = (cx: number, baseW: number, height: number, leftCol: string, rightCol: string) => {
      g.fillStyle = leftCol;
      g.beginPath();
      g.moveTo(cx, 620 - height);
      g.lineTo(cx - baseW / 2, 620);
      g.lineTo(cx, 620);
      g.closePath();
      g.fill();
      g.fillStyle = rightCol;
      g.beginPath();
      g.moveTo(cx, 620 - height);
      g.lineTo(cx + baseW / 2, 620);
      g.lineTo(cx, 620);
      g.closePath();
      g.fill();
    };
    drawPyr(230, 420, 310, '#78350f', '#451a03');
    drawPyr(1050, 420, 310, '#78350f', '#451a03');

    g.fillStyle = '#5c2b0e';
    g.beginPath();
    g.moveTo(0, 520);
    g.quadraticCurveTo(640, 560, 1280, 520);
    g.lineTo(ARENA_W, ARENA_H);
    g.lineTo(0, ARENA_H);
    g.closePath();
    g.fill();
  } else if (style === 'snow') {
    // Stick Fight-inspired arctic night sky: crisp stars, soft aurora & crystal peaks
    for (let i = 0; i < 180; i++) {
      const sz = r() < 0.14 ? 2.4 : 1.4;
      g.fillStyle = `rgba(226,242,255,${0.25 + r() * 0.72})`;
      g.fillRect(r() * ARENA_W, r() * ARENA_H * 0.72, sz, sz);
    }

    const aur = g.createLinearGradient(120, 40, 1160, 220);
    aur.addColorStop(0, 'rgba(56,189,248,0)');
    aur.addColorStop(0.28, 'rgba(45,212,191,0.22)');
    aur.addColorStop(0.5, 'rgba(125,211,252,0.26)');
    aur.addColorStop(0.72, 'rgba(45,212,191,0.22)');
    aur.addColorStop(1, 'rgba(56,189,248,0)');
    g.fillStyle = aur;
    g.beginPath();
    g.moveTo(0, 150);
    g.bezierCurveTo(320, 45, 960, 45, 1280, 150);
    g.lineTo(1280, 235);
    g.bezierCurveTo(960, 145, 320, 145, 0, 235);
    g.closePath();
    g.fill();

    // Centered moon halo
    const mg = g.createRadialGradient(640, 115, 8, 640, 115, 190);
    mg.addColorStop(0, 'rgba(240,249,255,0.92)');
    mg.addColorStop(0.2, 'rgba(186,230,253,0.32)');
    mg.addColorStop(1, 'rgba(180,220,255,0)');
    g.fillStyle = mg;
    g.fillRect(420, 0, 440, 320);

    // Distant icy crystal pillars in background
    drawBgColonnade('rgba(14,42,74,0.45)', 'rgba(125,211,252,0.12)', 4);

    // Symmetric jagged arctic mountain range
    const layers = [
      { base: 450, amp: 145, col: '#0b1c38', snowCol: '#386296' },
      { base: 545, amp: 105, col: '#071429', snowCol: '#6999cf' },
    ];
    for (const L of layers) {
      g.fillStyle = L.col;
      g.beginPath();
      g.moveTo(0, ARENA_H);
      const pts: [number, number][] = [];
      for (let x = 0; x <= ARENA_W; x += 64) {
        const dist = Math.abs(x - ARENA_W / 2) / (ARENA_W / 2);
        const y = L.base - (Math.abs(Math.sin(dist * Math.PI * 2.5)) * 0.7 + 0.25) * L.amp;
        pts.push([x, y]);
        g.lineTo(x, y);
      }
      g.lineTo(ARENA_W, ARENA_H);
      g.closePath();
      g.fill();
      g.strokeStyle = L.snowCol;
      g.lineWidth = 3;
      g.beginPath();
      pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
      g.stroke();
    }

    // Subtle deep frost mist at chasm bottom
    const chasmMist = g.createLinearGradient(0, 620, 0, ARENA_H);
    chasmMist.addColorStop(0, 'rgba(56,189,248,0)');
    chasmMist.addColorStop(1, 'rgba(125,211,252,0.22)');
    g.fillStyle = chasmMist;
    g.fillRect(0, 620, ARENA_W, 100);
  } else if (style === 'foundry') {
    const vg = g.createLinearGradient(0, 480, 0, ARENA_H);
    vg.addColorStop(0, 'rgba(255,100,20,0)');
    vg.addColorStop(1, 'rgba(255,95,20,0.34)');
    g.fillStyle = vg;
    g.fillRect(0, 480, ARENA_W, 240);

    for (const x of [130, 390, 890, 1150]) {
      g.fillStyle = '#181920';
      g.fillRect(x - 19, 0, 38, ARENA_H);
      g.fillStyle = 'rgba(255,255,255,0.06)';
      g.fillRect(x - 15, 0, 5, ARENA_H);
      g.strokeStyle = '#0e0f13';
      g.lineWidth = 2;
      for (let y = 20; y < ARENA_H; y += 56) {
        g.beginPath();
        g.moveTo(x - 19, y);
        g.lineTo(x + 19, y + 40);
        g.stroke();
      }
    }
    for (const y of [75, 195]) {
      const pg = g.createLinearGradient(0, y, 0, y + 24);
      pg.addColorStop(0, '#4b505c');
      pg.addColorStop(0.5, '#2b2f38');
      pg.addColorStop(1, '#14161b');
      g.fillStyle = pg;
      g.fillRect(0, y, ARENA_W, 22);
    }
    [
      [220, 290, 85],
      [1060, 290, 85],
      [640, 210, 68],
    ].forEach(([cx, cy, rad]) => {
      g.save();
      g.strokeStyle = 'rgba(0,0,0,0.5)';
      g.lineWidth = 14;
      g.setLineDash([12, 10]);
      g.beginPath();
      g.arc(cx, cy, rad, 0, Math.PI * 2);
      g.stroke();
      g.setLineDash([]);
      g.lineWidth = 8;
      g.beginPath();
      g.arc(cx, cy, rad * 0.45, 0, Math.PI * 2);
      g.stroke();
      g.restore();
    });
  } else if (style === 'neon') {
    const sg = g.createLinearGradient(0, 150, 0, 420);
    sg.addColorStop(0, '#fde047');
    sg.addColorStop(0.55, '#fb7185');
    sg.addColorStop(1, '#c026d3');
    g.fillStyle = sg;
    g.beginPath();
    g.arc(640, 310, 138, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#150a2d';
    for (let k = 0; k < 7; k++) g.fillRect(490, 280 + k * 21, 300, 3 + k * 1.4);

    for (let layer = 0; layer < 2; layer++) {
      const step = layer === 0 ? 74 : 58;
      for (let x = 0; x < ARENA_W / 2; x += step) {
        const bw = (layer === 0 ? 52 : 42) + r() * 20;
        const bh = (layer === 0 ? 230 : 150) + r() * 210;
        const by = ARENA_H - bh;
        for (const bx of [x, ARENA_W - x - bw]) {
          g.fillStyle = layer === 0 ? '#0c0820' : '#080515';
          g.fillRect(bx, by, bw, bh);
          g.fillStyle = 'rgba(255,255,255,0.035)';
          g.fillRect(bx, by, 3, bh);
          for (let wy = by + 12; wy < ARENA_H - 18; wy += 16) {
            for (let wx = bx + 7; wx < bx + bw - 9; wx += 11) {
              if (r() < 0.35) {
                g.fillStyle = ['#22d3ee', '#f472b6', '#fde047'][Math.floor(r() * 3)];
                g.globalAlpha = layer === 0 ? 0.32 : 0.65;
                g.fillRect(wx, wy, 5, 7);
                g.globalAlpha = 1;
              }
            }
          }
        }
      }
    }
  } else if (style === 'lava') {
    const glow = g.createRadialGradient(640, 720, 40, 640, 720, 560);
    glow.addColorStop(0, 'rgba(255,100,20,0.48)');
    glow.addColorStop(0.5, 'rgba(180,30,10,0.22)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = glow;
    g.fillRect(0, 0, ARENA_W, ARENA_H);

    for (const x of [110, 320, 640, 960, 1170]) {
      const w = 44;
      g.fillStyle = '#180808';
      g.fillRect(x - w / 2, 0, w, ARENA_H);
      g.strokeStyle = 'rgba(255,110,30,0.35)';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(x - 4, 20);
      g.lineTo(x + 6, 210);
      g.lineTo(x - 8, 440);
      g.lineTo(x + 4, 680);
      g.stroke();
    }
    g.fillStyle = '#140506';
    for (let x = 0; x < ARENA_W; x += 64) {
      const sh = 40 + Math.abs(Math.sin(x * 0.02)) * 75;
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x + 32, sh);
      g.lineTo(x + 64, 0);
      g.closePath();
      g.fill();
    }
  } else if (style === 'citadel') {
    drawBgColonnade('#171a26', 'rgba(251,146,60,0.08)', 4);
    const mg = g.createRadialGradient(640, 150, 8, 640, 150, 210);
    mg.addColorStop(0, 'rgba(255,235,195,0.45)');
    mg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = mg;
    g.fillRect(400, 0, 480, 380);

    g.fillStyle = '#151822';
    g.fillRect(0, 430, ARENA_W, 290);
    for (let x = 0; x < ARENA_W; x += 72) {
      g.fillRect(x, 398, 44, 34);
    }
    for (const tx of [220, 640, 1060]) {
      const tg = g.createRadialGradient(tx, 340, 4, tx, 340, 90);
      tg.addColorStop(0, 'rgba(251,146,60,0.45)');
      tg.addColorStop(1, 'rgba(251,146,60,0)');
      g.fillStyle = tg;
      g.fillRect(tx - 100, 240, 200, 200);
      g.fillStyle = '#fb923c';
      g.beginPath();
      g.arc(tx, 340, 6, 0, Math.PI * 2);
      g.fill();
    }
  } else if (style === 'space') {
    for (let i = 0; i < 300; i++) {
      g.fillStyle = `rgba(255,255,255,${0.2 + r() * 0.8})`;
      const z = r() < 0.12 ? 2.4 : 1.2;
      g.fillRect(r() * ARENA_W, r() * ARENA_H, z, z);
    }
    [
      [300, 200, 350, 'rgba(99,102,241,0.2)'],
      [980, 200, 350, 'rgba(236,72,153,0.16)'],
      [640, 130, 300, 'rgba(56,189,248,0.18)'],
    ].forEach(([nx, ny, nr, nc]) => {
      const ng = g.createRadialGradient(nx as number, ny as number, 0, nx as number, ny as number, nr as number);
      ng.addColorStop(0, nc as string);
      ng.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = ng;
      g.fillRect(0, 0, ARENA_W, ARENA_H);
    });
    const pg = g.createRadialGradient(640, 165, 12, 640, 165, 92);
    pg.addColorStop(0, '#fed7aa');
    pg.addColorStop(0.65, '#c2410c');
    pg.addColorStop(1, '#431407');
    g.fillStyle = pg;
    g.beginPath();
    g.arc(640, 165, 86, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = 'rgba(254,215,170,0.45)';
    g.lineWidth = 7;
    g.beginPath();
    g.ellipse(640, 165, 158, 28, -0.18, 0, Math.PI * 2);
    g.stroke();
    drawBgColonnade('rgba(30,41,59,0.35)', 'rgba(56,189,248,0.16)', 4);
  } else if (style === 'forest') {
    const mg = g.createRadialGradient(640, 135, 6, 640, 135, 220);
    mg.addColorStop(0, 'rgba(230,255,220,0.9)');
    mg.addColorStop(0.25, 'rgba(167,243,208,0.3)');
    mg.addColorStop(1, 'rgba(167,243,208,0)');
    g.fillStyle = mg;
    g.fillRect(360, 0, 560, 380);
    g.fillStyle = '#ecfdf5';
    g.beginPath();
    g.arc(640, 135, 36, 0, Math.PI * 2);
    g.fill();

    for (const tx of [95, 250, 440, 840, 1030, 1185]) {
      g.fillStyle = 'rgba(4,24,18,0.82)';
      g.fillRect(tx - 18, 0, 36, ARENA_H);
    }
    g.fillStyle = 'rgba(16,185,129,0.08)';
    g.fillRect(0, 480, ARENA_W, 240);
  } else if (style === 'vault') {
    drawBgColonnade('rgba(255,255,255,0.035)', 'rgba(255,255,255,0.08)', 4);
    for (const sx of [260, 640, 1020]) {
      const sg = g.createLinearGradient(sx, 0, sx, 620);
      sg.addColorStop(0, 'rgba(255,255,255,0.12)');
      sg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = sg;
      g.beginPath();
      g.moveTo(sx - 24, 0);
      g.lineTo(sx + 24, 0);
      g.lineTo(sx + 150, 620);
      g.lineTo(sx - 150, 620);
      g.closePath();
      g.fill();
    }
    g.strokeStyle = 'rgba(255,255,255,0.04)';
    g.lineWidth = 1;
    for (let y = 60; y < ARENA_H; y += 60) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(ARENA_W, y);
      g.stroke();
    }
  }

  return c;
}

export function drawArenaPillar(
  ctx: CanvasRenderingContext2D,
  p: PillarDef,
  style: ArenaMapDef['style']
) {
  const { x, y, w, h } = p;
  ctx.save();

  const pal: Record<ArenaMapDef['style'], [string, string, string]> = {
    minecraft: ['#5b626c', '#3b4048', '#22d3ee'],
    pirate: ['#6b3e1e', '#361c0b', '#fbbf24'],
    pyramid: ['#d4a154', '#7a501a', '#fef08a'],
    snow: ['#2c6c7d', '#143845', '#e0f2fe'],
    foundry: ['#474d59', '#1e2128', '#f59e0b'],
    neon: ['#241154', '#0b0521', '#22d3ee'],
    lava: ['#382222', '#170909', '#fb923c'],
    citadel: ['#5e584d', '#282420', '#e7e5e4'],
    space: ['#64748b', '#1e293b', '#38bdf8'],
    forest: ['#3e4c3b', '#1b2419', '#4ade80'],
    vault: ['#3f3f46', '#18181b', '#f4f4f5'],
  };
  const [cTop, cBot, accent] = pal[style];

  const gr = ctx.createLinearGradient(x, 0, x + w, 0);
  gr.addColorStop(0, cBot);
  gr.addColorStop(0.35, cTop);
  gr.addColorStop(1, cBot);
  ctx.fillStyle = gr;
  roundRectPath(ctx, x + 2, y + 6, w - 4, h - 6, 3);
  ctx.fill();

  // Vertical fluting lines
  ctx.strokeStyle = 'rgba(0,0,0,0.32)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.34, y + 10);
  ctx.lineTo(x + w * 0.34, y + h - 8);
  ctx.moveTo(x + w * 0.66, y + 10);
  ctx.lineTo(x + w * 0.66, y + h - 8);
  ctx.stroke();

  // Capital & Base trim so players clearly see solid column ledges
  ctx.fillStyle = cTop;
  roundRectPath(ctx, x - 4, y, w + 8, 10, 3);
  ctx.fill();
  roundRectPath(ctx, x - 3, y + h - 9, w + 6, 9, 2);
  ctx.fill();

  ctx.fillStyle = accent;
  ctx.fillRect(x - 3, y, w + 6, 2.5);
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 2, y + 10, w - 4, h - 19);

  ctx.restore();
}

export function drawIceBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  hpRatio: number,
  shake = 0
) {
  ctx.save();
  if (shake > 0) {
    ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
  }
  // Stick Fight inspired translucent cyan-teal ice body
  const gr = ctx.createLinearGradient(0, y, 0, y + h);
  gr.addColorStop(0, '#3a8696');
  gr.addColorStop(0.55, '#255c69');
  gr.addColorStop(1, '#173c47');
  ctx.fillStyle = gr;
  roundRectPath(ctx, x, y + 2, w, h - 2, 4);
  ctx.fill();

  // Subtle internal crystalline highlight bands
  ctx.fillStyle = 'rgba(186,230,253,0.18)';
  ctx.beginPath();
  ctx.moveTo(x + 14, y + 6);
  ctx.lineTo(x + 32, y + 6);
  ctx.lineTo(x + 18, y + h - 2);
  ctx.lineTo(x + 4, y + h - 2);
  ctx.closePath();
  ctx.fill();

  // Thick bright snow cap on top (like Stick Fight!)
  ctx.fillStyle = '#f8fafc';
  roundRectPath(ctx, x - 2, y - 3, w + 4, 9, 4);
  ctx.fill();
  ctx.fillStyle = '#bae6fd';
  ctx.fillRect(x, y + 4, w, 2);

  // Subtle icicles underneath
  ctx.fillStyle = 'rgba(186,230,253,0.65)';
  for (let k = x + 16; k < x + w - 12; k += 38) {
    ctx.beginPath();
    ctx.moveTo(k, y + h);
    ctx.lineTo(k + 5, y + h + 9);
    ctx.lineTo(k + 10, y + h);
    ctx.closePath();
    ctx.fill();
  }

  // Fracture crack web when damaged
  if (hpRatio < 0.92) {
    const severity = 1 - hpRatio;
    ctx.strokeStyle = `rgba(240,249,255,${0.55 + severity * 0.45})`;
    ctx.lineWidth = severity > 0.5 ? 2.2 : 1.5;
    const step = 48;
    for (let cx = x + 26; cx < x + w - 20; cx += step) {
      ctx.beginPath();
      ctx.moveTo(cx, y + 5);
      ctx.lineTo(cx - 8, y + h * 0.48);
      ctx.lineTo(cx + 6, y + h * 0.82);
      if (severity > 0.4) {
        ctx.moveTo(cx - 8, y + h * 0.48);
        ctx.lineTo(cx + 12, y + h * 0.35);
      }
      if (severity > 0.65) {
        ctx.moveTo(cx + 6, y + h * 0.82);
        ctx.lineTo(cx - 14, y + h - 2);
      }
      ctx.stroke();
    }
  }

  ctx.strokeStyle = 'rgba(224,242,254,0.45)';
  ctx.lineWidth = 1.2;
  roundRectPath(ctx, x, y + 2, w, h - 2, 4);
  ctx.stroke();
  ctx.restore();
}

export function drawArenaPlatform(
  ctx: CanvasRenderingContext2D,
  p: [number, number, number, number],
  style: ArenaMapDef['style']
) {
  const [x, y, w, h] = p;
  ctx.save();
  if (style === 'minecraft') {
    const isPlanks = y === 635 || y === 515;
    const isDiamondSky = y === 405 || y === 325;
    const tile = 20;

    if (isPlanks) {
      ctx.fillStyle = '#9c6b3b';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#5c3c1b';
      ctx.lineWidth = 1.5;
      for (let bx = x; bx < x + w; bx += 24) {
        ctx.fillStyle = Math.floor(bx / 24) % 2 === 0 ? '#ad7944' : '#8e5f32';
        ctx.fillRect(bx, y, Math.min(24, x + w - bx), Math.min(h, 16));
        ctx.strokeRect(bx, y, Math.min(24, x + w - bx), Math.min(h, 16));
      }
      ctx.strokeStyle = '#3f2810';
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    } else if (isDiamondSky) {
      ctx.fillStyle = '#575d66';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#272a30';
      ctx.lineWidth = 1;
      for (let bx = x; bx < x + w; bx += tile) {
        const bw = Math.min(tile, x + w - bx);
        ctx.fillStyle = ((bx / tile) | 0) % 2 === 0 ? '#68707a' : '#4f565f';
        ctx.fillRect(bx, y, bw, Math.min(tile, h));
        ctx.strokeRect(bx, y, bw, Math.min(tile, h));
        if (((bx / tile) | 0) % 3 === 1) {
          ctx.fillStyle = '#22d3ee';
          ctx.fillRect(bx + 4, y + 5, 5, 5);
          ctx.fillRect(bx + 11, y + 10, 4, 4);
        }
      }
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(x, y, w, 3);
    } else {
      ctx.fillStyle = '#6d4c30';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#4ea832';
      ctx.fillRect(x, y, w, 10);
      ctx.fillStyle = '#6ad444';
      ctx.fillRect(x, y, w, 4);
      ctx.strokeStyle = 'rgba(0,0,0,0.26)';
      ctx.lineWidth = 1;
      for (let bx = x; bx < x + w; bx += tile) {
        const bw = Math.min(tile, x + w - bx);
        ctx.strokeRect(bx, y, bw, Math.min(tile, h));
        if (((bx / tile) | 0) % 2 === 0) {
          ctx.fillStyle = '#43942b';
          ctx.fillRect(bx + 3, y + 8, 6, 4);
        }
      }
    }
  } else if (style === 'pirate') {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#7c4a24');
    g.addColorStop(1, '#3b210e');
    ctx.fillStyle = g;
    roundRectPath(ctx, x, y, w, h, 3);
    ctx.fill();
    ctx.strokeStyle = '#261408';
    ctx.lineWidth = 1.5;
    for (let bx = x + 36; bx < x + w; bx += 36) {
      ctx.beginPath();
      ctx.moveTo(bx, y);
      ctx.lineTo(bx, y + h);
      ctx.stroke();
    }
    ctx.fillStyle = '#fbbf24';
    for (let bx = x + 16; bx < x + w - 8; bx += 36) {
      ctx.beginPath();
      ctx.arc(bx, y + 6, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x, y, w, 3);
  } else if (style === 'pyramid') {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#e6b86a');
    g.addColorStop(1, '#8c5a1e');
    ctx.fillStyle = g;
    roundRectPath(ctx, x, y, w, h, 3);
    ctx.fill();
    ctx.strokeStyle = 'rgba(92,51,16,0.55)';
    ctx.lineWidth = 1.5;
    for (let bx = x + 44; bx < x + w; bx += 44) {
      ctx.beginPath();
      ctx.moveTo(bx, y);
      ctx.lineTo(bx, y + h);
      ctx.stroke();
    }
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x, y, w, 3);
  } else if (style === 'snow') {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#367588');
    g.addColorStop(1, '#143848');
    ctx.fillStyle = g;
    roundRectPath(ctx, x, y, w, h, 5);
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    roundRectPath(ctx, x - 3, y - 4, w + 6, 10, 5);
    ctx.fill();
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(x, y + 4, w, 2);
    ctx.fillStyle = 'rgba(186,230,253,0.75)';
    for (let k = x + 18; k < x + w - 12; k += 42) {
      ctx.beginPath();
      ctx.moveTo(k, y + h);
      ctx.lineTo(k + 6, y + h + Math.min(16, h * 0.45));
      ctx.lineTo(k + 12, y + h);
      ctx.closePath();
      ctx.fill();
    }
  } else if (style === 'foundry') {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#525866');
    g.addColorStop(1, '#1c1f26');
    ctx.fillStyle = g;
    roundRectPath(ctx, x, y, w, h, 3);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x, y, w, 4);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    for (let k = x; k < x + w - 8; k += 18) ctx.fillRect(k, y, 8, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    for (let k = x + 12; k < x + w - 8; k += 36) {
      ctx.beginPath();
      ctx.arc(k, y + h * 0.55, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (style === 'neon') {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#2a1263');
    g.addColorStop(1, '#090418');
    ctx.fillStyle = g;
    roundRectPath(ctx, x, y, w, h, 4);
    ctx.fill();
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#22d3ee';
    ctx.fillRect(x, y, w, 3);
    ctx.shadowColor = '#f472b6';
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(x, y + h - 2.5, w, 2.5);
  } else if (style === 'lava') {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#362222');
    g.addColorStop(1, '#170a0a');
    ctx.fillStyle = g;
    roundRectPath(ctx, x, y, w, h, 5);
    ctx.fill();
    ctx.fillStyle = '#fb923c';
    ctx.fillRect(x + 2, y, w - 4, 3);
    ctx.strokeStyle = 'rgba(251,146,60,0.45)';
    ctx.lineWidth = 1.5;
    for (let k = x + 28; k < x + w - 20; k += 54) {
      ctx.beginPath();
      ctx.moveTo(k, y + 4);
      ctx.lineTo(k + 8, y + h * 0.55);
      ctx.lineTo(k - 4, y + h - 3);
      ctx.stroke();
    }
  } else if (style === 'citadel') {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#645c50');
    g.addColorStop(1, '#292520');
    ctx.fillStyle = g;
    roundRectPath(ctx, x, y, w, h, 3);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 1.5;
    for (let k = x + 36; k < x + w; k += 36) {
      ctx.beginPath();
      ctx.moveTo(k, y);
      ctx.lineTo(k, y + h);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,235,195,0.22)';
    ctx.fillRect(x, y, w, 3);
  } else if (style === 'space') {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#7c859e');
    g.addColorStop(1, '#232738');
    ctx.fillStyle = g;
    roundRectPath(ctx, x, y, w, h, Math.min(14, h / 2));
    ctx.fill();
    ctx.shadowColor = '#93c5fd';
    ctx.shadowBlur = 10;
    ctx.fillStyle = 'rgba(191,219,254,0.85)';
    ctx.fillRect(x + 10, y, w - 20, 2.5);
  } else if (style === 'forest') {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#4d3219');
    g.addColorStop(1, '#1a0f07');
    ctx.fillStyle = g;
    roundRectPath(ctx, x, y, w, h, 5);
    ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(x - 3, y + 7);
    for (let k = 0; k <= w; k += 14) {
      ctx.lineTo(x + k, y - 3 - Math.abs(Math.sin(k * 0.45 + x)) * 4.5);
    }
    ctx.lineTo(x + w + 3, y + 7);
    ctx.closePath();
    ctx.fill();
  } else {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#3f3f46');
    g.addColorStop(1, '#18181b');
    ctx.fillStyle = g;
    roundRectPath(ctx, x, y, w, h, 3);
    ctx.fill();
    ctx.fillStyle = '#f4f4f5';
    ctx.fillRect(x, y, w, 2.5);
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  }
  ctx.restore();
}
