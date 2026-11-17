export type WeaponId =
  | 'fist'
  | 'sword'
  | 'hammer'
  | 'spear'
  | 'gun'
  | 'smg'
  | 'shotgun'
  | 'bow'
  | 'bomb'
  | 'mine'
  | 'sniper'
  | 'rocket'
  | 'flame'
  | 'axe'
  | 'laser'
  | 'shuriken'
  | 'staff'
  | 'frost'
  | 'tesla'
  | 'rifle'
  | 'minigun'
  | 'grenade'
  | 'chainsaw'
  | 'boomerang'
  | 'katana';

export type WeaponChoice = WeaponId | 'random';

export type MapId =
  | 'minecraft'
  | 'snow_peaks'
  | 'steel_foundry'
  | 'neon_city'
  | 'lava_core'
  | 'sky_citadel'
  | 'space_station'
  | 'ancient_forest'
  | 'laser_vault'
  | 'pirate_ship'
  | 'desert_pyramid'
  | 'random';

export type MinigameId =
  | 'zombie'
  | 'sumo'
  | 'samurai'
  | 'sniper'
  | 'blades'
  | 'futbol'
  | 'laser'
  | 'lava'
  | 'tiles'
  | 'paint'
  | 'bomb'
  | 'race';

export type ScreenId =
  | 'home'
  | 'vsSetup'
  | 'minigames'
  | 'shop'
  | 'onlineChoice'
  | 'roomCreate'
  | 'roomJoin'
  | 'roomLobby'
  | 'game';

export type ShopCategory = 'outfit' | 'kit' | 'hat' | 'accessory';

export interface WeaponInfo {
  id: WeaponChoice;
  name: string;
  tag: string;
}

export const WEAPON_LIST: WeaponInfo[] = [
  { id: 'sword', name: 'Qılınc', tag: 'Yaxın' },
  { id: 'katana', name: 'Katana', tag: 'Sürətli' },
  { id: 'axe', name: 'Balta', tag: 'Ağır' },
  { id: 'hammer', name: 'Çəkic', tag: 'Zərbə' },
  { id: 'chainsaw', name: 'Mişar', tag: 'Davamlı' },
  { id: 'spear', name: 'Nizə', tag: 'Atılan' },
  { id: 'gun', name: 'Tapanca', tag: 'Dəqiq' },
  { id: 'smg', name: 'SMG', tag: 'Tez' },
  { id: 'rifle', name: 'Avtomat', tag: 'Silah' },
  { id: 'minigun', name: 'Pulemyot', tag: 'Seriya' },
  { id: 'shotgun', name: 'Shotgun', tag: 'Yaylım' },
  { id: 'sniper', name: 'Snayper', tag: 'Lazer' },
  { id: 'rocket', name: 'Raket', tag: 'Partlayış' },
  { id: 'grenade', name: 'Qranat', tag: 'Sıçrayan' },
  { id: 'bomb', name: 'Bomba', tag: 'Atılan' },
  { id: 'mine', name: 'Mina', tag: 'Tələ' },
  { id: 'flame', name: 'Alov', tag: 'Yandırıcı' },
  { id: 'bow', name: 'Ox', tag: 'Səssiz' },
  { id: 'laser', name: 'Lazer', tag: 'Enerji' },
  { id: 'shuriken', name: 'Şüriken', tag: 'Üçlü' },
  { id: 'staff', name: 'Əsa', tag: 'İzləyən' },
  { id: 'frost', name: 'Buz', tag: 'Yavaşladan' },
  { id: 'tesla', name: 'Tesla', tag: 'Zəncir' },
  { id: 'boomerang', name: 'Bumeranq', tag: 'Qayıdan' },
  { id: 'fist', name: 'Yumruq', tag: 'Klassik' },
  { id: 'random', name: 'Təsadüfi', tag: 'Hər raund' },
];

export interface MapInfo {
  id: MapId;
  name: string;
  desc: string;
  mechanic: string;
}

