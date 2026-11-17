import { PartyAudio } from './audio';
import { PartyEconomy } from './economy';
import { roundRectPath } from './maps';
import {
  clearReleasedActions,
  inputPlayers,
  MinigameId,
  PLAYER_COLORS,
  PLAYER_NAMES,
  pollKeyboard,
  resetInputs,
} from './types';

export interface MiniPlayer {
  index: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  radius: number;
  angle: number;
  color: string;
  alive: boolean;
  score: number;
  roundStart: number;
  isAttacking: boolean;
  attackTimer: number;
  dashCooldown: number;
  coins: number;
  raceX: number;
  invincible: number;
  onGround: boolean;
  jumpsLeft: number;
  jh: boolean;
  highJ: boolean;
  kingTicks: number;
  throwCd: number;
  snowCd: number;
  trail: { x: number; y: number; life: number }[];
  phase: number;
  leanX: number;
  leanVx: number;
  headX: number;
  headVx: number;
  headY: number;
  headVy: number;
  tilt: number;
  tiltV: number;
  sq: number;
  coyoteT: number;
  jumpBuf: number;
  prevVx: number;
  prevVy: number;
  zHop: number;
  zVel: number;
  weap: 'blaster' | 'shotgun' | 'rapid';
  weapT: number;
  shield: boolean;
}

interface MiniParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  radius: number;
}

interface FloatingPopup {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  life: number;
}

interface MiniProjectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  owner: number;
  life: number;
  snow: boolean;
  color?: string;
  radius?: number;
  bounces?: number;
  dmg?: number;
  kind?: 'bolt' | 'shotgun' | 'sniper';
}

interface CoinItem {
  x: number;
  y: number;
  radius: number;
  life: number;
  diamond: boolean;
  kind?: 'shotgun' | 'rapid' | 'medkit' | 'shield' | 'paintbomb';
}

interface ZombieEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  kind: 0 | 1 | 2; // 0: Walker, 1: Runner, 2: Brute
  phase: number;
  hitFlash: number;
}

interface SawBlade {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  rot: number;
}

interface ArenaPillar {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface SlashArc {
  x: number;
  y: number;
  angle: number;
  color: string;
  life: number;
  maxLife: number;
  radius: number;
}

interface RingFx {
  x: number;
  y: number;
  r: number;
  maxR: number;
  color: string;
  life: number;
  maxLife: number;
}

interface RaceObstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  kind?: 'crate' | 'wall' | 'platform' | 'spring' | 'boost';
}

interface LaserBeam {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  warn: number;
  active: number;
  width: number;
  color: string;
}

interface LavaPlat {
  x: number;
  y: number;
  w: number;
  dx: number;
  minX: number;
  maxX: number;
  kind?: 'stone' | 'spring';
}

interface MiniBall {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  lastKicker: number;
  holder: number;
  fuse: number;
  noPick: number;
}

export interface MiniSerializedState {
  mini: MinigameId;
  gs: 'playing' | 'roundEnd' | 'matchEnd';
  cr: number;
  gt: number;
  gtm: number;
  cd: number | null;
  pl: Partial<MiniPlayer>[];
  pr: MiniProjectile[];
  ball: MiniBall | null;
  coins: CoinItem[];
  ro: number;
  ob: RaceObstacle[];
  rf: number;
  beams?: LaserBeam[];
  plats?: LavaPlat[];
  lavaY?: number;
  lavaCamY?: number;
  tiles?: number[];
  tc?: number;
  tr?: number;
  zombies?: ZombieEntity[];
  saws?: SawBlade[];
  pillars?: ArenaPillar[];
  slashes?: SlashArc[];
  rings?: RingFx[];
  ringScale?: number;
  wave?: number;
}

export interface MiniCallbacks {
  onHudUpdate: (values: (number | string)[], count: number, round: number, maxRounds: number) => void;
  onMatchEnd: (scores: number[], winnerIndices: number[]) => void;
  onSendNet?: () => void;
}