export const MAP_LIST: MapInfo[] = [
  { id: 'minecraft', name: 'Minecraft Dünyası', desc: 'Sütunlar · Slime batut · İkiqat liftlər', mechanic: 'Blok + Sütun + Lift' },
  { id: 'pirate_ship', name: 'Korsan Gəmisi', desc: 'Qoşa dirək sütunları · Top bamperi · Yellənən lövbər', mechanic: 'Qapalı Gəmi' },
  { id: 'desert_pyramid', name: 'Səhra Piramidası', desc: 'Simmetrik obelisk sütunları · Külək liftləri', mechanic: 'Sütun + Külək' },
  { id: 'snow_peaks', name: 'Qarlı Zirvə', desc: 'Qırılan buz körpüləri · Buz sütunları · Simmetrik külək', mechanic: 'Qırılan Buz' },
  { id: 'steel_foundry', name: 'Polad Zavod', desc: 'Simmetrik konveyerlər · Polad sütunlar · İkiqat kran', mechanic: 'Simmetrik Zavod' },
  { id: 'neon_city', name: 'Neon Metropol', desc: 'Neon sütunlar · Tək cüt hiper-portal · Pinbol bamperi', mechanic: 'Tək Cüt Portal' },
  { id: 'lava_core', name: 'Vulkan Krateri', desc: 'Qalxan maqma · Bazalt sütunlar · Simmetrik platformalar', mechanic: 'Qalxan Lava' },
  { id: 'sky_citadel', name: 'Qala Körpüsü', desc: 'Qala sütunları · Əkiz tikanlı mişarlar · Rahat qatlar', mechanic: 'Sütunlu Qala' },
  { id: 'space_station', name: 'Orbital Stansiya', desc: 'Aşağı cazibə · Enerji sütunları · Anti-cazibə şüası', mechanic: 'Kosmik Arena' },
  { id: 'ancient_forest', name: 'Meşə Məbədi', desc: 'Məbəd sütunları · Qoşa göbələk batut · Spora axını', mechanic: 'Sütunlu Məbəd' },
  { id: 'laser_vault', name: 'Lazer Anbarı', desc: 'Zirehli sütunlar · Lazer qapıları · İkiqat liftlər', mechanic: 'Taktiki Anbar' },
  { id: 'random', name: 'Təsadüfi', desc: 'Hər raundda fərqli seçilmiş arena', mechanic: 'Dinamik' },
];

export interface MinigameInfo {
  id: MinigameId;
  name: string;
  desc: string;
  tag: string;
}

export const MINIGAME_LIST: MinigameInfo[] = [
  { id: 'zombie', name: 'Zombi Hücumu', desc: 'Zombi dalğalarını güllələ, qutu topla və sağ qal!', tag: 'YENİ · ZOMBİ' },
  { id: 'samurai', name: 'Samuray Duellosu', desc: 'Katana zərbəsi ilə sıçra, qılıncları toqquşdur!', tag: 'YENİ · QILINC' },
  { id: 'sniper', name: 'Snayper Duellosu', desc: 'Lazer nişanı al, sütunlardan sıçrayan güllə at', tag: 'YENİ · TAKTİKİ' },
  { id: 'blades', name: 'Mişar Arenası', desc: 'Sürətlənən mişarlardan qaç, rəqibi üstünə itələ', tag: 'YENİ · XARABALIQ' },
  { id: 'sumo', name: 'Sumo Döyüşü', desc: 'Daralan dojoda zərbə dalğası ilə rəqibi itələ', tag: '2-4 Oyunçu' },
  { id: 'futbol', name: 'Mini Futbol', desc: 'Künc bamperli meydançada 3 qol vur və qazan', tag: 'Komanda' },
  { id: 'laser', name: 'Lazer Tələsi', desc: 'Çarpaz lazerlərdən sıyrıl, qalxan kürəsi topla', tag: 'Sağ qal' },
  { id: 'lava', name: 'Lava Qalxışı', desc: 'Yaylı batutlarla tullan, qalxan maqmadan qaç', tag: 'Parkur' },
  { id: 'tiles', name: 'Qırılan Zəmin', desc: 'Çökən lövhələr üstündən hoppan, boşluğa düşmə!', tag: 'Hoppanma' },
  { id: 'paint', name: 'Rəng Zəbt Et', desc: 'Rəng bombaları ilə ərazini boya, lider ol', tag: '35 Saniyə' },
  { id: 'bomb', name: 'İsti Bomba', desc: 'Sütunlar arasında qaç, taymer bitmədən bombanı at', tag: 'Partlayış' },
  { id: 'race', name: 'Sürət Yarışı', desc: 'Yay, turbo zolaq və maneələrdən aşıb finişə çat', tag: 'Parkur' },
];

export interface PlayerInput {
  x: number;
  y: number;
  action: boolean;
  jump: boolean;
  auto: boolean;
  releaseAction: boolean;
  releaseX: number;
  releaseY: number;
  aimAngle?: number | null;
}