function pointSegDist(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function angleDiff(a: number, b: number): number {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return Math.abs(d);
}

export class MinigameEngine {
  on = false;
  paused = false;
  netRole: 'host' | 'guest' | null = null;
  gameState: 'playing' | 'roundEnd' | 'matchEnd' = 'playing';
  currentMinigame: MinigameId = 'zombie';
  currentRound = 1;
  maxRounds = 3;
  playerCount = 2;

  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private callbacks: MiniCallbacks | null = null;
  private raf = 0;
  private last = 0;
  private acc = 0;
  private roundTimerHandle: ReturnType<typeof setTimeout> | null = null;
  private cw = 960;
  private ch = 540;

  private players: MiniPlayer[] = [];
  private particles: MiniParticle[] = [];
  private popups: FloatingPopup[] = [];
  private projectiles: MiniProjectile[] = [];
  private ball: MiniBall | null = null;
  private coins: CoinItem[] = [];
  private zombies: ZombieEntity[] = [];
  private saws: SawBlade[] = [];
  private pillars: ArenaPillar[] = [];
  private slashes: SlashArc[] = [];
  private rings: RingFx[] = [];
  private ringScale = 1;
  private zombieWave = 1;
  private zombieSpawnTimer = 0;
  private sawSpawnTimer = 0;
  private raceOffset = 0;
  private raceObstacles: RaceObstacle[] = [];
  private raceFinishX = 0;
  private beams: LaserBeam[] = [];
  private laserSpawnTimer = 0;
  private plats: LavaPlat[] = [];
  private lavaY = 520;
  private lavaCamY = 0;
  private highestPlatY = 0;
  private lavaTick = 0;
  private tiles: number[] = [];
  private tileCols = 10;
  private tileRows = 6;
  private coinSpawnTimer = 0;
  private gameTimer = 0;
  private gameTimerMax = 0;
  private countdownTimer = 0;
  private countdownActive = false;
  private shakeMag = 0;
  private shakeDur = 0;
  private shakeX = 0;
  private shakeY = 0;
  private hudTick = 0;
  private roundEndTicks = 0;
  private sakuraPetals: { x: number; y: number; r: number; sp: number; drift: number }[] = [];

  start(
    canvas: HTMLCanvasElement,
    minigame: MinigameId,
    pCount: number,
    rounds: number,
    netRole: 'host' | 'guest' | null,
    callbacks: MiniCallbacks
  ) {
    this.stop();
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const cssW = Math.max(1, canvas.clientWidth || canvas.width || 960);
    const cssH = Math.max(1, canvas.clientHeight || canvas.height || 540);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    this.cw = cssW;
    this.ch = cssH;
    this.currentMinigame = minigame;
    this.playerCount = pCount || 2;
    this.maxRounds = rounds || 3;
    this.currentRound = 1;
    this.netRole = netRole;
    this.callbacks = callbacks;
    this.paused = false;

    this.sakuraPetals = Array.from({ length: 34 }, () => ({
      x: Math.random() * cssW,
      y: Math.random() * cssH,
      r: 2.2 + Math.random() * 2.5,
      sp: 0.55 + Math.random() * 0.9,
      drift: 0.4 + Math.random() * 0.8,
    }));

    PartyEconomy.beginMatch();
    this.spawnPlayers();
    this.initMinigame();
    this.gameState = 'playing';
    this.countdownActive = true;
    this.countdownTimer = 150;
    this.emitHud();

    this.on = true;
    this.last = 0;
    this.acc = 0;
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() {
    this.on = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    if (this.roundTimerHandle) {
      clearTimeout(this.roundTimerHandle);
      this.roundTimerHandle = null;
    }
  }

  getPlayerPos(index: number): { x: number; y: number } | null {
    const p = this.players[index];
    if (!p || !p.alive) return null;
    return { x: p.x, y: p.y };
  }

  restart() {
    if (this.roundTimerHandle) {
      clearTimeout(this.roundTimerHandle);
      this.roundTimerHandle = null;
    }
    PartyEconomy.beginMatch();
    this.currentRound = 1;
    this.players.forEach((p) => {
      p.score = 0;
      p.roundStart = 0;
    });
    this.startRound();
  }

  setPaused(p: boolean) {
    this.paused = p;
    if (p) resetInputs();
  }

  serialize(): MiniSerializedState {
    return {
      mini: this.currentMinigame,
      gs: this.gameState,
      cr: this.currentRound,
      gt: this.gameTimer,
      gtm: this.gameTimerMax,
      cd: this.countdownActive ? this.countdownTimer : null,
      pl: this.players.map((p) => ({
        x: p.x,
        y: p.y,
        vx: p.vx,
        vy: p.vy,
        hp: p.hp,
        alive: p.alive,
        angle: p.angle,
        score: p.score,
        coins: p.coins,
        raceX: p.raceX,
        isAttacking: p.isAttacking,
        invincible: p.invincible,
        zHop: p.zHop,
        weap: p.weap,
        weapT: p.weapT,
        shield: p.shield,
      })),
      pr: this.projectiles,
      ball: this.ball,
      coins: this.coins,
      ro: this.raceOffset,
      ob: this.raceObstacles,
      rf: this.raceFinishX,
      beams: this.beams,
      plats: this.plats,
      lavaY: this.lavaY,
      lavaCamY: this.lavaCamY,
      tiles: this.tiles,
      tc: this.tileCols,
      tr: this.tileRows,
      zombies: this.zombies,
      saws: this.saws,
      pillars: this.pillars,
      slashes: this.slashes,
      rings: this.rings,
      ringScale: this.ringScale,
      wave: this.zombieWave,
    };
  }

  apply(d: MiniSerializedState) {
    if (!d || !this.players.length) return;
    this.currentMinigame = d.mini;
    d.pl.forEach((st, i) => {
      if (this.players[i]) Object.assign(this.players[i], st);
    });
    this.projectiles = d.pr;
    this.ball = d.ball;
    this.coins = d.coins;
    this.raceOffset = d.ro;
    this.raceObstacles = d.ob;
    this.raceFinishX = d.rf;
    if (d.beams) this.beams = d.beams;
    if (d.plats) this.plats = d.plats;
    if (typeof d.lavaY === 'number') this.lavaY = d.lavaY;
    if (typeof d.lavaCamY === 'number') this.lavaCamY = d.lavaCamY;
    if (d.tiles) this.tiles = d.tiles;
    if (d.tc) this.tileCols = d.tc;
    if (d.tr) this.tileRows = d.tr;
    if (d.zombies) this.zombies = d.zombies;
    if (d.saws) this.saws = d.saws;
    if (d.pillars) this.pillars = d.pillars;
    if (d.slashes) this.slashes = d.slashes;
    if (d.rings) this.rings = d.rings;
    if (typeof d.ringScale === 'number') this.ringScale = d.ringScale;
    if (typeof d.wave === 'number') this.zombieWave = d.wave;
    this.gameTimer = d.gt;
    this.gameTimerMax = d.gtm;
    this.currentRound = d.cr;
    this.countdownActive = d.cd !== null;
    if (d.cd !== null) this.countdownTimer = d.cd;
    this.emitHud();
    if (d.gs === 'matchEnd' && this.gameState !== 'matchEnd') {
      this.gameState = 'matchEnd';
      this.triggerMatchEnd();
    } else if (d.gs !== 'matchEnd') {
      this.gameState = d.gs;
    }
  }

  private emitHud() {
    const useCoins = this.currentMinigame === 'paint' || this.currentMinigame === 'zombie';
    const vals = this.players.map((p) => (useCoins ? p.coins : p.score));
    this.callbacks?.onHudUpdate(vals, this.playerCount, this.currentRound, this.maxRounds);
  }

  private triggerMatchEnd() {
    const scores = this.players.map((p) => p.score);
    const maxS = Math.max(...scores, 0);
    const winners = this.players.filter((p) => p.score === maxS).map((p) => p.index);
    this.callbacks?.onMatchEnd(scores, winners);
  }

  private spawnPlayers() {
    const prevScores = this.players.map((p) => p.score);
    this.players = [];
    const cx = this.cw / 2;
    const cy = this.ch / 2;
    const spawnDist = Math.min(this.cw, this.ch) * 0.22;

    for (let i = 0; i < this.playerCount; i++) {
      const angle = (Math.PI * 2 * i) / this.playerCount - Math.PI / 2;
      const sc = prevScores[i] || 0;
      this.players.push({
        index: i,
        x: cx + Math.cos(angle) * spawnDist,
        y: cy + Math.sin(angle) * spawnDist,
        vx: 0,
        vy: 0,
        hp: 100,
        radius: 17,
        angle: Math.atan2(cy - (cy + Math.sin(angle) * spawnDist), cx - (cx + Math.cos(angle) * spawnDist)),
        color: PLAYER_COLORS[i],
        alive: true,
        score: sc,
        roundStart: sc,
        isAttacking: false,
        attackTimer: 0,
        dashCooldown: 0,
        coins: 0,
        raceX: 0,
        invincible: 0,
        onGround: true,
        jumpsLeft: 1,
        jh: false,
        highJ: false,
        kingTicks: 0,
        throwCd: 0,
        snowCd: 0,
        trail: [],
        phase: i * 1.1,
        leanX: 0,
        leanVx: 0,
        headX: 0,
        headVx: 0,
        headY: 0,
        headVy: 0,
        tilt: 0,
        tiltV: 0,
        sq: 0,
        coyoteT: 0,
        jumpBuf: 0,
        prevVx: 0,
        prevVy: 0,
        zHop: 0,
        zVel: 0,
        weap: 'blaster',
        weapT: 0,
        shield: false,
      });
    }
  }

  private initMinigame() {
    this.projectiles = [];
    this.particles = [];
    this.popups = [];
    this.coins = [];
    this.zombies = [];
    this.saws = [];
    this.pillars = [];
    this.slashes = [];
    this.rings = [];
    this.raceObstacles = [];
    this.beams = [];
    this.plats = [];
    this.tiles = [];
    this.ball = null;
    this.coinSpawnTimer = 0;
    this.laserSpawnTimer = 40;
    this.zombieSpawnTimer = 25;
    this.sawSpawnTimer = 0;
    this.zombieWave = 1;
    this.ringScale = 1;
    this.raceOffset = 0;
    this.lavaTick = 0;

    const cw = this.cw;
    const ch = this.ch;

    switch (this.currentMinigame) {
      case 'zombie': {
        this.gameTimer = 45 * 60;
        this.gameTimerMax = this.gameTimer;
        // 4 gravestone / bunker barricades around center
        this.pillars = [
          { x: cw * 0.27 - 24, y: ch * 0.34 - 24, w: 48, h: 48 },
          { x: cw * 0.73 - 24, y: ch * 0.34 - 24, w: 48, h: 48 },
          { x: cw * 0.27 - 24, y: ch * 0.68 - 24, w: 48, h: 48 },
          { x: cw * 0.73 - 24, y: ch * 0.68 - 24, w: 48, h: 48 },
        ];
        this.players.forEach((p, idx) => {
          const ang = (Math.PI * 2 * idx) / this.playerCount;
          p.x = cw / 2 + Math.cos(ang) * 74;
          p.y = ch / 2 + 12 + Math.sin(ang) * 58;
          p.hp = 100;
          p.coins = 0;
          p.weap = 'blaster';
          p.weapT = 0;
        });
        // Spawn initial 4 zombies right away from gates
        for (let k = 0; k < 4; k++) this.spawnZombie(0);
        break;
      }
      case 'samurai': {
        this.gameTimer = 45 * 60;
        this.gameTimerMax = this.gameTimer;
        this.players.forEach((p, idx) => {
          const ang = (Math.PI * 2 * idx) / this.playerCount;
          p.x = cw / 2 + Math.cos(ang) * Math.min(cw, ch) * 0.28;
          p.y = ch / 2 + 10 + Math.sin(ang) * Math.min(cw, ch) * 0.24;
          p.angle = ang + Math.PI;
          p.hp = 100;
        });
        break;
      }
      case 'sniper': {
        this.gameTimer = 45 * 60;
        this.gameTimerMax = this.gameTimer;
        // Tactical cover pillars (left, right, center, top/bot flanks)
        this.pillars = [
          { x: cw * 0.5 - 22, y: ch * 0.5 - 32, w: 44, h: 64 },
          { x: cw * 0.26 - 20, y: ch * 0.36 - 22, w: 40, h: 44 },
          { x: cw * 0.74 - 20, y: ch * 0.66 - 22, w: 40, h: 44 },
          { x: cw * 0.26 - 20, y: ch * 0.68 - 20, w: 40, h: 40 },
          { x: cw * 0.74 - 20, y: ch * 0.34 - 20, w: 40, h: 40 },
        ];
        const sniperSpawns: [number, number, number][] = [
          [cw * 0.11, ch * 0.25, 0.3],
          [cw * 0.89, ch * 0.78, Math.PI + 0.3],
          [cw * 0.89, ch * 0.25, Math.PI - 0.3],
          [cw * 0.11, ch * 0.78, -0.3],
        ];
        this.players.forEach((p, i) => {
          const [sx, sy, sa] = sniperSpawns[i % sniperSpawns.length];
          p.x = sx;
          p.y = sy;
          p.angle = sa;
          p.hp = 100;
          p.throwCd = 18;
        });
        break;
      }
      case 'blades': {
        this.gameTimer = 45 * 60;
        this.gameTimerMax = this.gameTimer;
        this.players.forEach((p) => { p.hp = 100; });
        const speeds: [number, number][] = [[4.3, 3.3], [-4.1, 3.6]];
        for (let k = 0; k < 2; k++) {
          const [vx, vy] = speeds[k];
          this.saws.push({
            x: k === 0 ? cw * 0.2 : cw * 0.8,
            y: k === 0 ? 90 : ch - 70,
            vx,
            vy,
            r: 22,
            rot: 0,
          });
        }
        break;
      }
      case 'sumo':
        this.ringScale = 1;
        this.gameTimer = 0;
        this.players.forEach((p) => { p.hp = 999; });
        break;
      case 'futbol':
        this.ball = { x: cw / 2, y: (ch + 44) / 2, vx: 0, vy: 0, radius: 13, lastKicker: -1, holder: -1, fuse: 0, noPick: 0 };
        this.gameTimer = 0;
        if (this.playerCount >= 2) {
          this.players[0].x = cw * 0.22; this.players[0].y = (ch + 44) / 2;
          this.players[1].x = cw * 0.78; this.players[1].y = (ch + 44) / 2;
        }
        if (this.playerCount >= 3) {
          this.players[2].x = cw * 0.28; this.players[2].y = ch * 0.34;
        }
        if (this.playerCount >= 4) {
          this.players[3].x = cw * 0.72; this.players[3].y = ch * 0.34;
        }
        break;
      case 'race': {
        this.raceFinishX = Math.max(2600, cw * 3.0);
        this.raceOffset = 0;
        const groundY = ch - 26;
        let ox = Math.max(360, cw * 0.44);
        let segIdx = 0;
        while (ox < this.raceFinishX - 240) {
          const pattern = segIdx % 4;
          if (pattern === 0) {
            const ch2 = 46 + Math.round(Math.random() * 28);
            const cw2 = 38 + Math.round(Math.random() * 18);
            this.raceObstacles.push({ x: ox, y: groundY - ch2, w: cw2, h: ch2, kind: 'crate' });
            if (Math.random() < 0.6) {
              this.raceObstacles.push({ x: ox + cw2 + 46, y: groundY - 98, w: 96, h: 16, kind: 'platform' });
            }
          } else if (pattern === 1) {
            const wallH = 78 + Math.round(Math.random() * 34);
            this.raceObstacles.push({ x: ox - 56, y: groundY - 14, w: 40, h: 14, kind: 'spring' });
            this.raceObstacles.push({ x: ox, y: groundY - wallH, w: 36, h: wallH, kind: 'wall' });
          } else if (pattern === 2) {
            this.raceObstacles.push({ x: ox - 30, y: groundY - 8, w: 68, h: 8, kind: 'boost' });
            const h2 = 42 + Math.round(Math.random() * 24);
            this.raceObstacles.push({ x: ox + 110, y: groundY - h2, w: 34, h: h2, kind: 'crate' });
          } else {
            const hA = 44 + Math.round(Math.random() * 16);
            const hB = 72 + Math.round(Math.random() * 22);
            this.raceObstacles.push({ x: ox, y: groundY - hA, w: 36, h: hA, kind: 'crate' });
            this.raceObstacles.push({ x: ox + 82, y: groundY - hB, w: 38, h: hB, kind: 'wall' });
          }
          ox += 210 + Math.random() * 140;
          segIdx++;
        }
        this.players.forEach((p, idx) => {
          p.hp = 999;
          p.raceX = 72 + idx * 14;
          p.x = p.raceX;
          p.y = groundY - 22;
          p.vx = 0;
          p.vy = 0;
          p.onGround = true;
          p.jumpsLeft = 1;
        });
        break;
      }
      case 'bomb':
        this.pillars = [
          { x: cw * 0.24 - 20, y: ch * 0.34 - 20, w: 40, h: 40 },
          { x: cw * 0.76 - 20, y: ch * 0.34 - 20, w: 40, h: 40 },
          { x: cw * 0.24 - 20, y: ch * 0.68 - 20, w: 40, h: 40 },
          { x: cw * 0.76 - 20, y: ch * 0.68 - 20, w: 40, h: 40 },
        ];
        this.players.forEach((p) => { p.hp = 100; p.throwCd = 0; });
        this.ball = { x: cw / 2, y: ch / 2, vx: 0, vy: 0, radius: 13, lastKicker: -1, holder: -1, fuse: 6 * 60, noPick: 0 };
        break;
      case 'laser':
        this.gameTimer = 45 * 60;
        this.gameTimerMax = this.gameTimer;
        this.players.forEach((p) => { p.hp = 100; p.shield = false; });
        break;
      case 'lava': {
        this.lavaY = ch + 24;
        this.lavaCamY = 0;
        this.lavaTick = 0;
        this.plats = [
          { x: cw * 0.14, y: ch - 46, w: cw * 0.72, dx: 0, minX: 0, maxX: cw, kind: 'stone' },
        ];
        this.highestPlatY = ch - 46;
        this.generateLavaPlats(ch - 900);
        this.players.forEach((p, idx) => {
          p.hp = 999;
          p.x = cw * (0.28 + (idx / Math.max(1, this.playerCount - 1)) * 0.44);
          p.y = ch - 70;
          p.onGround = true;
          p.jumpsLeft = 1;
        });
        break;
      }
      case 'tiles': {
        this.tileCols = 10;
        this.tileRows = 6;
        this.tiles = new Array(this.tileCols * this.tileRows).fill(0);
        this.gameTimer = 45 * 60;
        this.gameTimerMax = this.gameTimer;
        const deck = this.getGridBounds();
        const spawns: [number, number][] = [
          [2, 1], [7, 4], [7, 1], [2, 4],
        ];
        this.players.forEach((p, i) => {
          const [sc, sr] = spawns[i % spawns.length];
          p.hp = 999;
          p.zHop = 0;
          p.zVel = 0;
          p.x = deck.x + (sc + 0.5) * deck.cw;
          p.y = deck.y + (sr + 0.5) * deck.ch;
        });
        break;
      }
      case 'paint': {
        this.tileCols = 11;
        this.tileRows = 7;
        this.tiles = new Array(this.tileCols * this.tileRows).fill(-1);
        this.gameTimer = 35 * 60;
        this.gameTimerMax = this.gameTimer;
        const deck = this.getGridBounds();
        const spawns: [number, number][] = [
          [1, 1], [9, 5], [9, 1], [1, 5],
        ];
        this.players.forEach((p, i) => {
          const [sc, sr] = spawns[i % spawns.length];
          p.hp = 999;
          p.coins = 1;
          p.x = deck.x + (sc + 0.5) * deck.cw;
          p.y = deck.y + (sr + 0.5) * deck.ch;
          this.tiles[sr * this.tileCols + sc] = p.index;
        });
        break;
      }
    }
  }

  private getGridBounds() {
    const padX = Math.max(38, this.cw * 0.08);
    const topY = 62;
    const botPad = 24;
    const w = this.cw - padX * 2;
    const h = this.ch - topY - botPad;
    return {
      x: padX,
      y: topY,
      w,
      h,
      cw: w / this.tileCols,
      ch: h / this.tileRows,
    };
  }

  private startRound() {
    resetInputs();
    this.gameState = 'playing';
    this.roundEndTicks = 0;
    this.countdownActive = true;
    this.countdownTimer = 150;
    this.spawnPlayers();
    this.initMinigame();
    this.emitHud();
  }

  private endRound() {
    if (this.gameState !== 'playing') return;
    this.gameState = 'roundEnd';
    this.roundEndTicks = 0;
    this.emitHud();
    this.roundTimerHandle = setTimeout(() => {
      if (!this.on) return;
      if (this.currentRound >= this.maxRounds) {
        this.gameState = 'matchEnd';
        this.triggerMatchEnd();
      } else {
        this.currentRound++;
        this.startRound();
      }
    }, 2000);
  }

  private spawnParticle(x: number, y: number, color: string, count: number, speed: number, life = 35) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = (0.3 + Math.random() * 0.7) * speed;
      this.particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life,
        maxLife: life,
        color,
        radius: 2 + Math.random() * 3.5,
      });
    }
  }

  private spawnRing(x: number, y: number, maxR: number, color: string, life = 22) {
    this.rings.push({ x, y, r: 8, maxR, color, life, maxLife: life });
  }

  private addPopup(x: number, y: number, text: string, color: string) {
    this.popups.push({ x, y, vy: -1.1, text, color, life: 45 });
  }

  private triggerShake(mag: number, dur: number) {
    if (!PartyEconomy.shakeEnabled()) return;
    this.shakeMag = Math.max(this.shakeMag, mag);
    this.shakeDur = Math.max(this.shakeDur, dur);
  }

  private killPlayer(p: MiniPlayer) {
    if (!p.alive) return;
    p.alive = false;
    this.spawnParticle(p.x, p.y, p.color, 26, 5.8, 42);
    this.spawnRing(p.x, p.y, 48, p.color, 20);
    this.triggerShake(7, 14);
  }

  private resolvePillarCollisions(entity: { x: number; y: number; radius: number; vx?: number; vy?: number }) {
    for (const pil of this.pillars) {
      const nearX = Math.max(pil.x, Math.min(pil.x + pil.w, entity.x));
      const nearY = Math.max(pil.y, Math.min(pil.y + pil.h, entity.y));
      const dx = entity.x - nearX;
      const dy = entity.y - nearY;
      const dist = Math.hypot(dx, dy);
      if (dist < entity.radius) {
        if (dist > 0.001) {
          const push = entity.radius - dist;
          entity.x += (dx / dist) * push;
          entity.y += (dy / dist) * push;
        } else {
          const left = entity.x - pil.x;
          const right = pil.x + pil.w - entity.x;
          const top = entity.y - pil.y;
          const bot = pil.y + pil.h - entity.y;
          const minD = Math.min(left, right, top, bot);
          if (minD === left) entity.x = pil.x - entity.radius;
          else if (minD === right) entity.x = pil.x + pil.w + entity.radius;
          else if (minD === top) entity.y = pil.y - entity.radius;
          else entity.y = pil.y + pil.h + entity.radius;
        }
      }
    }
  }

  private step() {
    if (this.countdownActive) {
      this.countdownTimer--;
      if (this.countdownTimer <= -25) this.countdownActive = false;
    }

    if (this.shakeDur > 0) {
      this.shakeX = (Math.random() - 0.5) * this.shakeMag * 2;
      this.shakeY = (Math.random() - 0.5) * this.shakeMag * 2;
      this.shakeDur--;
      this.shakeMag *= 0.9;
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
    }

    for (const sk of this.sakuraPetals) {
      sk.y += sk.sp;
      sk.x += Math.sin(sk.y * 0.025 + sk.r) * sk.drift;
      if (sk.y > this.ch) { sk.y = -6; sk.x = Math.random() * this.cw; }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08;
      if (--p.life <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const pp = this.popups[i];
      pp.y += pp.vy;
      if (--pp.life <= 0) this.popups.splice(i, 1);
    }
    for (let i = this.slashes.length - 1; i >= 0; i--) {
      if (--this.slashes[i].life <= 0) this.slashes.splice(i, 1);
    }
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.r += (r.maxR - r.r) * 0.24;
      if (--r.life <= 0) this.rings.splice(i, 1);
    }

    if (this.gameState === 'roundEnd') {
      this.roundEndTicks++;
    }

    if (this.gameState !== 'playing' || (this.countdownActive && this.countdownTimer >= 0)) {
      return;
    }

    const isRace = this.currentMinigame === 'race';
    const isLava = this.currentMinigame === 'lava';

    if (isLava) {
      for (const pl of this.plats) {
        if (pl.dx !== 0) {
          pl.x += pl.dx;
          if (pl.x < pl.minX) { pl.x = pl.minX; pl.dx = Math.abs(pl.dx); }
          if (pl.x + pl.w > pl.maxX) { pl.x = pl.maxX - pl.w; pl.dx = -Math.abs(pl.dx); }
        }
      }
    }

    if (!isRace) {
      for (const p of this.players) {
        if (!p.alive) continue;
        const inp = inputPlayers[p.index];

        if (isLava) {
          const cap = 4.95;
          const accel = p.onGround ? 1.02 : 0.70;
          if (Math.abs(inp.x) > 0.12) {
            if (inp.x > 0 && p.vx < cap) p.vx = Math.min(cap, p.vx + inp.x * accel);
            else if (inp.x < 0 && p.vx > -cap) p.vx = Math.max(-cap, p.vx + inp.x * accel);
          }

          const wantJ = inp.jump;
          if (wantJ && !p.jh) {
            p.jumpBuf = 7;
          } else if (!wantJ) {
            p.jh = false;
          }
          if (p.jumpBuf > 0) p.jumpBuf--;

          if (p.jumpBuf > 0 && (p.onGround || p.coyoteT > 0)) {
            p.vy = -11.4;
            p.onGround = false;
            p.coyoteT = 0;
            p.jumpBuf = 0;
            p.jumpsLeft = 0;
            p.jh = true;
            p.highJ = inp.y < -0.8;
            p.headVy += 2.8;
            this.spawnParticle(p.x, p.y + 18, '#ffffff', 5, 2.2, 12);
            PartyAudio.play('jump');
          }
          if (inp.y >= -0.72) p.highJ = false;
          if (p.vy < -2.6 && !wantJ && !p.highJ) p.vy *= 0.87;

          const prevBottom = p.y + p.radius;
          const prevOnGround = p.onGround;
          const preLandVy = p.vy;
          p.vy = Math.min(12.5, p.vy + 0.42 * (p.vy > 0 ? 1.14 : 1.0));
          p.vx *= p.onGround ? (Math.abs(inp.x) > 0.12 ? 0.88 : 0.78) : 0.96;
          p.x += p.vx;
          p.y += p.vy;

          p.onGround = false;
          for (const pl of this.plats) {
            if (p.x + p.radius * 0.6 > pl.x && p.x - p.radius * 0.6 < pl.x + pl.w && p.vy >= 0) {
              if (prevBottom <= pl.y + 11 && p.y + p.radius >= pl.y) {
                p.y = pl.y - p.radius;
                if (pl.kind === 'spring') {
                  p.vy = -15.4;
                  p.onGround = false;
                  p.coyoteT = 0;
                  p.headVy += 4.2;
                  this.spawnParticle(p.x, pl.y, '#4ade80', 10, 3.6, 18);
                  PartyAudio.play('jump');
                } else {
                  p.vy = 0;
                  p.x += pl.dx;
                  p.onGround = true;
                  p.coyoteT = 6;
                  p.jumpsLeft = 1;
                }
              }
            }
          }
          if (!p.onGround) p.coyoteT = Math.max(0, p.coyoteT - 1);
          if (p.onGround && !prevOnGround && preLandVy > 3.2) {
            p.sq = Math.min(10, Math.round(preLandVy * 0.85));
            p.headVy += Math.min(5, preLandVy * 0.42);
          }
          p.x = Math.max(p.radius, Math.min(this.cw - p.radius, p.x));
        } else {
          const isBombHolder = this.currentMinigame === 'bomb' && this.ball?.holder === p.index;
          const moveBoost = isBombHolder ? 1.46 : 1.24;
          p.vx += inp.x * moveBoost;
          p.vy += inp.y * moveBoost;
          p.vx *= 0.87;
          p.vy *= 0.87;
          p.x += p.vx;
          p.y += p.vy;
        }

        // Tiles Z-hop vertical simulation
        if (this.currentMinigame === 'tiles') {
          if (p.zHop > 0 || p.zVel !== 0) {
            p.zHop += p.zVel;
            p.zVel -= 0.56;
            if (p.zHop <= 0) {
              p.zHop = 0;
              p.zVel = 0;
              p.sq = 6;
              this.spawnParticle(p.x, p.y + 18, '#94a3b8', 5, 2, 12);
            }
          }
        }

        // Aim angle
        if (typeof inp.aimAngle === 'number' && !Number.isNaN(inp.aimAngle)) {
          p.angle = inp.aimAngle;
        } else {
          const aimX = inp.releaseAction ? inp.releaseX : inp.x;
          const aimY = inp.releaseAction ? inp.releaseY : inp.y;
          if (Math.abs(aimX) > 0.1 || Math.abs(aimY) > 0.1) {
            p.angle = Math.atan2(aimY, aimX);
          }
        }

        if (Math.hypot(p.vx, p.vy) > 2.2) {
          p.trail.push({ x: p.x, y: p.y, life: 10 });
          if (p.trail.length > 8) p.trail.shift();
        }
        p.trail = p.trail.filter((tr) => --tr.life > 0);

        if (p.invincible > 0) p.invincible--;
        if (p.attackTimer > 0 && --p.attackTimer <= 0) p.isAttacking = false;
        if (p.dashCooldown > 0) p.dashCooldown--;
        if (p.weapT > 0 && --p.weapT <= 0) p.weap = 'blaster';

        // Boundary & Pillar collisions
        if (this.currentMinigame === 'sumo') {
          const cx = this.cw / 2;
          const cy = this.ch / 2;
          const ringR = Math.min(this.cw, this.ch) * 0.37 * this.ringScale;
          if (Math.hypot(p.x - cx, p.y - cy) > ringR) this.killPlayer(p);
        } else if (this.currentMinigame === 'futbol') {
          p.x = Math.max(10 + p.radius, Math.min(this.cw - 10 - p.radius, p.x));
          p.y = Math.max(52 + p.radius, Math.min(this.ch - 8 - p.radius, p.y));
        } else if (!isLava) {
          p.x = Math.max(p.radius + 8, Math.min(this.cw - p.radius - 8, p.x));
          p.y = Math.max(p.radius + 46, Math.min(this.ch - p.radius - 8, p.y));
        }

        if (this.pillars.length > 0) {
          this.resolvePillarCollisions(p);
        }

        this.updateMiniSprings(p, isLava);
      }
    }

    // Dash / Shove / Hop mechanics
    if (['sumo', 'blades', 'bomb', 'laser', 'lava', 'tiles', 'paint'].includes(this.currentMinigame)) {
      for (let i = 0; i < this.players.length; i++) {
        const p = this.players[i];
        if (!p.alive) continue;
        const inp = inputPlayers[i];
        if ((inp.action || inp.releaseAction) && p.dashCooldown <= 0) {
          if (this.currentMinigame === 'tiles') {
            if (p.zHop <= 1) {
              p.zVel = 7.4;
              p.vx += Math.cos(p.angle) * 7.2;
              p.vy += Math.sin(p.angle) * 7.2;
              p.dashCooldown = 28;
              p.isAttacking = true;
              p.attackTimer = 18;
              this.spawnParticle(p.x, p.y + 18, p.color, 7, 2.8, 16);
              PartyAudio.play('jump');
            }
          } else {
            const dashPow =
              this.currentMinigame === 'laser' ? 14.5 :
              this.currentMinigame === 'sumo' ? 13.6 : 12.4;
            const dax = Math.cos(p.angle);
            const day = Math.sin(p.angle);
            p.vx += dax * dashPow;
            if (!isLava) p.vy += day * dashPow;
            else p.vy -= 4.2;
            p.leanVx -= dax * 4.5;
            p.headVx -= dax * 6.0;
            p.tiltV += dax * 0.16;
            p.dashCooldown = 32;
            p.isAttacking = true;
            p.attackTimer = 13;
            if (this.currentMinigame === 'laser') p.invincible = Math.max(p.invincible, 14);
            if (this.currentMinigame === 'sumo') this.spawnRing(p.x, p.y, 44, p.color, 16);
            if (this.currentMinigame === 'paint') {
              this.paintSplash(p.x, p.y, p.index, 1);
              this.triggerShake(4, 7);
            }
            this.spawnParticle(p.x, p.y, p.color, 8, 3.6, 16);
            PartyAudio.play('jump');
          }
        }
        for (let j = i + 1; j < this.players.length; j++) {
          const o = this.players[j];
          if (!o.alive) continue;
          if (this.currentMinigame === 'tiles' && Math.abs(p.zHop - o.zHop) > 18) continue;
          const dx = o.x - p.x;
          const dy = o.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < p.radius + o.radius) {
            const ang = Math.atan2(dy, dx);
            const mult = this.currentMinigame === 'sumo' ? 11.4 : 9.4;
            const f1 = p.isAttacking ? mult : 3.8;
            const f2 = o.isAttacking ? mult : 3.8;
            const ca = Math.cos(ang);
            const sa = Math.sin(ang);
            o.vx += ca * f1;
            o.vy += sa * f1;
            p.vx -= ca * f2;
            p.vy -= sa * f2;
            o.leanVx -= ca * f1 * 0.45;
            o.headVx -= ca * f1 * 0.65;
            o.tiltV += ca * 0.12;
            p.leanVx += ca * f2 * 0.45;
            p.headVx += ca * f2 * 0.65;
            p.tiltV -= ca * 0.12;
            if (p.isAttacking || o.isAttacking) {
              this.spawnParticle((p.x + o.x) / 2, (p.y + o.y) / 2, '#fbbf24', 10, 4, 16);
              this.triggerShake(5, 8);
            }
            PartyAudio.play('hit');
          }
        }
      }
    }

    // Projectiles (zombie blasters + sniper ricochet bullets)
    this.updateProjectiles();

    // Mode-specific simulation
    switch (this.currentMinigame) {
      case 'zombie': this.updateZombie(); break;
      case 'samurai': this.updateSamurai(); break;
      case 'sniper': this.updateSniper(); break;
      case 'blades': this.updateBlades(); break;
      case 'sumo': this.updateSumo(); break;
      case 'futbol': this.updateFutbol(); break;
      case 'race': this.updateRace(); break;
      case 'bomb': this.updateBomb(); break;
      case 'laser': this.updateLaser(); break;
      case 'lava': this.updateLava(); break;
      case 'tiles': this.updateTiles(); break;
      case 'paint': this.updatePaint(); break;
    }

    if (['sumo', 'samurai', 'sniper', 'blades', 'bomb', 'laser', 'lava', 'tiles'].includes(this.currentMinigame)) {
      const alive = this.players.filter((p) => p.alive);
      if (alive.length <= 1) {
        if (alive.length === 1) alive[0].score++;
        this.endRound();
      }
    }

    clearReleasedActions();
    if (++this.hudTick % 6 === 0) this.emitHud();
  }

  private updateProjectiles() {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const pr = this.projectiles[i];
      pr.x += pr.vx;
      pr.y += pr.vy;
      pr.life--;

      if (pr.life <= 0) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Arena wall collision (ricochet if bounces > 0)
      let hitWall = false;
      if (pr.x < 8 || pr.x > this.cw - 8) {
        if ((pr.bounces || 0) > 0) {
          pr.bounces!--;
          pr.vx *= -1;
          pr.x = Math.max(9, Math.min(this.cw - 9, pr.x));
          this.spawnParticle(pr.x, pr.y, pr.color || '#ef4444', 6, 3, 12);
          PartyAudio.play('iceCrack');
        } else {
          hitWall = true;
        }
      }
      if (pr.y < 46 || pr.y > this.ch - 8) {
        if ((pr.bounces || 0) > 0) {
          pr.bounces!--;
          pr.vy *= -1;
          pr.y = Math.max(47, Math.min(this.ch - 9, pr.y));
          this.spawnParticle(pr.x, pr.y, pr.color || '#ef4444', 6, 3, 12);
          PartyAudio.play('iceCrack');
        } else {
          hitWall = true;
        }
      }
      if (hitWall) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Pillar collisions
      let destroyedByPillar = false;
      for (const pil of this.pillars) {
        if (pr.x >= pil.x && pr.x <= pil.x + pil.w && pr.y >= pil.y && pr.y <= pil.y + pil.h) {
          if ((pr.bounces || 0) > 0) {
            pr.bounces!--;
            const prevX = pr.x - pr.vx;
            if (prevX < pil.x || prevX > pil.x + pil.w) pr.vx *= -1;
            else pr.vy *= -1;
            pr.x += pr.vx;
            pr.y += pr.vy;
            this.spawnParticle(pr.x, pr.y, pr.color || '#fbbf24', 7, 3.2, 14);
            PartyAudio.play('iceCrack');
          } else {
            this.spawnParticle(pr.x, pr.y, '#a1a1aa', 5, 2.4, 12);
            destroyedByPillar = true;
          }
          break;
        }
      }
      if (destroyedByPillar) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Hit Zombies in Zombie mode
      if (this.currentMinigame === 'zombie') {
        let hitZ = false;
        for (let zi = this.zombies.length - 1; zi >= 0; zi--) {
          const z = this.zombies[zi];
          const zr = z.kind === 2 ? 24 : z.kind === 1 ? 15 : 17;
          if (Math.hypot(z.x - pr.x, z.y - pr.y) < zr + (pr.radius || 5)) {
            const dmg = pr.dmg || 28;
            z.hp -= dmg;
            z.hitFlash = 7;
            z.vx += pr.vx * (z.kind === 2 ? 0.14 : 0.34);
            z.vy += pr.vy * (z.kind === 2 ? 0.14 : 0.34);
            this.spawnParticle(pr.x, pr.y, '#4ade80', 7, 3.4, 14);
            if (z.hp <= 0) {
              const pts = z.kind === 2 ? 5 : z.kind === 1 ? 2 : 1;
              const ow = this.players[pr.owner];
              if (ow) {
                ow.coins += pts;
                this.addPopup(z.x, z.y - 22, `+${pts}`, ow.color);
              }
              this.spawnParticle(z.x, z.y, z.kind === 2 ? '#c084fc' : '#4ade80', 18, 5, 26);
              if (z.kind === 2) {
                this.spawnRing(z.x, z.y, 46, '#a855f7', 18);
                this.triggerShake(6, 10);
                PartyAudio.play('boom');
              } else {
                PartyAudio.play('hit');
              }
              this.zombies.splice(zi, 1);
            } else {
              PartyAudio.play('hit');
            }
            hitZ = true;
            break;
          }
        }
        if (hitZ) {
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      // Hit Players in Sniper mode
      if (this.currentMinigame === 'sniper') {
        for (const pl of this.players) {
          if (!pl.alive || pl.invincible > 0) continue;
          if (pl.index === pr.owner && pr.life > 110) continue; // brief spawn grace on own shot unless ricocheted
          if (Math.hypot(pl.x - pr.x, pl.y - pr.y) < pl.radius + (pr.radius || 5)) {
            const ang = Math.atan2(pr.vy, pr.vx);
            pl.hp -= pr.dmg || 55;
            pl.vx += Math.cos(ang) * 10.5;
            pl.vy += Math.sin(ang) * 10.5;
            pl.invincible = 24;
            this.spawnParticle(pr.x, pr.y, pr.color || '#ef4444', 18, 5.2, 24);
            this.spawnRing(pl.x, pl.y, 42, pr.color || '#ef4444', 16);
            this.triggerShake(7, 10);
            PartyAudio.play('boom');
            if (pl.hp <= 0) this.killPlayer(pl);
            this.projectiles.splice(i, 1);
            break;
          }
        }
      }
    }
  }

  private spawnZombie(forceKind?: 0 | 1 | 2) {
    const cw = this.cw;
    const ch = this.ch;
    const gate = Math.floor(Math.random() * 4);
    let x = cw / 2;
    let y = 52;
    if (gate === 0) { x = cw * (0.2 + Math.random() * 0.6); y = 46; }
    else if (gate === 1) { x = cw * (0.2 + Math.random() * 0.6); y = ch - 14; }
    else if (gate === 2) { x = 14; y = 70 + Math.random() * (ch - 100); }
    else { x = cw - 14; y = 70 + Math.random() * (ch - 100); }

    let kind: 0 | 1 | 2 = forceKind ?? 0;
    if (forceKind === undefined) {
      const r = Math.random();
      if (this.zombieWave >= 2 && r < 0.14) kind = 2;
      else if (r < 0.42) kind = 1;
      else kind = 0;
    }
    const maxHp = kind === 2 ? 170 : kind === 1 ? 42 : 70;
    this.zombies.push({
      x,
      y,
      vx: 0,
      vy: 0,
      hp: maxHp,
      maxHp,
      kind,
      phase: Math.random() * Math.PI * 2,
      hitFlash: 0,
    });
  }

  private updateZombie() {
    this.gameTimer--;
    const elapsed = (this.gameTimerMax - this.gameTimer) / 60;
    const newWave = Math.min(5, 1 + Math.floor(elapsed / 10));
    if (newWave > this.zombieWave) {
      this.zombieWave = newWave;
      this.addPopup(this.cw / 2, this.ch * 0.28, `DALĞA ${this.zombieWave}!`, '#4ade80');
      this.spawnZombie(2); // Spawn a Brute on wave up!
      PartyAudio.play('portal');
    }

    const spawnEvery = Math.max(22, 62 - this.zombieWave * 8);
    if (--this.zombieSpawnTimer <= 0 && this.zombies.length < 20) {
      this.zombieSpawnTimer = spawnEvery;
      this.spawnZombie();
    }

    // Supply pickups (Shotgun / Rapid / Medkit)
    if (++this.coinSpawnTimer >= 240 && this.coins.length < 3) {
      this.coinSpawnTimer = 0;
      const kinds: ('shotgun' | 'rapid' | 'medkit')[] = ['shotgun', 'rapid', 'medkit'];
      const kind = kinds[Math.floor(Math.random() * kinds.length)];
      this.coins.push({
        x: 68 + Math.random() * (this.cw - 136),
        y: 84 + Math.random() * (this.ch - 130),
        radius: 13,
        life: 520,
        diamond: kind !== 'medkit',
        kind,
      });
    }

    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      if (--c.life <= 0) { this.coins.splice(i, 1); continue; }
      for (const p of this.players) {
        if (!p.alive) continue;
        if (Math.hypot(p.x - c.x, p.y - c.y) < p.radius + c.radius) {
          if (c.kind === 'medkit') {
            p.hp = Math.min(100, p.hp + 40);
            this.addPopup(p.x, p.y - 24, '+40 CAN', '#4ade80');
          } else if (c.kind === 'shotgun') {
            p.weap = 'shotgun';
            p.weapT = 8 * 60;
            this.addPopup(p.x, p.y - 24, 'SHOTGUN!', '#fbbf24');
          } else {
            p.weap = 'rapid';
            p.weapT = 8 * 60;
            this.addPopup(p.x, p.y - 24, 'TURBO ATƏŞ!', '#38bdf8');
          }
          this.spawnParticle(c.x, c.y, c.kind === 'medkit' ? '#4ade80' : '#fbbf24', 14, 4, 22);
          PartyAudio.play('coin');
          this.coins.splice(i, 1);
          break;
        }
      }
    }

    // Player shooting
    for (const p of this.players) {
      if (!p.alive) continue;
      if (p.throwCd > 0) p.throwCd--;
      const inp = inputPlayers[p.index];
      if ((inp.action || inp.releaseAction) && p.throwCd <= 0) {
        if (p.weap === 'shotgun') {
          p.throwCd = 24;
          for (const spread of [-0.2, 0, 0.2]) {
            const a = p.angle + spread;
            this.projectiles.push({
              x: p.x + Math.cos(a) * 18,
              y: p.y - 6 + Math.sin(a) * 18,
              vx: Math.cos(a) * 11.5,
              vy: Math.sin(a) * 11.5,
              owner: p.index,
              life: 44,
              snow: false,
              color: '#fbbf24',
              radius: 4.5,
              dmg: 32,
              kind: 'shotgun',
            });
          }
        } else if (p.weap === 'rapid') {
          p.throwCd = 6;
          const jitter = (Math.random() - 0.5) * 0.08;
          const a = p.angle + jitter;
          this.projectiles.push({
            x: p.x + Math.cos(a) * 18,
            y: p.y - 6 + Math.sin(a) * 18,
            vx: Math.cos(a) * 13,
            vy: Math.sin(a) * 13,
            owner: p.index,
            life: 62,
            snow: false,
            color: '#38bdf8',
            radius: 4.2,
            dmg: 22,
            kind: 'bolt',
          });
        } else {
          p.throwCd = 13;
          this.projectiles.push({
            x: p.x + Math.cos(p.angle) * 18,
            y: p.y - 6 + Math.sin(p.angle) * 18,
            vx: Math.cos(p.angle) * 11.5,
            vy: Math.sin(p.angle) * 11.5,
            owner: p.index,
            life: 68,
            snow: false,
            color: '#38bdf8',
            radius: 5,
            dmg: 34,
            kind: 'bolt',
          });
        }
        p.isAttacking = true;
        p.attackTimer = 6;
        p.vx -= Math.cos(p.angle) * 0.7;
        p.vy -= Math.sin(p.angle) * 0.7;
        PartyAudio.play('shot');
      }
    }

    // Update Zombies
    const alivePlayers = this.players.filter((p) => p.alive);
    for (let i = 0; i < this.zombies.length; i++) {
      const z = this.zombies[i];
      if (z.hitFlash > 0) z.hitFlash--;

      // Find nearest alive player
      let nearest: MiniPlayer | null = null;
      let bestDist = Infinity;
      for (const pl of alivePlayers) {
        const d = Math.hypot(pl.x - z.x, pl.y - z.y);
        if (d < bestDist) { bestDist = d; nearest = pl; }
      }

      if (nearest) {
        const ang = Math.atan2(nearest.y - z.y, nearest.x - z.x);
        const sp = z.kind === 1 ? 2.55 : z.kind === 2 ? 1.25 : 1.65 + this.zombieWave * 0.08;
        z.vx = z.vx * 0.8 + Math.cos(ang) * sp * 0.22;
        z.vy = z.vy * 0.8 + Math.sin(ang) * sp * 0.22;
      }

      // Soft separation between zombies
      for (let j = i + 1; j < this.zombies.length; j++) {
        const o = this.zombies[j];
        const dx = o.x - z.x;
        const dy = o.y - z.y;
        const d = Math.hypot(dx, dy);
        if (d > 0 && d < 26) {
          const push = (26 - d) * 0.08;
          z.vx -= (dx / d) * push;
          z.vy -= (dy / d) * push;
          o.vx += (dx / d) * push;
          o.vy += (dy / d) * push;
        }
      }

      z.x += z.vx;
      z.y += z.vy;
      z.phase += Math.hypot(z.vx, z.vy) * 0.16;

      const zr = z.kind === 2 ? 22 : z.kind === 1 ? 14 : 16;
      this.resolvePillarCollisions({ x: z.x, y: z.y, radius: zr });

      // Bite players
      for (const pl of alivePlayers) {
        if (pl.invincible > 0) continue;
        if (Math.hypot(pl.x - z.x, pl.y - z.y) < pl.radius + zr) {
          const bite = z.kind === 2 ? 32 : z.kind === 1 ? 18 : 22;
          pl.hp -= bite;
          pl.invincible = 30;
          const kang = Math.atan2(pl.y - z.y, pl.x - z.x);
          pl.vx += Math.cos(kang) * 7.5;
          pl.vy += Math.sin(kang) * 7.5;
          this.spawnParticle(pl.x, pl.y, '#4ade80', 10, 4, 18);
          this.triggerShake(5, 8);
          PartyAudio.play('hit');
          if (pl.hp <= 0) this.killPlayer(pl);
        }
      }
    }

    // Cap remaining time if only 1 player is left in 2+ player game
    if (this.playerCount >= 2 && alivePlayers.length === 1 && this.gameTimer > 9 * 60) {
      this.gameTimer = 9 * 60;
      this.addPopup(this.cw / 2, 86, 'SON SAĞ QALAN — 9s DÖZ!', '#fbbf24');
    }

    if (alivePlayers.length === 0 || this.gameTimer <= 0) {
      // Score round win to player with best kills (+ survival bonus)
      const ranked = this.players.map((p) => p.coins + (p.alive ? 3 : 0));
      const best = Math.max(...ranked, 0);
      for (const p of this.players) {
        if (ranked[p.index] === best) p.score++;
      }
      this.endRound();
    }
  }

  private updateSamurai() {
    for (let i = 0; i < this.players.length; i++) {
      const p = this.players[i];
      if (!p.alive) continue;
      const inp = inputPlayers[i];
      if ((inp.action || inp.releaseAction) && p.dashCooldown <= 0) {
        const dax = Math.cos(p.angle);
        const day = Math.sin(p.angle);
        p.vx += dax * 15.5;
        p.vy += day * 15.5;
        p.leanVx -= dax * 5.2;
        p.headVx -= dax * 6.5;
        p.tiltV += dax * 0.2;
        p.dashCooldown = 30;
        p.isAttacking = true;
        p.attackTimer = 14;
        this.slashes.push({
          x: p.x + dax * 14,
          y: p.y + day * 14,
          angle: p.angle,
          color: p.color,
          life: 11,
          maxLife: 11,
          radius: 44,
        });
        this.spawnParticle(p.x + dax * 22, p.y + day * 22, '#ffffff', 7, 3.6, 14);
        PartyAudio.play('shot');

        // Katana Hit / Parry Check
        for (const o of this.players) {
          if (!o.alive || o.index === p.index || o.invincible > 0) continue;
          const dx = o.x - p.x;
          const dy = o.y - p.y;
          const dist = Math.hypot(dx, dy);
          const angTo = Math.atan2(dy, dx);
          if (dist < 62 && angleDiff(p.angle, angTo) < 1.15) {
            if (o.isAttacking) {
              // KATANA PARRY CLASH!
              const mx = (p.x + o.x) / 2;
              const my = (p.y + o.y) / 2;
              this.spawnParticle(mx, my, '#fde047', 22, 6, 22);
              this.spawnRing(mx, my, 52, '#fbbf24', 18);
              this.addPopup(mx, my - 26, 'PARİ!', '#fde047');
              this.triggerShake(8, 12);
              p.vx -= Math.cos(angTo) * 9;
              p.vy -= Math.sin(angTo) * 9;
              o.vx += Math.cos(angTo) * 9;
              o.vy += Math.sin(angTo) * 9;
              p.invincible = 14;
              o.invincible = 14;
              PartyAudio.play('iceCrack');
            } else {
              o.hp -= 50;
              o.invincible = 24;
              o.vx += Math.cos(angTo) * 11;
              o.vy += Math.sin(angTo) * 11;
              this.spawnParticle(o.x, o.y, '#ef4444', 18, 5, 22);
              this.spawnRing(o.x, o.y, 40, p.color, 15);
              this.triggerShake(7, 10);
              PartyAudio.play('hit');
              if (o.hp <= 0) this.killPlayer(o);
            }
          }
        }
      }
    }
  }

  private raycastPoint(ox: number, oy: number, ang: number, maxDist: number): { x: number; y: number } {
    const step = 6;
    const dx = Math.cos(ang) * step;
    const dy = Math.sin(ang) * step;
    let x = ox;
    let y = oy;
    for (let d = 0; d < maxDist; d += step) {
      x += dx;
      y += dy;
      if (x <= 8 || x >= this.cw - 8 || y <= 46 || y >= this.ch - 8) break;
      let hitP = false;
      for (const pil of this.pillars) {
        if (x >= pil.x && x <= pil.x + pil.w && y >= pil.y && y <= pil.y + pil.h) {
          hitP = true;
          break;
        }
      }
      if (hitP) break;
    }
    return { x, y };
  }

  private updateSniper() {
    for (const p of this.players) {
      if (!p.alive) continue;
      if (p.throwCd > 0) p.throwCd--;
      const inp = inputPlayers[p.index];
      if ((inp.action || inp.releaseAction) && p.throwCd <= 0) {
        p.throwCd = 34;
        const speed = 17.5;
        this.projectiles.push({
          x: p.x + Math.cos(p.angle) * 24,
          y: p.y - 6 + Math.sin(p.angle) * 24,
          vx: Math.cos(p.angle) * speed,
          vy: Math.sin(p.angle) * speed,
          owner: p.index,
          life: 120,
          snow: false,
          color: p.color,
          radius: 4.8,
          bounces: 1,
          dmg: 55,
          kind: 'sniper',
        });
        p.isAttacking = true;
        p.attackTimer = 10;
        p.vx -= Math.cos(p.angle) * 4.5;
        p.vy -= Math.sin(p.angle) * 4.5;
        this.spawnParticle(p.x + Math.cos(p.angle) * 24, p.y - 6 + Math.sin(p.angle) * 24, '#fbbf24', 8, 3.8, 12);
        this.triggerShake(4, 6);
        PartyAudio.play('shot');
      }
    }
  }

  private updateBlades() {
    this.sawSpawnTimer++;
    if (this.sawSpawnTimer === 60 * 11 && this.saws.length < 3) {
      this.saws.push({
        x: this.cw / 2,
        y: 80,
        vx: 4.6,
        vy: 3.8,
        r: 22,
        rot: 0,
      });
      this.addPopup(this.cw / 2, this.ch * 0.25, '+1 MİŞAR!', '#f97316');
      PartyAudio.play('portal');
    }
    if (this.sawSpawnTimer === 60 * 24 && this.saws.length < 4) {
      this.saws.push({
        x: this.cw / 2,
        y: this.ch - 60,
        vx: -4.8,
        vy: -4.0,
        r: 20,
        rot: 0,
      });
      this.addPopup(this.cw / 2, this.ch * 0.25, 'SON SÜRƏT!', '#ef4444');
      PartyAudio.play('portal');
    }

    for (const s of this.saws) {
      s.rot += 0.24;
      s.vx *= 1.0004;
      s.vy *= 1.0004;
      const maxSp = 7.4;
      const curSp = Math.hypot(s.vx, s.vy);
      if (curSp > maxSp) {
        s.vx = (s.vx / curSp) * maxSp;
        s.vy = (s.vy / curSp) * maxSp;
      }
      s.x += s.vx;
      s.y += s.vy;
      if (s.x - s.r < 10) { s.x = 10 + s.r; s.vx = Math.abs(s.vx); this.spawnParticle(s.x - s.r, s.y, '#fbbf24', 5, 3, 12); }
      if (s.x + s.r > this.cw - 10) { s.x = this.cw - 10 - s.r; s.vx = -Math.abs(s.vx); this.spawnParticle(s.x + s.r, s.y, '#fbbf24', 5, 3, 12); }
      if (s.y - s.r < 48) { s.y = 48 + s.r; s.vy = Math.abs(s.vy); this.spawnParticle(s.x, s.y - s.r, '#fbbf24', 5, 3, 12); }
      if (s.y + s.r > this.ch - 10) { s.y = this.ch - 10 - s.r; s.vy = -Math.abs(s.vy); this.spawnParticle(s.x, s.y + s.r, '#fbbf24', 5, 3, 12); }

      for (const p of this.players) {
        if (!p.alive || p.invincible > 0) continue;
        if (Math.hypot(p.x - s.x, p.y - s.y) < p.radius + s.r - 3) {
          p.hp -= 50;
          p.invincible = 32;
          const ang = Math.atan2(p.y - s.y, p.x - s.x);
          p.vx += Math.cos(ang) * 11;
          p.vy += Math.sin(ang) * 11;
          this.spawnParticle(p.x, p.y, '#ef4444', 16, 5, 22);
          this.triggerShake(7, 10);
          PartyAudio.play('hit');
          if (p.hp <= 0) this.killPlayer(p);
        }
      }
    }
  }

  private updateSumo() {
    this.gameTimer++;
    if (this.gameTimer > 60 * 10) {
      this.ringScale = Math.max(0.46, 1 - (this.gameTimer - 60 * 10) / (60 * 32));
    }
  }

  private updateFutbol() {
    const b = this.ball;
    if (!b) return;
    b.vx *= 0.982;
    b.vy *= 0.982;
    b.x += b.vx;
    b.y += b.vy;
    if (b.y - b.radius < 48) { b.y = 48 + b.radius; b.vy *= -0.84; }
    if (b.y + b.radius > this.ch - 6) { b.y = this.ch - 6 - b.radius; b.vy *= -0.84; }

    // Corner bumpers so the ball never stalls in corners
    const corners: [number, number][] = [
      [18, 52],
      [this.cw - 18, 52],
      [18, this.ch - 10],
      [this.cw - 18, this.ch - 10],
    ];
    for (const [cx, cy] of corners) {
      const dx = b.x - cx;
      const dy = b.y - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < b.radius + 26 && dist > 0.01) {
        const nx = dx / dist;
        const ny = dy / dist;
        b.x = cx + nx * (b.radius + 26);
        b.y = cy + ny * (b.radius + 26);
        const dot = b.vx * nx + b.vy * ny;
        if (dot < 0) {
          b.vx = (b.vx - 2 * dot * nx) * 0.9 + nx * 1.4;
          b.vy = (b.vy - 2 * dot * ny) * 0.9 + ny * 1.4;
        }
      }
    }

    const goalW = 20;
    const goalH = this.ch * 0.34;
    const goalTop = (this.ch + 44) / 2 - goalH / 2;
    const goalBot = (this.ch + 44) / 2 + goalH / 2;

    if (b.x - b.radius < goalW && b.y > goalTop && b.y < goalBot) {
      this.players[1].score++;
      if (this.players[3]) this.players[3].score++;
      this.spawnParticle(b.x, b.y, '#ef4444', 32, 6.5, 38);
      this.spawnRing(b.x, b.y, 70, '#ef4444', 24);
      this.addPopup(this.cw / 2, this.ch / 2 - 40, 'GOL!', '#ef4444');
      this.triggerShake(8, 13);
      PartyAudio.play('coin');
      b.x = this.cw / 2; b.y = (this.ch + 44) / 2; b.vx = 0; b.vy = 0;
      if (this.players.some((p) => p.score - p.roundStart >= 3)) this.endRound();
      return;
    }
    if (b.x + b.radius > this.cw - goalW && b.y > goalTop && b.y < goalBot) {
      this.players[0].score++;
      if (this.players[2]) this.players[2].score++;
      this.spawnParticle(b.x, b.y, '#3b82f6', 32, 6.5, 38);
      this.spawnRing(b.x, b.y, 70, '#3b82f6', 24);
      this.addPopup(this.cw / 2, this.ch / 2 - 40, 'GOL!', '#3b82f6');
      this.triggerShake(8, 13);
      PartyAudio.play('coin');
      b.x = this.cw / 2; b.y = (this.ch + 44) / 2; b.vx = 0; b.vy = 0;
      if (this.players.some((p) => p.score - p.roundStart >= 3)) this.endRound();
      return;
    }

    if (b.x - b.radius < goalW && (b.y < goalTop || b.y > goalBot)) { b.x = goalW + b.radius; b.vx *= -0.84; }
    if (b.x + b.radius > this.cw - goalW && (b.y < goalTop || b.y > goalBot)) { b.x = this.cw - goalW - b.radius; b.vx *= -0.84; }

    for (const p of this.players) {
      if (!p.alive) continue;
      const dx = b.x - p.x;
      const dy = b.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < p.radius + b.radius) {
        const ang = Math.atan2(dy, dx);
        const inp = inputPlayers[p.index];
        const superKick = inp.action || inp.releaseAction || p.isAttacking;
        const kick = superKick ? 12.6 : 5.2;
        b.vx = Math.cos(ang) * kick;
        b.vy = Math.sin(ang) * kick;
        b.lastKicker = p.index;
        b.x = p.x + Math.cos(ang) * (p.radius + b.radius + 1);
        b.y = p.y + Math.sin(ang) * (p.radius + b.radius + 1);
        if (superKick) this.spawnRing(b.x, b.y, 34, p.color, 14);
        this.spawnParticle(b.x, b.y, superKick ? '#fbbf24' : '#ffffff', 7, 3, 14);
        PartyAudio.play('hit');
      }
    }
  }

  private updateRace() {
    const groundY = this.ch - 26;
    const bodyHw = 11;
    const footHh = 22;
    const headHh = 28;
    let maxX = 0;

    for (const p of this.players) {
      if (!p.alive) continue;
      const inp = inputPlayers[p.index];
      const targetVx = Math.abs(inp.x) > 0.1 ? inp.x * (Math.abs(inp.x) > 0.55 ? 5.25 : 3.4) : 0;
      if (Math.abs(inp.x) > 0.1) {
        p.angle = inp.x >= 0 ? 0 : Math.PI;
      }

      const prevRaceX = p.raceX;
      p.vx = targetVx + (p.isAttacking ? Math.sign(targetVx || Math.cos(p.angle) || 1) * 2.8 : 0);
      p.raceX = Math.max(24, p.raceX + p.vx);

      for (const obs of this.raceObstacles) {
        if (obs.kind === 'platform' || obs.kind === 'spring' || obs.kind === 'boost') continue;
        if (p.y + footHh > obs.y + 3 && p.y - headHh < obs.y + obs.h - 2) {
          if (p.raceX + bodyHw > obs.x && p.raceX - bodyHw < obs.x + obs.w) {
            if (prevRaceX <= obs.x - bodyHw + 4) {
              p.raceX = obs.x - bodyHw;
            } else if (prevRaceX >= obs.x + obs.w + bodyHw - 4) {
              p.raceX = obs.x + obs.w + bodyHw;
            } else {
              p.raceX = prevRaceX < obs.x + obs.w / 2 ? obs.x - bodyHw : obs.x + obs.w + bodyHw;
            }
          }
        }
      }

      const wantJ = inp.jump;
      if (wantJ && !p.jh) {
        p.jumpBuf = 7;
      } else if (!wantJ) {
        p.jh = false;
      }
      if (p.jumpBuf > 0) p.jumpBuf--;

      if (p.jumpBuf > 0 && (p.onGround || p.coyoteT > 0)) {
        p.vy = -12.0;
        p.onGround = false;
        p.coyoteT = 0;
        p.jumpBuf = 0;
        p.jumpsLeft = 0;
        p.jh = true;
        p.highJ = inp.y < -0.8;
        p.headVy += 2.8;
        this.spawnParticle(p.x, p.y + footHh, '#e4e4e7', 5, 2.2, 12);
        PartyAudio.play('jump');
      }
      if (inp.y >= -0.72) p.highJ = false;
      if (p.vy < -2.8 && !wantJ && !p.highJ) p.vy *= 0.87;

      const prevBottom = p.y + footHh;
      const prevTop = p.y - headHh;
      const prevOnGround = p.onGround;
      const preLandVy = p.vy;
      p.vy = Math.min(13.5, p.vy + 0.46 * (p.vy > 0 ? 1.14 : 1.0));
      p.y += p.vy;
      p.onGround = false;

      if (p.y + footHh >= groundY) {
        p.y = groundY - footHh;
        p.vy = 0;
        p.onGround = true;
        p.coyoteT = 6;
        p.jumpsLeft = 1;
      }

      for (const obs of this.raceObstacles) {
        if (p.raceX + bodyHw <= obs.x + 1 || p.raceX - bodyHw >= obs.x + obs.w - 1) continue;

        if (obs.kind === 'spring') {
          if (p.y + footHh >= obs.y && p.y - headHh <= obs.y + obs.h) {
            p.y = obs.y - footHh;
            p.vy = -14.2;
            p.onGround = false;
            p.coyoteT = 0;
            p.jumpsLeft = 0;
            p.headVy += 4;
            this.spawnParticle(p.x, obs.y, '#4ade80', 10, 3.6, 18);
            PartyAudio.play('jump');
          }
          continue;
        }

        if (obs.kind === 'boost') {
          if (p.y + footHh >= obs.y - 4 && !p.isAttacking) {
            p.isAttacking = true;
            p.attackTimer = 22;
            p.leanVx -= 3.5;
            this.spawnParticle(p.x, p.y + footHh, '#38bdf8', 6, 2.8, 14);
          }
          continue;
        }

        if (p.vy >= 0 && prevBottom <= obs.y + 10 && p.y + footHh >= obs.y) {
          p.y = obs.y - footHh;
          p.vy = 0;
          p.onGround = true;
          p.coyoteT = 6;
          p.jumpsLeft = 1;
        } else if (obs.kind !== 'platform' && p.vy < 0 && prevTop >= obs.y + obs.h - 10 && p.y - headHh <= obs.y + obs.h) {
          p.y = obs.y + obs.h + headHh;
          p.vy = 0.5;
        }
      }

      if (!p.onGround) p.coyoteT = Math.max(0, p.coyoteT - 1);
      if (p.onGround && !prevOnGround && preLandVy > 3.2) {
        p.sq = Math.min(10, Math.round(preLandVy * 0.85));
        p.headVy += Math.min(5, preLandVy * 0.42);
      }

      if (p.attackTimer > 0 && --p.attackTimer <= 0) p.isAttacking = false;
      if (Math.hypot(p.vx, p.vy) > 2.4) {
        p.trail.push({ x: p.x, y: p.y, life: 8 });
        if (p.trail.length > 6) p.trail.shift();
      }
      p.trail = p.trail.filter((tr) => --tr.life > 0);
      this.updateMiniSprings(p, true);

      if (p.raceX > maxX) maxX = p.raceX;
    }

    this.raceOffset = Math.max(0, maxX - this.cw * 0.36);
    for (const p of this.players) {
      p.x = p.raceX - this.raceOffset;
    }

    for (const p of this.players) {
      if (p.alive && p.raceX >= this.raceFinishX) {
        p.score++;
        for (const col of ['#4ade80', '#38bdf8', '#fbbf24', '#f472b6']) {
          this.spawnParticle(p.x, p.y - 20, col, 8, 5, 34);
        }
        this.addPopup(p.x, p.y - 34, 'FİNİŞ!', '#4ade80');
        PartyAudio.play('coin');
        this.endRound();
        return;
      }
    }
  }

  private updateBomb() {
    const b = this.ball;
    if (!b) return;
    if (b.noPick > 0) b.noPick--;

    if (b.holder >= 0 && this.players[b.holder]?.alive) {
      const h = this.players[b.holder];
      b.x = h.x;
      b.y = h.y - h.radius - 13;
      b.fuse--;
      if (h.throwCd > 0) h.throwCd--;
      const inp = inputPlayers[h.index];
      if ((inp.action || inp.releaseAction) && h.throwCd <= 0) {
        h.throwCd = 24;
        b.holder = -1;
        b.lastKicker = h.index;
        b.noPick = 24;
        b.vx = Math.cos(h.angle) * 11;
        b.vy = Math.sin(h.angle) * 11;
        PartyAudio.play('shot');
      } else if (b.fuse <= 0) {
        this.explodeHotBomb(b.x, b.y);
      }
    } else {
      b.holder = -1;
      b.vx *= 0.94;
      b.vy *= 0.94;
      b.x += b.vx;
      b.y += b.vy;
      if (b.x < 20 || b.x > this.cw - 20) { b.vx *= -0.78; b.x = Math.max(20, Math.min(this.cw - 20, b.x)); }
      if (b.y < 52 || b.y > this.ch - 20) { b.vy *= -0.78; b.y = Math.max(52, Math.min(this.ch - 20, b.y)); }
      this.resolvePillarCollisions({ x: b.x, y: b.y, radius: b.radius });
      b.fuse--;
      if (b.fuse <= 0) {
        this.explodeHotBomb(b.x, b.y);
        return;
      }
      for (const p of this.players) {
        if (!p.alive) continue;
        if (p.index === b.lastKicker && b.noPick > 0) continue;
        if (Math.hypot(p.x - b.x, p.y - b.y) < p.radius + b.radius) {
          b.holder = p.index;
          b.lastKicker = p.index;
          b.vx = 0;
          b.vy = 0;
          this.spawnParticle(p.x, p.y - 20, '#f97316', 7, 3, 14);
          PartyAudio.play('hit');
          break;
        }
      }
    }
  }

  private explodeHotBomb(bx: number, by: number) {
    PartyAudio.play('boom');
    this.spawnParticle(bx, by, '#f97316', 34, 6.8, 34);
    this.spawnParticle(bx, by, '#fbbf24', 20, 4.8, 28);
    this.spawnRing(bx, by, 96, '#ef4444', 24);
    this.triggerShake(11, 16);
    for (const p of this.players) {
      if (!p.alive) continue;
      if (Math.hypot(p.x - bx, p.y - by) < 92) {
        p.hp = 0;
        this.killPlayer(p);
      }
    }
    if (this.ball) {
      this.ball.holder = -1;
      this.ball.lastKicker = -1;
      this.ball.fuse = 6 * 60;
      this.ball.x = this.cw / 2;
      this.ball.y = this.ch / 2;
      this.ball.vx = 0;
      this.ball.vy = 0;
    }
  }

  private updateLaser() {
    this.gameTimer--;
    const elapsed = (this.gameTimerMax - this.gameTimer) / 60;
    if (--this.laserSpawnTimer <= 0) {
      const interval = Math.max(36, Math.round(88 - elapsed * 1.35));
      this.laserSpawnTimer = interval;
      const mode = Math.floor(Math.random() * 4);
      const cols = ['#ef4444', '#f43f5e', '#38bdf8', '#a855f7'];
      const warnT = Math.max(34, 54 - Math.floor(elapsed * 0.6));
      if (mode === 0) {
        const yy = 66 + Math.random() * (this.ch - 96);
        this.beams.push({ x1: 0, y1: yy, x2: this.cw, y2: yy, warn: warnT, active: 22, width: 11, color: cols[0] });
      } else if (mode === 1) {
        const xx = 42 + Math.random() * (this.cw - 84);
        this.beams.push({ x1: xx, y1: 44, x2: xx, y2: this.ch, warn: warnT, active: 22, width: 11, color: cols[1] });
      } else if (mode === 2) {
        const flip = Math.random() < 0.5;
        const off = (Math.random() - 0.5) * this.cw * 0.45;
        this.beams.push({
          x1: flip ? this.cw + off : off,
          y1: 44,
          x2: flip ? off : this.cw + off,
          y2: this.ch,
          warn: warnT,
          active: 22,
          width: 11,
          color: cols[2],
        });
      } else {
        // Double cross-X laser pattern!
        const cx = 140 + Math.random() * (this.cw - 280);
        const cy = 110 + Math.random() * (this.ch - 180);
        this.beams.push({ x1: cx - 420, y1: cy - 320, x2: cx + 420, y2: cy + 320, warn: warnT + 10, active: 22, width: 10, color: cols[3] });
        this.beams.push({ x1: cx + 420, y1: cy - 320, x2: cx - 420, y2: cy + 320, warn: warnT + 10, active: 22, width: 10, color: cols[3] });
      }
    }

    // Shield orb spawns
    if (++this.coinSpawnTimer >= 165 && this.coins.length < 2) {
      this.coinSpawnTimer = 0;
      this.coins.push({
        x: 64 + Math.random() * (this.cw - 128),
        y: 80 + Math.random() * (this.ch - 120),
        radius: 12,
        life: 360,
        diamond: true,
        kind: 'shield',
      });
    }
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      if (--c.life <= 0) { this.coins.splice(i, 1); continue; }
      for (const p of this.players) {
        if (!p.alive) continue;
        if (Math.hypot(p.x - c.x, p.y - c.y) < p.radius + c.radius) {
          p.shield = true;
          p.hp = Math.min(100, p.hp + 20);
          p.score++;
          this.addPopup(p.x, p.y - 24, 'QALXAN!', '#38bdf8');
          this.spawnParticle(c.x, c.y, '#38bdf8', 12, 3.6, 18);
          PartyAudio.play('coin');
          this.coins.splice(i, 1);
          break;
        }
      }
    }

    for (let i = this.beams.length - 1; i >= 0; i--) {
      const b = this.beams[i];
      if (b.warn > 0) {
        b.warn--;
        if (b.warn === 0) {
          this.triggerShake(4, 6);
          PartyAudio.play('shot');
        }
        continue;
      }
      b.active--;
      for (const p of this.players) {
        if (!p.alive || p.invincible > 0) continue;
        if (pointSegDist(p.x, p.y, b.x1, b.y1, b.x2, b.y2) < p.radius + b.width * 0.75) {
          if (p.shield) {
            p.shield = false;
            p.invincible = 34;
            this.spawnRing(p.x, p.y, 44, '#38bdf8', 18);
            this.addPopup(p.x, p.y - 24, 'BLOKLANDI!', '#38bdf8');
            PartyAudio.play('ice');
          } else {
            p.hp -= 38;
            p.invincible = 34;
            this.spawnParticle(p.x, p.y, b.color, 16, 4.5, 20);
            this.triggerShake(6, 10);
            PartyAudio.play('hit');
            if (p.hp <= 0) this.killPlayer(p);
          }
        }
      }
      if (b.active <= 0) this.beams.splice(i, 1);
    }

    if (this.gameTimer <= 0) {
      for (const p of this.players) if (p.alive) p.score++;
      this.endRound();
    }
  }

  private generateLavaPlats(targetMinY: number) {
    const cw = this.cw;
    let tier = this.plats.length;
    while (this.highestPlatY > targetMinY) {
      const gap = 66 + Math.random() * 16;
      this.highestPlatY -= gap;
      const y = this.highestPlatY;
      const w = Math.max(114, 158 - Math.min(34, tier * 0.65));
      const slot = tier % 3;
      const moving = tier >= 2 && Math.random() < 0.42;
      const isSpring = !moving && tier >= 2 && Math.random() < 0.24;
      const kind: 'stone' | 'spring' = isSpring ? 'spring' : 'stone';
      if (slot === 0) {
        const x = 36 + Math.random() * Math.max(20, cw * 0.34 - w * 0.5);
        this.plats.push({
          x,
          y,
          w,
          dx: moving ? (Math.random() < 0.5 ? 0.9 : -0.9) : 0,
          minX: 24,
          maxX: cw * 0.55,
          kind,
        });
      } else if (slot === 1) {
        const x = cw * 0.52 + Math.random() * Math.max(20, cw * 0.4 - w);
        this.plats.push({
          x: Math.min(cw - w - 24, x),
          y,
          w,
          dx: moving ? (Math.random() < 0.5 ? -0.95 : 0.95) : 0,
          minX: cw * 0.44,
          maxX: cw - 24,
          kind,
        });
      } else {
        const x = cw * 0.32 + Math.random() * Math.max(15, cw * 0.32 - w * 0.5);
        this.plats.push({
          x,
          y,
          w: w + 12,
          dx: moving ? 1.15 : 0,
          minX: cw * 0.16,
          maxX: cw * 0.84,
          kind,
        });
      }
      tier++;
    }
  }

  private updateLava() {
    this.lavaTick++;
    const alive = this.players.filter((p) => p.alive);
    if (alive.length > 0) {
      const minY = Math.min(...alive.map((p) => p.y));
      const targetCam = Math.min(this.lavaCamY, minY - this.ch * 0.42);
      this.lavaCamY += (targetCam - this.lavaCamY) * 0.12;
    }

    this.generateLavaPlats(this.lavaCamY - 280);
    this.plats = this.plats.filter((pl) => pl.y < this.lavaY + 140);

    if (this.lavaTick > 70) {
      this.lavaY -= 0.38;
      const maxFloor = this.lavaCamY + this.ch + 120;
      if (this.lavaY > maxFloor) this.lavaY = maxFloor;
    }

    if (this.lavaTick % 5 === 0) {
      this.particles.push({
        x: Math.random() * this.cw,
        y: this.lavaY + 4,
        vx: (Math.random() - 0.5) * 1.6,
        vy: -1.8 - Math.random() * 2.2,
        life: 24,
        maxLife: 24,
        color: Math.random() < 0.5 ? '#fde047' : '#f97316',
        radius: 2 + Math.random() * 2.5,
      });
    }

    for (const p of this.players) {
      if (!p.alive) continue;
      if (p.y + p.radius * 0.6 > this.lavaY || p.y > this.lavaCamY + this.ch + 45) {
        this.spawnParticle(p.x, Math.min(p.y, this.lavaY), '#f97316', 18, 5, 26);
        PartyAudio.play('boom');
        this.killPlayer(p);
      }
    }
  }

  private updateTiles() {
    this.gameTimer--;
    const deck = this.getGridBounds();
    const decaySpeed = this.gameTimer < 15 * 60 ? 2 : 1;

    for (let i = 0; i < this.tiles.length; i++) {
      if (this.tiles[i] > 0 && this.tiles[i] < 55) {
        this.tiles[i] = Math.min(55, this.tiles[i] + decaySpeed);
        if (this.tiles[i] === 55) {
          const c = i % this.tileCols;
          const r = Math.floor(i / this.tileCols);
          this.spawnParticle(deck.x + (c + 0.5) * deck.cw, deck.y + (r + 0.5) * deck.ch, '#ef4444', 6, 2.5, 16);
        }
      }
    }

    for (const p of this.players) {
      if (!p.alive) continue;
      if (p.zHop > 3) continue; // Airborne hop safely clears broken tiles!
      const col = Math.floor((p.x - deck.x) / deck.cw);
      const row = Math.floor((p.y - deck.y) / deck.ch);
      if (col < 0 || col >= this.tileCols || row < 0 || row >= this.tileRows) {
        this.killPlayer(p);
        continue;
      }
      const idx = row * this.tileCols + col;
      if (this.tiles[idx] >= 55) {
        this.killPlayer(p);
      } else if (this.tiles[idx] === 0) {
        this.tiles[idx] = 1;
      }
    }

    if (this.gameTimer <= 0) {
      for (const p of this.players) if (p.alive) p.score++;
      this.endRound();
    }
  }

  private paintTile(col: number, row: number, owner: number) {
    if (col < 0 || col >= this.tileCols || row < 0 || row >= this.tileRows) return;
    const idx = row * this.tileCols + col;
    if (this.tiles[idx] !== owner) {
      this.tiles[idx] = owner;
    }
  }

  private paintSplash(px: number, py: number, owner: number, radius = 1) {
    const deck = this.getGridBounds();
    const col = Math.floor((px - deck.x) / deck.cw);
    const row = Math.floor((py - deck.y) / deck.ch);
    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        if (Math.abs(dr) + Math.abs(dc) <= radius + 1) {
          this.paintTile(col + dc, row + dr, owner);
        }
      }
    }
  }

  private updatePaint() {
    this.gameTimer--;
    const deck = this.getGridBounds();
    for (const p of this.players) {
      if (!p.alive) continue;
      p.x = Math.max(deck.x + p.radius * 0.5, Math.min(deck.x + deck.w - p.radius * 0.5, p.x));
      p.y = Math.max(deck.y + p.radius * 0.5, Math.min(deck.y + deck.h - p.radius * 0.5, p.y));
      const col = Math.floor((p.x - deck.x) / deck.cw);
      const row = Math.floor((p.y - deck.y) / deck.ch);
      this.paintTile(col, row, p.index);
    }

    // Paint Bomb Powerup Pickups
    if (++this.coinSpawnTimer >= 190 && this.coins.length < 2) {
      this.coinSpawnTimer = 0;
      this.coins.push({
        x: deck.x + 36 + Math.random() * (deck.w - 72),
        y: deck.y + 36 + Math.random() * (deck.h - 72),
        radius: 13,
        life: 360,
        diamond: true,
        kind: 'paintbomb',
      });
    }
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      if (--c.life <= 0) { this.coins.splice(i, 1); continue; }
      for (const p of this.players) {
        if (!p.alive) continue;
        if (Math.hypot(p.x - c.x, p.y - c.y) < p.radius + c.radius) {
          this.paintSplash(c.x, c.y, p.index, 2);
          this.spawnParticle(c.x, c.y, p.color, 22, 5.2, 24);
          this.spawnRing(c.x, c.y, 76, p.color, 20);
          this.addPopup(c.x, c.y - 20, 'MEGA RƏNG!', p.color);
          this.triggerShake(6, 9);
          PartyAudio.play('boom');
          this.coins.splice(i, 1);
          break;
        }
      }
    }

    const counts = [0, 0, 0, 0];
    for (const owner of this.tiles) {
      if (owner >= 0 && owner < 4) counts[owner]++;
    }
    for (const p of this.players) p.coins = counts[p.index] || 0;

    if (this.gameTimer <= 0) {
      const top = Math.max(...this.players.map((p) => p.coins), 0);
      for (const p of this.players) {
        if (p.coins === top && top > 0) p.score++;
      }
      this.endRound();
    }
  }

  private drawMiniHeader(ctx: CanvasRenderingContext2D, text: string, ratio?: number) {
    ctx.save();
    ctx.fillStyle = 'rgba(9,9,11,0.86)';
    roundRectPath(ctx, this.cw / 2 - 76, 10, 152, 26, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#f4f4f5';
    ctx.font = '700 13px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, this.cw / 2, 23);
    if (ratio !== undefined) {
      const bw = Math.min(280, this.cw * 0.36);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(this.cw / 2 - bw / 2, 40, bw, 4);
      ctx.fillStyle = ratio > 0.25 ? '#f4f4f5' : '#ef4444';
      ctx.fillRect(this.cw / 2 - bw / 2, 40, bw * Math.max(0, Math.min(1, ratio)), 4);
    }
    ctx.restore();
  }

  private drawZombie(ctx: CanvasRenderingContext2D, z: ZombieEntity) {
    ctx.save();
    ctx.translate(z.x, z.y);
    const sc = z.kind === 2 ? 1.38 : z.kind === 1 ? 0.92 : 1.04;
    ctx.scale(sc, sc);

    const bodyCol = z.hitFlash > 0
      ? '#ffffff'
      : z.kind === 2
        ? '#a855f7'
        : z.kind === 1
          ? '#a3e635'
          : '#22c55e';
    const faceDir = z.vx >= 0 ? 1 : -1;
    const stride = Math.sin(z.phase);
    const bob = -Math.abs(Math.cos(z.phase)) * 2.4;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath(); ctx.ellipse(0, 18, 10, 3.2, 0, 0, Math.PI * 2); ctx.fill();

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // Legs
    for (const [hx, fx] of [[-2, -4 + stride * 7], [2, 4 - stride * 7]] as [number, number][]) {
      ctx.beginPath(); ctx.moveTo(hx, 6 + bob); ctx.lineTo(fx, 18);
      ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 6.2; ctx.stroke();
      ctx.strokeStyle = bodyCol; ctx.lineWidth = 4.4; ctx.stroke();
    }
    // Hunched Spine
    ctx.beginPath(); ctx.moveTo(0, 6 + bob); ctx.lineTo(faceDir * 3, -9 + bob);
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 7.4; ctx.stroke();
    ctx.strokeStyle = bodyCol; ctx.lineWidth = 5.6; ctx.stroke();

    // Outstretched Zombie Arms
    ctx.beginPath();
    ctx.moveTo(faceDir * 2, -6 + bob);
    ctx.lineTo(faceDir * 14, -5 + bob + stride * 2);
    ctx.moveTo(faceDir * 1, -4 + bob);
    ctx.lineTo(faceDir * 13, -1 + bob - stride * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 5.2; ctx.stroke();
    ctx.strokeStyle = bodyCol; ctx.lineWidth = 3.6; ctx.stroke();

    // Head + Glowing Eyes
    ctx.beginPath(); ctx.arc(faceDir * 4, -17 + bob, 8.2, 0, Math.PI * 2);
    ctx.fillStyle = bodyCol; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = 1.3; ctx.stroke();

    ctx.fillStyle = z.kind === 2 ? '#fef08a' : '#fde047';
    ctx.beginPath(); ctx.arc(faceDir * 6.5, -18 + bob, 2.0, 0, Math.PI * 2); ctx.fill();

    // Brute HP Bar
    if (z.hp < z.maxHp || z.kind === 2) {
      const bw = z.kind === 2 ? 32 : 22;
      const ratio = Math.max(0, Math.min(1, z.hp / z.maxHp));
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(-bw / 2, -31 + bob, bw, 3.5);
      ctx.fillStyle = z.kind === 2 ? '#c084fc' : '#4ade80';
      ctx.fillRect(-bw / 2, -31 + bob, bw * ratio, 3.5);
    }
    ctx.restore();
  }

  private drawPickups(ctx: CanvasRenderingContext2D) {
    const now = Date.now() * 0.006;
    for (const c of this.coins) {
      const pulse = 1 + Math.sin(now + c.x) * 0.1;
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.scale(pulse, pulse);
      const col =
        c.kind === 'medkit' ? '#4ade80' :
        c.kind === 'shotgun' ? '#fbbf24' :
        c.kind === 'paintbomb' ? '#f472b6' :
        '#38bdf8';
      ctx.shadowColor = col;
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#09090b';
      roundRectPath(ctx, -12, -12, 24, 24, 6);
      ctx.fill();
      ctx.strokeStyle = col;
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = col;
      ctx.font = '800 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label =
        c.kind === 'medkit' ? '+' :
        c.kind === 'shotgun' ? '3X' :
        c.kind === 'rapid' ? '⚡' :
        c.kind === 'paintbomb' ? '★' :
        '◈';
      ctx.fillText(label, 0, 0.5);
      ctx.restore();
    }
  }

  private drawPillars(ctx: CanvasRenderingContext2D, accent: string, style: 'tomb' | 'cover') {
    for (const pil of this.pillars) {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      roundRectPath(ctx, pil.x + 3, pil.y + 5, pil.w, pil.h, 6);
      ctx.fill();

      const pg = ctx.createLinearGradient(pil.x, pil.y, pil.x, pil.y + pil.h);
      pg.addColorStop(0, '#3f3f46');
      pg.addColorStop(1, '#18181b');
      ctx.fillStyle = pg;
      roundRectPath(ctx, pil.x, pil.y, pil.w, pil.h, 6);
      ctx.fill();

      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.stroke();

      if (style === 'tomb') {
        ctx.strokeStyle = 'rgba(74,222,128,0.28)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pil.x + pil.w / 2, pil.y + 10);
        ctx.lineTo(pil.x + pil.w / 2, pil.y + pil.h - 10);
        ctx.moveTo(pil.x + 12, pil.y + pil.h * 0.42);
        ctx.lineTo(pil.x + pil.w - 12, pil.y + pil.h * 0.42);
        ctx.stroke();
      } else {
        ctx.fillStyle = accent;
        ctx.fillRect(pil.x + 4, pil.y + 4, pil.w - 8, 4);
      }
      ctx.restore();
    }
  }

  private drawMap(ctx: CanvasRenderingContext2D) {
    const cw = this.cw;
    const ch = this.ch;
    const nowT = Date.now() * 0.002;

    if (this.currentMinigame === 'zombie') {
      const g = ctx.createRadialGradient(cw / 2, ch / 2, 30, cw / 2, ch / 2, Math.max(cw, ch) * 0.72);
      g.addColorStop(0, '#102415');
      g.addColorStop(0.6, '#0a120d');
      g.addColorStop(1, '#050706');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);

      // Subtle bunker floor grid
      ctx.strokeStyle = 'rgba(74,222,128,0.06)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < cw; gx += 48) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, ch); ctx.stroke(); }
      for (let gy = 0; gy < ch; gy += 48) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(cw, gy); ctx.stroke(); }

      // 4 Toxic Spawn Gates on perimeter
      ctx.fillStyle = 'rgba(74,222,128,0.24)';
      ctx.fillRect(cw * 0.35, 44, cw * 0.3, 6);
      ctx.fillRect(cw * 0.35, ch - 8, cw * 0.3, 6);
      ctx.fillRect(4, ch * 0.35, 6, ch * 0.3);
      ctx.fillRect(cw - 10, ch * 0.35, 6, ch * 0.3);

      this.drawPillars(ctx, 'rgba(74,222,128,0.55)', 'tomb');
      this.drawPickups(ctx);
      this.drawMiniHeader(ctx, `DALĞA ${this.zombieWave} · ${Math.max(0, Math.ceil(this.gameTimer / 60))}s`, this.gameTimer / (this.gameTimerMax || 1));
    } else if (this.currentMinigame === 'samurai') {
      const g = ctx.createLinearGradient(0, 0, 0, ch);
      g.addColorStop(0, '#190d1e');
      g.addColorStop(0.5, '#26141a');
      g.addColorStop(1, '#120a0d');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);

      // Crimson Dojo Moon Backdrop
      const moonG = ctx.createRadialGradient(cw / 2, ch * 0.48, 20, cw / 2, ch * 0.48, 175);
      moonG.addColorStop(0, 'rgba(251,113,133,0.18)');
      moonG.addColorStop(0.6, 'rgba(244,63,94,0.08)');
      moonG.addColorStop(1, 'transparent');
      ctx.fillStyle = moonG;
      ctx.beginPath(); ctx.arc(cw / 2, ch * 0.48, 175, 0, Math.PI * 2); ctx.fill();

      // Wood deck planks
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      for (let py = 54; py < ch; py += 36) {
        ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(cw, py); ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(251,113,133,0.22)';
      ctx.lineWidth = 3;
      ctx.strokeRect(10, 48, cw - 20, ch - 58);

      // Sakura Petals
      ctx.fillStyle = 'rgba(249,168,212,0.55)';
      for (const sk of this.sakuraPetals) {
        ctx.beginPath(); ctx.ellipse(sk.x, sk.y, sk.r, sk.r * 0.55, sk.x * 0.04, 0, Math.PI * 2); ctx.fill();
      }
      this.drawMiniHeader(ctx, 'SAMURAY DUELLOSU');
    } else if (this.currentMinigame === 'sniper') {
      const g = ctx.createRadialGradient(cw / 2, ch / 2, 40, cw / 2, ch / 2, Math.max(cw, ch) * 0.72);
      g.addColorStop(0, '#111827');
      g.addColorStop(1, '#07090f');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);

      ctx.strokeStyle = 'rgba(148,163,184,0.07)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < cw; gx += 48) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, ch); ctx.stroke(); }
      for (let gy = 0; gy < ch; gy += 48) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(cw, gy); ctx.stroke(); }

      this.drawPillars(ctx, '#64748b', 'cover');

      // Live Sniper Targeting Laser Sights!
      for (const p of this.players) {
        if (!p.alive) continue;
        const startX = p.x + Math.cos(p.angle) * 20;
        const startY = p.y - 6 + Math.sin(p.angle) * 20;
        const endPt = this.raycastPoint(startX, startY, p.angle, 920);
        ctx.save();
        ctx.strokeStyle = `${p.color}66`;
        ctx.lineWidth = 1.4;
        ctx.setLineDash([6, 5]);
        ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(endPt.x, endPt.y); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(endPt.x, endPt.y, 3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      this.drawMiniHeader(ctx, 'SNAYPER DUELLOSU');
    } else if (this.currentMinigame === 'blades') {
      const g = ctx.createRadialGradient(cw / 2, ch / 2, 30, cw / 2, ch / 2, Math.max(cw, ch) * 0.7);
      g.addColorStop(0, '#221417');
      g.addColorStop(1, '#09090b');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);

      ctx.strokeStyle = 'rgba(249,115,22,0.28)';
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 48, cw - 20, ch - 58);

      // Draw Spinning Buzzsaws
      for (const s of this.saws) {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rot);
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 16;
        ctx.fillStyle = '#e4e4e7';
        ctx.beginPath();
        const teeth = 14;
        for (let t = 0; t < teeth; t++) {
          const a1 = (t / teeth) * Math.PI * 2;
          const a2 = ((t + 0.5) / teeth) * Math.PI * 2;
          if (t === 0) ctx.moveTo(Math.cos(a1) * (s.r + 5), Math.sin(a1) * (s.r + 5));
          else ctx.lineTo(Math.cos(a1) * (s.r + 5), Math.sin(a1) * (s.r + 5));
          ctx.lineTo(Math.cos(a2) * (s.r - 4), Math.sin(a2) * (s.r - 4));
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(0, 0, s.r * 0.36, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#18181b';
        ctx.beginPath(); ctx.arc(0, 0, s.r * 0.16, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      this.drawMiniHeader(ctx, 'MİŞAR ARENASI');
    } else if (this.currentMinigame === 'sumo') {
      const cx = cw / 2;
      const cy = ch / 2;
      const maxR = Math.min(cw, ch) * 0.37;
      const r = maxR * this.ringScale;
      const g = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, Math.max(cw, ch) * 0.78);
      g.addColorStop(0, '#2a1d12');
      g.addColorStop(0.55, '#130f12');
      g.addColorStop(1, '#09090b');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);

      for (const [lx, ly] of [[42, 48], [cw - 42, 48], [42, ch - 36], [cw - 42, ch - 36]]) {
        const lg = ctx.createRadialGradient(lx, ly, 2, lx, ly, 65);
        lg.addColorStop(0, 'rgba(251,146,60,0.28)');
        lg.addColorStop(1, 'transparent');
        ctx.fillStyle = lg;
        ctx.beginPath(); ctx.arc(lx, ly, 65, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fb923c';
        ctx.beginPath(); ctx.arc(lx, ly, 5, 0, Math.PI * 2); ctx.fill();
      }

      if (this.ringScale < 0.99) {
        ctx.strokeStyle = 'rgba(239,68,68,0.22)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.beginPath(); ctx.arc(cx, cy, maxR, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.fillStyle = '#1c1510';
      ctx.beginPath(); ctx.arc(cx, cy + 8, r + 14, 0, Math.PI * 2); ctx.fill();

      ctx.save();
      ctx.shadowColor = this.ringScale < 0.7 ? '#ef4444' : '#f59e0b';
      ctx.shadowBlur = 30;
      const rg = ctx.createRadialGradient(cx, cy - r * 0.2, r * 0.1, cx, cy, r);
      rg.addColorStop(0, '#6a4b29');
      rg.addColorStop(0.75, '#422c17');
      rg.addColorStop(1, '#26180c');
      ctx.fillStyle = rg;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.25, cy); ctx.lineTo(cx + r * 0.25, cy);
      ctx.moveTo(cx, cy - r * 0.25); ctx.lineTo(cx, cy + r * 0.25);
      ctx.stroke();

      ctx.strokeStyle = this.ringScale < 0.7 ? '#ef4444' : '#fbbf24';
      ctx.lineWidth = 6;
      ctx.setLineDash([16, 9]);
      ctx.lineDashOffset = -nowT * 14;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
    } else if (this.currentMinigame === 'futbol') {
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, cw, ch);
      const g = ctx.createLinearGradient(0, 44, 0, ch);
      g.addColorStop(0, '#166534');
      g.addColorStop(0.5, '#15803d');
      g.addColorStop(1, '#0c4321');
      ctx.fillStyle = g;
      ctx.fillRect(0, 44, cw, ch - 44);
      ctx.fillStyle = 'rgba(255,255,255,0.045)';
      for (let x = 0; x < cw; x += 80) ctx.fillRect(x, 44, 40, ch - 44);

      const vig = ctx.createRadialGradient(cw / 2, (ch + 44) / 2, cw * 0.15, cw / 2, (ch + 44) / 2, cw * 0.65);
      vig.addColorStop(0, 'rgba(255,255,255,0.06)');
      vig.addColorStop(1, 'rgba(0,0,0,0.4)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 44, cw, ch - 44);

      const top = 52;
      const bot = ch - 8;
      const midY = (top + bot) / 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.48)';
      ctx.lineWidth = 2;
      ctx.strokeRect(12, top, cw - 24, bot - top);
      ctx.beginPath(); ctx.moveTo(cw / 2, top); ctx.lineTo(cw / 2, bot); ctx.stroke();
      ctx.beginPath(); ctx.arc(cw / 2, midY, 58, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath(); ctx.arc(cw / 2, midY, 4, 0, Math.PI * 2); ctx.fill();

      // Corner bumpers visual arcs
      ctx.fillStyle = 'rgba(251,191,36,0.22)';
      for (const [cx, cy] of [[18, 52], [cw - 18, 52], [18, ch - 10], [cw - 18, ch - 10]]) {
        ctx.beginPath(); ctx.arc(cx, cy, 26, 0, Math.PI * 2); ctx.fill();
      }

      ctx.strokeRect(12, midY - (bot - top) * 0.28, 72, (bot - top) * 0.56);
      ctx.strokeRect(cw - 84, midY - (bot - top) * 0.28, 72, (bot - top) * 0.56);

      const goalH = ch * 0.34;
      const goalTop = (ch + 44) / 2 - goalH / 2;
      for (const side of [0, 1]) {
        const gx = side ? cw - 20 : 0;
        const col = side ? '#ef4444' : '#3b82f6';
        ctx.fillStyle = side ? 'rgba(239,68,68,0.28)' : 'rgba(59,130,246,0.28)';
        ctx.fillRect(gx, goalTop, 20, goalH);
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 1;
        for (let ny = goalTop + 10; ny < goalTop + goalH; ny += 12) {
          ctx.beginPath(); ctx.moveTo(gx, ny); ctx.lineTo(gx + 20, ny); ctx.stroke();
        }
        ctx.strokeStyle = col;
        ctx.lineWidth = 3.5;
        ctx.strokeRect(gx, goalTop, 20, goalH);
      }

      const s1 = this.players[0]?.score || 0;
      const s2 = this.players[1]?.score || 0;
      this.drawMiniHeader(ctx, `${s1}  :  ${s2}`);

      if (this.ball) {
        const b = this.ball;
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath(); ctx.ellipse(b.x, b.y + b.radius + 3, b.radius * 0.95, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#18181b'; ctx.lineWidth = 1.4; ctx.stroke();
        ctx.translate(b.x, b.y);
        ctx.rotate((b.x + b.y) * 0.05);
        ctx.fillStyle = '#18181b';
        ctx.beginPath(); ctx.arc(0, 0, b.radius * 0.36, 0, Math.PI * 2); ctx.fill();
        for (let k = 0; k < 5; k++) {
          const a = (k * Math.PI * 2) / 5;
          ctx.beginPath();
          ctx.arc(Math.cos(a) * b.radius * 0.72, Math.sin(a) * b.radius * 0.72, 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    } else if (this.currentMinigame === 'race') {
      const groundY = ch - 26;
      const g = ctx.createLinearGradient(0, 0, 0, ch);
      g.addColorStop(0, '#070a14');
      g.addColorStop(0.5, '#131830');
      g.addColorStop(0.86, '#1f2342');
      g.addColorStop(1, '#12131c');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);

      const moonX = cw * 0.82 - (this.raceOffset * 0.04) % (cw * 0.3);
      const moonHalo = ctx.createRadialGradient(moonX, 82, 8, moonX, 82, 110);
      moonHalo.addColorStop(0, 'rgba(186,230,253,0.28)');
      moonHalo.addColorStop(0.5, 'rgba(99,102,241,0.10)');
      moonHalo.addColorStop(1, 'transparent');
      ctx.fillStyle = moonHalo;
      ctx.beginPath(); ctx.arc(moonX, 82, 110, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath(); ctx.arc(moonX, 82, 20, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      for (let s = 0; s < 32; s++) {
        const sx = ((s * 173 - this.raceOffset * 0.06) % cw + cw) % cw;
        const sy = 24 + ((s * 67) % Math.max(60, ch * 0.48));
        ctx.fillRect(sx, sy, (s % 2) + 1, (s % 2) + 1);
      }

      const farShift = (this.raceOffset * 0.14) % 140;
      ctx.fillStyle = '#0e1324';
      for (let bx = -farShift; bx < cw + 140; bx += 70) {
        const idx = Math.abs(Math.round((bx + this.raceOffset * 0.14) / 70));
        const bh = 80 + ((idx * 53) % 110);
        ctx.fillRect(bx, groundY - bh, 56, bh);
      }

      const nearShift = (this.raceOffset * 0.32) % 180;
      for (let bx = -nearShift; bx < cw + 180; bx += 90) {
        const idx = Math.abs(Math.round((bx + this.raceOffset * 0.32) / 90));
        const bh = 55 + ((idx * 37) % 95);
        const by = groundY - bh;
        ctx.fillStyle = '#15192e';
        ctx.fillRect(bx, by, 64, bh);
        ctx.fillStyle = idx % 2 === 0 ? 'rgba(56,189,248,0.22)' : 'rgba(251,191,36,0.22)';
        ctx.fillRect(bx + 6, by + 10, 10, 6);
        ctx.fillRect(bx + 26, by + 10, 10, 6);
        ctx.fillRect(bx + 46, by + 10, 10, 6);
        ctx.fillRect(bx + 16, by + 28, 10, 6);
        ctx.fillRect(bx + 36, by + 28, 10, 6);
        ctx.fillStyle = idx % 2 === 0 ? '#38bdf8' : '#f59e0b';
        ctx.fillRect(bx + 28, by - 12, 2, 12);
      }

      const trackGrad = ctx.createLinearGradient(0, groundY, 0, ch);
      trackGrad.addColorStop(0, '#272732');
      trackGrad.addColorStop(1, '#121218');
      ctx.fillStyle = trackGrad;
      ctx.fillRect(0, groundY, cw, ch - groundY);

      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(0, groundY, cw, 3);
      ctx.strokeStyle = 'rgba(255,255,255,0.34)';
      ctx.lineWidth = 2;
      ctx.setLineDash([22, 16]);
      ctx.lineDashOffset = this.raceOffset;
      ctx.beginPath(); ctx.moveTo(0, groundY + 14); ctx.lineTo(cw, groundY + 14); ctx.stroke();
      ctx.setLineDash([]);

      for (const obs of this.raceObstacles) {
        const sx = obs.x - this.raceOffset;
        if (sx < -120 || sx > cw + 80) continue;

        if (obs.kind === 'spring') {
          ctx.fillStyle = '#14532d';
          roundRectPath(ctx, sx, obs.y + 5, obs.w, obs.h - 5, 3);
          ctx.fill();
          ctx.fillStyle = '#4ade80';
          ctx.shadowColor = '#4ade80';
          ctx.shadowBlur = 10;
          roundRectPath(ctx, sx + 2, obs.y, obs.w - 4, 6, 3);
          ctx.fill();
          ctx.shadowBlur = 0;
          continue;
        }

        if (obs.kind === 'boost') {
          ctx.save();
          ctx.fillStyle = 'rgba(56,189,248,0.28)';
          roundRectPath(ctx, sx, obs.y, obs.w, obs.h, 3);
          ctx.fill();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
          continue;
        }

        if (obs.kind === 'platform') {
          const pg = ctx.createLinearGradient(sx, obs.y, sx, obs.y + obs.h);
          pg.addColorStop(0, '#3f3f46');
          pg.addColorStop(1, '#18181b');
          ctx.fillStyle = pg;
          roundRectPath(ctx, sx, obs.y, obs.w, obs.h, 5);
          ctx.fill();
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(sx + 4, obs.y, obs.w - 8, 3);
          continue;
        }

        const isWall = obs.kind === 'wall';
        const cg = ctx.createLinearGradient(sx, obs.y, sx + obs.w, obs.y + obs.h);
        cg.addColorStop(0, isWall ? '#3f3f46' : '#32323c');
        cg.addColorStop(1, '#141418');
        ctx.fillStyle = cg;
        roundRectPath(ctx, sx, obs.y, obs.w, obs.h, 4);
        ctx.fill();
        ctx.fillStyle = isWall ? '#ef4444' : '#f59e0b';
        ctx.fillRect(sx + 2, obs.y + 2, obs.w - 4, 6);
        ctx.strokeStyle = isWall ? 'rgba(248,113,113,0.7)' : 'rgba(251,191,36,0.7)';
        ctx.lineWidth = 1.6;
        roundRectPath(ctx, sx, obs.y, obs.w, obs.h, 4);
        ctx.stroke();
      }

      const fsx = this.raceFinishX - this.raceOffset;
      if (fsx > -40 && fsx < cw + 40) {
        ctx.fillStyle = 'rgba(74,222,128,0.12)';
        ctx.fillRect(fsx - 4, 48, 22, groundY - 48);
        for (let y = 52; y < groundY; y += 12) {
          const even = Math.floor((y - 52) / 12) % 2 === 0;
          ctx.fillStyle = even ? '#ffffff' : '#111116';
          ctx.fillRect(fsx, y, 7, 12);
          ctx.fillStyle = even ? '#111116' : '#ffffff';
          ctx.fillRect(fsx + 7, y, 7, 12);
        }
        ctx.fillStyle = '#4ade80';
        ctx.font = '800 20px "Barlow Condensed", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('FİNİŞ', fsx + 7, 42);
      }

      for (const p of this.players) {
        if (!p.alive) continue;
        const prog = Math.max(0, Math.min(1, p.raceX / (this.raceFinishX || 1)));
        const y = 44 + p.index * 10;
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        roundRectPath(ctx, 24, y, cw - 48, 5, 2.5);
        ctx.fill();
        ctx.fillStyle = p.color;
        roundRectPath(ctx, 24, y, Math.max(8, (cw - 48) * prog), 5, 2.5);
        ctx.fill();
      }
    } else if (this.currentMinigame === 'bomb') {
      const g = ctx.createRadialGradient(cw / 2, ch / 2, 40, cw / 2, ch / 2, Math.max(cw, ch) * 0.75);
      g.addColorStop(0, '#261215');
      g.addColorStop(1, '#09090b');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);

      ctx.strokeStyle = 'rgba(249,115,22,0.16)';
      ctx.lineWidth = 6;
      ctx.strokeRect(12, 48, cw - 24, ch - 60);
      this.drawPillars(ctx, '#f97316', 'cover');

      if (this.ball) {
        const b = this.ball;
        if (b.fuse < 120) {
          ctx.fillStyle = `rgba(239,68,68,${0.1 + 0.06 * Math.sin(nowT * 12)})`;
          ctx.fillRect(0, 0, cw, ch);
        }
        ctx.strokeStyle = 'rgba(239,68,68,0.22)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.beginPath(); ctx.arc(b.x, b.y, 92, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);

        ctx.save();
        ctx.shadowColor = b.fuse < 120 ? '#ef4444' : '#f97316';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#18181b';
        ctx.beginPath(); ctx.arc(b.x, b.y, 13, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        ctx.strokeStyle = b.fuse < 120 ? '#ef4444' : '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 19, -Math.PI / 2, -Math.PI / 2 + Math.max(0, b.fuse / 360) * Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.max(0, Math.ceil(b.fuse / 60))}s`, b.x, b.y - 26);
      }
    } else if (this.currentMinigame === 'laser') {
      const g = ctx.createRadialGradient(cw / 2, ch / 2, 30, cw / 2, ch / 2, cw * 0.65);
      g.addColorStop(0, '#111827');
      g.addColorStop(1, '#09090b');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);

      ctx.strokeStyle = 'rgba(56,189,248,0.07)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < cw; gx += 48) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, ch); ctx.stroke(); }
      for (let gy = 0; gy < ch; gy += 48) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(cw, gy); ctx.stroke(); }

      this.drawPickups(ctx);

      for (const b of this.beams) {
        ctx.save();
        if (b.warn > 0) {
          const blink = b.warn < 18 ? (Math.floor(b.warn / 3) % 2 === 0 ? 0.85 : 0.25) : 0.45;
          ctx.strokeStyle = `rgba(251,191,36,${blink})`;
          ctx.lineWidth = 2.5;
          ctx.setLineDash([10, 8]);
          ctx.beginPath(); ctx.moveTo(b.x1, b.y1); ctx.lineTo(b.x2, b.y2); ctx.stroke();
          ctx.setLineDash([]);
        } else {
          ctx.shadowColor = b.color;
          ctx.shadowBlur = 22;
          ctx.strokeStyle = b.color;
          ctx.lineWidth = b.width * 1.45;
          ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(b.x1, b.y1); ctx.lineTo(b.x2, b.y2); ctx.stroke();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = b.width * 0.5;
          ctx.beginPath(); ctx.moveTo(b.x1, b.y1); ctx.lineTo(b.x2, b.y2); ctx.stroke();
        }
        ctx.restore();
      }
      this.drawMiniHeader(ctx, `${Math.max(0, Math.ceil(this.gameTimer / 60))}s`, this.gameTimer / (this.gameTimerMax || 1));
    } else if (this.currentMinigame === 'lava') {
      const g = ctx.createLinearGradient(0, 0, 0, ch);
      g.addColorStop(0, '#09090b');
      g.addColorStop(0.55, '#1d0d0d');
      g.addColorStop(1, '#45120c');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);

      ctx.save();
      ctx.translate(0, -this.lavaCamY);

      const startGrid = Math.floor((this.lavaCamY - 50) / 200) * 200;
      const endGrid = this.lavaCamY + ch + 50;
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      for (let gy = startGrid; gy <= endGrid; gy += 200) {
        const meters = Math.round((ch - gy) / 10);
        if (meters <= 0) continue;
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(cw, gy); ctx.stroke();
        ctx.fillText(`${meters}m`, 14, gy - 5);
      }

      for (const pl of this.plats) {
        ctx.fillStyle = pl.kind === 'spring' ? '#14532d' : '#27272a';
        roundRectPath(ctx, pl.x, pl.y, pl.w, 13, 4);
        ctx.fill();
        ctx.fillStyle = pl.kind === 'spring' ? '#4ade80' : pl.dx !== 0 ? '#f59e0b' : '#71717a';
        roundRectPath(ctx, pl.x + 2, pl.y, pl.w - 4, 4, 2);
        ctx.fill();
      }

      if (this.lavaY < this.lavaCamY + ch + 80) {
        const lg = ctx.createLinearGradient(0, this.lavaY - 6, 0, this.lavaY + ch);
        lg.addColorStop(0, '#fde047');
        lg.addColorStop(0.22, '#f97316');
        lg.addColorStop(1, '#7c2d12');
        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.moveTo(0, this.lavaCamY + ch + 100);
        ctx.lineTo(0, this.lavaY);
        for (let lx = 0; lx <= cw; lx += 24) {
          ctx.lineTo(lx, this.lavaY + Math.sin(lx * 0.04 + nowT * 3) * 4);
        }
        ctx.lineTo(cw, this.lavaCamY + ch + 100);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      const climbM = Math.max(0, Math.round(-this.lavaCamY / 10));
      this.drawMiniHeader(ctx, `${climbM} m`);
    } else if (this.currentMinigame === 'tiles') {
      const g = ctx.createRadialGradient(cw / 2, ch / 2, 40, cw / 2, ch / 2, cw * 0.7);
      g.addColorStop(0, '#141724');
      g.addColorStop(1, '#070709');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);

      const deck = this.getGridBounds();
      for (let r = 0; r < this.tileRows; r++) {
        for (let c = 0; c < this.tileCols; c++) {
          const st = this.tiles[r * this.tileCols + c] ?? 0;
          if (st >= 55) continue;
          const tx = deck.x + c * deck.cw + 3;
          const ty = deck.y + r * deck.ch + 3;
          const tw = deck.cw - 6;
          const th = deck.ch - 6;
          let fill = '#27272a';
          let stroke = '#52525b';
          if (st > 34) {
            fill = '#7f1d1d';
            stroke = '#ef4444';
          } else if (st > 0) {
            fill = '#78350f';
            stroke = '#f59e0b';
          }
          ctx.fillStyle = fill;
          roundRectPath(ctx, tx, ty, tw, th, 6);
          ctx.fill();
          ctx.strokeStyle = stroke;
          ctx.lineWidth = 2;
          ctx.stroke();

          if (st > 0) {
            ctx.strokeStyle = 'rgba(255,255,255,0.45)';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(tx + tw * 0.25, ty + th * 0.25);
            ctx.lineTo(tx + tw * 0.55, ty + th * 0.52);
            ctx.lineTo(tx + tw * 0.75, ty + th * 0.78);
            ctx.stroke();
          }
        }
      }
      this.drawMiniHeader(ctx, `${Math.max(0, Math.ceil(this.gameTimer / 60))}s`, this.gameTimer / (this.gameTimerMax || 1));
    } else if (this.currentMinigame === 'paint') {
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, cw, ch);
      const deck = this.getGridBounds();
      ctx.fillStyle = '#18181b';
      roundRectPath(ctx, deck.x - 4, deck.y - 4, deck.w + 8, deck.h + 8, 8);
      ctx.fill();

      for (let r = 0; r < this.tileRows; r++) {
        for (let c = 0; c < this.tileCols; c++) {
          const owner = this.tiles[r * this.tileCols + c] ?? -1;
          const tx = deck.x + c * deck.cw + 2;
          const ty = deck.y + r * deck.ch + 2;
          const tw = deck.cw - 4;
          const th = deck.ch - 4;
          ctx.fillStyle = owner >= 0 ? (PLAYER_COLORS[owner] || '#3b82f6') : '#27272a';
          roundRectPath(ctx, tx, ty, tw, th, 5);
          ctx.fill();
          if (owner >= 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.16)';
            roundRectPath(ctx, tx + 2, ty + 2, tw - 4, 4, 2);
            ctx.fill();
          }
        }
      }
      this.drawPickups(ctx);

      // Live territory bar across top
      const totalTiles = Math.max(1, this.tileCols * this.tileRows);
      const barW = Math.min(340, cw * 0.42);
      let bx = cw / 2 - barW / 2;
      ctx.fillStyle = '#18181b';
      ctx.fillRect(bx, 48, barW, 6);
      for (const p of this.players) {
        const w = (p.coins / totalTiles) * barW;
        ctx.fillStyle = p.color;
        ctx.fillRect(bx, 48, w, 6);
        bx += w;
      }

      this.drawMiniHeader(ctx, `${Math.max(0, Math.ceil(this.gameTimer / 60))}s`, this.gameTimer / (this.gameTimerMax || 1));
    }
  }

  private updateMiniSprings(p: MiniPlayer, sideView: boolean) {
    const dvx = p.vx - (p.prevVx ?? p.vx);
    const dvy = p.vy - (p.prevVy ?? p.vy);
    p.prevVx = p.vx;
    p.prevVy = p.vy;
    if (p.sq > 0) p.sq--;

    const spd = Math.hypot(p.vx, p.vy);
    const moving = spd > 0.35;
    p.phase += (sideView ? Math.abs(p.vx) : spd) * 0.165;

    const air = sideView && !p.onGround;
    const targetLean = Math.max(-7.5, Math.min(7.5, p.vx * 1.15));
    p.leanVx = (p.leanVx + (targetLean - p.leanX) * 0.25 - dvx * 0.78) * 0.75;
    p.leanX = Math.max(-11, Math.min(11, p.leanX + p.leanVx));

    const targetHeadX = p.leanX * 1.18;
    p.headVx = (p.headVx + (targetHeadX - p.headX) * 0.21 - dvx * 0.95) * 0.73;
    p.headX = Math.max(-14, Math.min(14, p.headX + p.headVx));

    const targetHeadY = air
      ? Math.max(-4, Math.min(4.8, -p.vy * 0.32))
      : moving
      ? -Math.abs(Math.cos(p.phase)) * 2.8
      : 0;
    p.headVy = (p.headVy + (targetHeadY - p.headY) * 0.26 - dvy * 0.5) * 0.72;
    p.headY = Math.max(-8, Math.min(9, p.headY + p.headVy));

    const targetTilt = air
      ? Math.max(-0.42, Math.min(0.42, p.vx * 0.05))
      : Math.max(-0.22, Math.min(0.22, p.vx * 0.035));
    p.tiltV = (p.tiltV + (targetTilt - p.tilt) * 0.22 + dvx * 0.02) * 0.78;
    p.tilt = Math.max(-0.56, Math.min(0.56, p.tilt + p.tiltV));
  }

  private drawStickman(ctx: CanvasRenderingContext2D, p: MiniPlayer) {
    ctx.save();
    const hopOffset = this.currentMinigame === 'tiles' ? p.zHop || 0 : 0;
    ctx.translate(p.x, p.y);

    // Ground drop shadow (scales smaller when hopping in Tiles)
    const shScale = Math.max(0.45, 1 - hopOffset * 0.015);
    ctx.fillStyle = 'rgba(0,0,0,0.44)';
    ctx.beginPath();
    ctx.ellipse(0, 22, 11 * shScale, 3.5 * shScale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(0, -hopOffset);

    const speed = Math.hypot(p.vx, p.vy);
    const moving = speed > 0.4;
    const speedRatio = Math.min(1, speed / 3.4);
    const walkPhase = typeof p.phase === 'number' ? p.phase : Date.now() * 0.014 + p.index * 1.3;
    const stride = moving ? Math.sin(walkPhase) * speedRatio : 0;
    const bob = moving
      ? -Math.abs(Math.cos(walkPhase)) * 3.1 * speedRatio
      : Math.sin(Date.now() * 0.0045 + p.index) * 0.65;
    const faceDir = Math.cos(p.angle) >= 0 ? 1 : -1;
    const lean = typeof p.leanX === 'number' ? p.leanX : moving ? Math.max(-4, Math.min(4, p.vx * 0.7)) : 0;
    const headSpringX = typeof p.headX === 'number' ? p.headX : lean * 1.15;
    const headSpringY = typeof p.headY === 'number' ? p.headY : 0;
    const tilt = typeof p.tilt === 'number' ? p.tilt : 0;
    const sqz = (p.sq || 0) * 0.022;
    const look = PartyEconomy.look(p.index);
    const holdingBomb = this.currentMinigame === 'bomb' && this.ball?.holder === p.index;

    if (p.shield) {
      ctx.save();
      ctx.strokeStyle = 'rgba(56,189,248,0.85)';
      ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }

    if (p.isAttacking) {
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 18;
    }
    if (p.trail.length > 0) {
      ctx.globalAlpha = 0.2;
      for (const tr of p.trail) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(tr.x - p.x, tr.y - p.y, 9, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    ctx.save();
    ctx.translate(0, 22);
    ctx.scale(1 + sqz, 1 - sqz);
    ctx.translate(0, -22);
    ctx.translate(0, 7);
    ctx.rotate(tilt * 0.72);
    ctx.translate(0, -7);

    if (look.accessory?.kind === 'wings') {
      PartyEconomy.drawAccessory(ctx, 'wings', lean * 0.5, -5 + bob, 0.95, faceDir);
    }

    ctx.fillStyle = 'rgba(255,255,255,0.58)';
    ctx.beginPath();
    ctx.arc(Math.cos(p.angle) * 26, Math.sin(p.angle) * 26, 2.4, 0, Math.PI * 2);
    ctx.fill();

    const isClassicOutfit = !look.outfit || look.outfit.id === 'classic' || look.outfit.id === 'default';

    const drawArmAndHand = (
      sx: number,
      sy: number,
      ex: number,
      ey: number,
      hx: number,
      hy: number,
      withBracelet: boolean
    ) => {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.lineTo(hx, hy);
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 6.5;
      ctx.stroke();
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 4.7;
      ctx.stroke();

      if (!isClassicOutfit) {
        PartyEconomy.drawFittedSleeve(ctx, look.outfit, sx, sy, ex, ey, 4.7);
      }

      if (withBracelet && look.accessory?.kind === 'bracelet') {
        PartyEconomy.drawAccessory(ctx, 'bracelet', hx, hy - 1, 0.85, faceDir);
      }

      ctx.fillStyle = p.color;
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(hx, hy, 3.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };

    const shY = -8.5 + bob + headSpringY * 0.3;
    const isSidePlatformer = this.currentMinigame === 'race' || this.currentMinigame === 'lava';
    if (holdingBomb) {
      drawArmAndHand(-2.5 * faceDir + lean, shY, -9 * faceDir, -18 + bob, -6 * faceDir, -28 + bob, false);
    } else if (!p.onGround && isSidePlatformer) {
      const airWave = Math.sin(Date.now() * 0.02 + p.index) * 3.5;
      drawArmAndHand(-2.5 * faceDir + lean, shY, -9 * faceDir, shY - 5 + airWave * 0.5, -12 * faceDir, shY - 11 + airWave, false);
    } else {
      const bSwing = stride * 10.5;
      drawArmAndHand(-2 * faceDir + lean, shY, -6 * faceDir - bSwing * 0.45, shY + 6, -5 * faceDir - bSwing, shY + 12, false);
    }

    const legSwing = stride * 10.8;
    const airFlail = !p.onGround && isSidePlatformer ? Math.sin(Date.now() * 0.024 + p.index) * 4.5 : 0;
    const legs: { kx: number; ky: number }[] = [];
    for (const [hipOff, fx, lift] of [
      [-1.5, -4.5 + legSwing + airFlail, Math.max(0, Math.cos(walkPhase)) * 6.5 * speedRatio],
      [1.5, 4.5 - legSwing - airFlail, Math.max(0, Math.cos(walkPhase + Math.PI)) * 6.5 * speedRatio],
    ] as [number, number, number][]) {
      const fy = 21.5 - (moving ? lift : 0);
      const kx = (hipOff + fx) * 0.5 + faceDir * 2.8;
      const ky = 14 + bob * 0.4 - (moving ? lift * 0.55 : 0);
      legs.push({ kx, ky });
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(hipOff, 7 + bob);
      ctx.lineTo(kx, ky);
      ctx.lineTo(fx, fy);
      ctx.lineTo(fx + faceDir * 3.8, fy + 0.4);
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 6.8;
      ctx.stroke();
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 4.9;
      ctx.stroke();
    }
    if (!isClassicOutfit && legs.length === 2) {
      PartyEconomy.drawFittedShorts(ctx, look.outfit, 0, 7 + bob, legs[0].kx, legs[0].ky, legs[1].kx, legs[1].ky, 4.9);
    }

    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 7.5 + bob);
    ctx.quadraticCurveTo(lean * 0.35, -1 + bob, lean, -10.5 + bob + headSpringY * 0.25);
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 8.0;
    ctx.stroke();
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 6.2;
    ctx.stroke();

    if (!isClassicOutfit) {
      PartyEconomy.drawOutfit(ctx, look.outfit, 0, 7.5 + bob, lean, -10.0 + bob + headSpringY * 0.25, 10.8);
    }

    if (look.accessory?.kind === 'scarf' || look.accessory?.kind === 'bowtie' || look.accessory?.kind === 'necklace') {
      PartyEconomy.drawAccessory(ctx, look.accessory.kind, lean, -11.5 + bob, 0.9, faceDir);
    }

    const headX = headSpringX;
    const headY = -20.0 + bob + headSpringY;
    const headR = 9.4;
    ctx.beginPath();
    ctx.arc(headX, headY, headR, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    PartyEconomy.drawHeadgear(ctx, look, headX, headY, 1, faceDir);

    const hasWeapon = this.currentMinigame === 'zombie' || this.currentMinigame === 'samurai' || this.currentMinigame === 'sniper';
    if (holdingBomb) {
      drawArmAndHand(2.5 * faceDir + lean, shY, 9 * faceDir, -18 + bob, 6 * faceDir, -28 + bob, true);
    } else if (hasWeapon || p.isAttacking) {
      const ax = Math.cos(p.angle);
      const ay = Math.sin(p.angle);
      const hx = 2.5 * faceDir + lean + ax * 16;
      const hy = shY + ay * 16;
      drawArmAndHand(2.5 * faceDir + lean, shY, 2.5 * faceDir + lean + ax * 8, shY + ay * 8, hx, hy, true);

      // Draw Mode Weapon in hand
      ctx.save();
      ctx.translate(hx, hy);
      ctx.rotate(p.angle);
      if (this.currentMinigame === 'samurai') {
        ctx.fillStyle = '#e4e4e7';
        ctx.fillRect(0, -2, 24, 3.6);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-2, -5, 3, 10);
      } else if (this.currentMinigame === 'sniper') {
        ctx.fillStyle = '#27272a';
        ctx.fillRect(-4, -3, 28, 5);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(4, -6, 10, 3);
      } else if (this.currentMinigame === 'zombie') {
        ctx.fillStyle = p.weap === 'shotgun' ? '#f59e0b' : p.weap === 'rapid' ? '#38bdf8' : '#71717a';
        ctx.fillRect(-2, -3.5, 16, 6);
      }
      ctx.restore();
    } else if (!p.onGround && isSidePlatformer) {
      const airWave = Math.cos(Date.now() * 0.02 + p.index) * 3.5;
      drawArmAndHand(2.5 * faceDir + lean, shY, 9 * faceDir, shY - 4 + airWave * 0.5, 12 * faceDir, shY - 9 + airWave, true);
    } else {
      const fSwing = -stride * 10.5;
      drawArmAndHand(2.5 * faceDir + lean, shY, 6 * faceDir - fSwing * 0.45, shY + 6, 6 * faceDir - fSwing, shY + 12, true);
    }
    ctx.restore();

    const ext = PartyEconomy.headTop(look, 10);
    const barY = headY - ext - 12;
    if (p.hp <= 100) {
      const ratio = Math.max(0, Math.min(1, p.hp / 100));
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(-16, barY, 32, 4);
      ctx.fillStyle = ratio > 0.4 ? '#4ade80' : '#f87171';
      ctx.fillRect(-16, barY, 32 * ratio, 4);
    }
    ctx.fillStyle = '#f4f4f5';
    ctx.font = '700 10px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(PLAYER_NAMES[p.index] || `P${p.index + 1}`, 0, barY - 5);

    ctx.restore();
  }

  private draw() {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const cw = this.cw;
    const ch = this.ch;
    const dpr = this.canvas.width / (cw || 1);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.save();
    ctx.translate(this.shakeX, this.shakeY);
    this.drawMap(ctx);

    if (this.currentMinigame === 'lava') {
      ctx.translate(0, -this.lavaCamY);
    }

    // Expanding shockwave rings
    for (const r of this.rings) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, r.life / r.maxLife);
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }

    // Samurai Katana Crescent Slashes
    for (const sl of this.slashes) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, sl.life / sl.maxLife);
      ctx.translate(sl.x, sl.y);
      ctx.rotate(sl.angle);
      ctx.shadowColor = sl.color;
      ctx.shadowBlur = 14;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(0, 0, sl.radius, -1.0, 1.0); ctx.stroke();
      ctx.strokeStyle = sl.color;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, sl.radius + 4, -0.95, 0.95); ctx.stroke();
      ctx.restore();
    }

    // Projectiles
    for (const pr of this.projectiles) {
      ctx.save();
      const col = pr.color || '#bae6fd';
      ctx.shadowColor = col;
      ctx.shadowBlur = 10;
      if (pr.kind === 'sniper') {
        ctx.strokeStyle = col;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(pr.x - pr.vx * 1.5, pr.y - pr.vy * 1.5);
        ctx.lineTo(pr.x, pr.y);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(pr.x, pr.y, 3.5, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, pr.radius || 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, (pr.radius || 5) * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Zombies
    if (this.currentMinigame === 'zombie') {
      for (const z of this.zombies) {
        this.drawZombie(ctx, z);
      }
    }

    for (const p of this.players) {
      if (!p.alive) continue;
      if (p.invincible > 0 && Math.floor(p.invincible / 3) % 2 === 0) continue;
      this.drawStickman(ctx, p);
    }

    for (const pt of this.particles) {
      const a = pt.life / pt.maxLife;
      ctx.globalAlpha = a;
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.radius * a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    for (const pp of this.popups) {
      ctx.globalAlpha = Math.min(1, pp.life / 18);
      ctx.fillStyle = pp.color;
      ctx.font = '800 16px "Barlow Condensed", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(pp.text, pp.x, pp.y);
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    ctx.fillStyle = 'rgba(244,244,245,0.55)';
    ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Raund ${this.currentRound}/${this.maxRounds}`, cw / 2, ch - 8);

    if (this.countdownActive) {
      const sec = Math.ceil(this.countdownTimer / 60);
      const text = sec > 0 ? String(sec) : 'BAŞLA!';
      ctx.fillStyle = 'rgba(9,9,11,0.38)';
      ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = sec > 0 ? '#ffffff' : '#4ade80';
      ctx.font = '800 78px "Barlow Condensed", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, cw / 2, ch / 2);
      ctx.textBaseline = 'alphabetic';
    }

    if (this.gameState === 'roundEnd') {
      ctx.fillStyle = 'rgba(9,9,11,0.52)';
      ctx.fillRect(0, 0, cw, ch);
      const alive = this.players.filter((p) => p.alive);
      const winPlayer =
        alive.length === 1 && !['paint', 'zombie'].includes(this.currentMinigame)
          ? alive[0]
          : null;
      const winCol = winPlayer ? winPlayer.color : '#ffffff';
      const winName = winPlayer ? PLAYER_NAMES[winPlayer.index] || `P${winPlayer.index + 1}` : 'RAUND BİTDİ';

      const prog = Math.min(1, this.roundEndTicks / 24);
      const easeOutBack = 1 + 2.1 * Math.pow(prog - 1, 3) + 1.1 * Math.pow(prog - 1, 2);
      const bannerY = -70 + (ch * 0.24 + 70) * Math.min(1.06, Math.max(0, easeOutBack));

      ctx.save();
      ctx.translate(cw / 2, bannerY);
      ctx.globalAlpha = Math.min(1, prog * 2);

      if (winPlayer) {
        ctx.font = '800 54px "Barlow Condensed", sans-serif';
        const nameW = ctx.measureText(winName).width;
        ctx.font = '800 40px "Barlow Condensed", sans-serif';
        const tagW = ctx.measureText('QAZANDI!').width + 24;
        const totalW = Math.max(260, nameW + tagW + 64);

        ctx.fillStyle = 'rgba(9,9,11,0.92)';
        roundRectPath(ctx, -totalW / 2, -40, totalW, 80, 14);
        ctx.fill();
        ctx.shadowColor = winCol;
        ctx.shadowBlur = 22;
        ctx.strokeStyle = winCol;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const startX = -totalW / 2 + 24;
        ctx.font = '800 54px "Barlow Condensed", sans-serif';
        ctx.fillStyle = winCol;
        ctx.fillText(winName, startX, 2);

        const pillX = startX + nameW + 14;
        ctx.fillStyle = winCol;
        roundRectPath(ctx, pillX, -22, tagW, 44, 8);
        ctx.fill();
        ctx.fillStyle = '#09090b';
        ctx.font = '800 36px "Barlow Condensed", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('QAZANDI!', pillX + tagW / 2, 2);
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 52px "Barlow Condensed", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('RAUND BİTDİ!', 0, 0);
      }
      ctx.restore();
    }
  }

  private loop = (now: number) => {
    if (!this.on || !this.canvas) return;
    this.raf = requestAnimationFrame(this.loop);

    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const cssW = Math.max(1, this.canvas.clientWidth || 960);
    const cssH = Math.max(1, this.canvas.clientHeight || 540);
    const targetW = Math.round(cssW * dpr);
    const targetH = Math.round(cssH * dpr);
    if (this.canvas.width !== targetW || this.canvas.height !== targetH || this.cw !== cssW || this.ch !== cssH) {
      this.canvas.width = targetW;
      this.canvas.height = targetH;
      this.cw = cssW;
      this.ch = cssH;
    }

    pollKeyboard(this.netRole !== null);
    if (this.paused) {
      this.acc = 0;
      return;
    }

    if (!this.last) this.last = now;
    this.acc += now - this.last;
    this.last = now;
    const STEP = 1000 / 60;
    let n = 0;
    if (this.netRole !== 'guest') {
      while (this.acc >= STEP && n < 4) {
        this.step();
        this.acc -= STEP;
        n++;
      }
    } else {
      this.acc = 0;
      const side = this.currentMinigame === 'race' || this.currentMinigame === 'lava';
      for (const p of this.players) {
        if (p.alive) this.updateMiniSprings(p, side);
      }
    }
    if (this.acc > STEP * 4) this.acc = 0;

    this.draw();
    if (this.netRole && this.callbacks?.onSendNet) {
      this.callbacks.onSendNet();
    }
  };
}

export const minigameEngine = new MinigameEngine();