export const inputPlayers: PlayerInput[] = [
  { x: 0, y: 0, action: false, jump: false, auto: false, releaseAction: false, releaseX: 0, releaseY: 0, aimAngle: null },
  { x: 0, y: 0, action: false, jump: false, auto: false, releaseAction: false, releaseX: 0, releaseY: 0, aimAngle: null },
  { x: 0, y: 0, action: false, jump: false, auto: false, releaseAction: false, releaseX: 0, releaseY: 0, aimAngle: null },
  { x: 0, y: 0, action: false, jump: false, auto: false, releaseAction: false, releaseX: 0, releaseY: 0, aimAngle: null },
];

export const DEFAULT_PLAYER_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
export const PLAYER_COLORS = [...DEFAULT_PLAYER_COLORS];
export const PLAYER_NAMES = ['P1', 'P2', 'P3', 'P4'];
export const COLOR_CHOICES = [
  '#3b82f6',
  '#ef4444',
  '#10b981',
  '#f59e0b',
  '#ff4fd8',
  '#8b5cf6',
  '#2dd4ff',
  '#b6f34a',
  '#f97316',
  '#14b8a6',
];

const keys: Record<string, boolean> = {};
const kbPrev = [false, false, false, false];
const kbActionPrev = [false, false, false, false];

const KB_MAP = [
  { l: 'KeyA', r: 'KeyD', u: 'KeyW', d: 'KeyS', a: 'Space', a2: 'KeyF', j: 'KeyW' },
  { l: 'ArrowLeft', r: 'ArrowRight', u: 'ArrowUp', d: 'ArrowDown', a: 'Enter', a2: 'Slash', j: 'ArrowUp' },
  { l: 'KeyJ', r: 'KeyL', u: 'KeyI', d: 'KeyK', a: 'KeyO', a2: 'KeyU', j: 'KeyI' },
  { l: 'Numpad4', r: 'Numpad6', u: 'Numpad8', d: 'Numpad5', a: 'Numpad0', a2: 'NumpadDecimal', j: 'Numpad8' },
];

let kbListenersBound = false;
export function bindKeyboardListeners() {
  if (kbListenersBound || typeof window === 'undefined') return;
  kbListenersBound = true;
  const gameKeys = new Set([
    'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
    'Enter', 'Numpad0', 'Numpad4', 'Numpad5', 'Numpad6', 'Numpad8',
  ]);
  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    const tag = (e.target as HTMLElement | null)?.tagName || '';
    if (gameKeys.has(e.code) && !/INPUT|TEXTAREA/.test(tag)) {
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });
}

export function pollKeyboard(onlineMode: boolean) {
  KB_MAP.forEach((m, i) => {
    if (onlineMode && i !== 0) return;
    let x = (keys[m.r] ? 1 : 0) - (keys[m.l] ? 1 : 0);
    let y = (keys[m.d] ? 1 : 0) - (keys[m.u] ? 1 : 0);
    let a = !!(keys[m.a] || keys[m.a2]);
    let j = !!keys[m.j];
    // In online mode (1 player per device), accept BOTH WASD and Arrow keys comfortably
    if (onlineMode && i === 0) {
      const m2 = KB_MAP[1];
      const x2 = (keys[m2.r] ? 1 : 0) - (keys[m2.l] ? 1 : 0);
      const y2 = (keys[m2.d] ? 1 : 0) - (keys[m2.u] ? 1 : 0);
      if (x === 0) x = x2;
      if (y === 0) y = y2;
      a = a || !!(keys[m2.a] || keys[m2.a2]);
      j = j || !!keys[m2.j];
    }
    const act = !!(x || y || a || j);
    const inp = inputPlayers[i];
    if (act || kbPrev[i]) {
      inp.x = x;
      inp.y = y;
      if (a || kbActionPrev[i]) inp.action = a;
      inp.jump = j;
      inp.auto = false;
    }
    if (kbActionPrev[i] && !a) {
      inp.releaseAction = true;
      inp.releaseX = x || inp.releaseX;
      inp.releaseY = y || inp.releaseY;
    }
    kbPrev[i] = act;
    kbActionPrev[i] = a;
  });
}

export function clearReleasedActions() {
  for (const inp of inputPlayers) {
    inp.releaseAction = false;
  }
}

export function resetInputs() {
  for (const k of Object.keys(keys)) delete keys[k];
  kbPrev.fill(false);
  kbActionPrev.fill(false);
  for (const inp of inputPlayers) {
    inp.x = 0;
    inp.y = 0;
    inp.releaseX = 0;
    inp.releaseY = 0;
    inp.action = false;
    inp.jump = false;
    inp.releaseAction = false;
    inp.auto = false;
    inp.aimAngle = null;
  }
}
