import { Weapon } from '../types/game';

import deagleImg from '../assets/images/ff_desert_eagle_1790691973088.jpg';
import mp40Img from '../assets/images/ff_mp40_smg_1790691989115.jpg';
import awmImg from '../assets/images/ff_awm_sniper_1790692006627.jpg';

export const WEAPONS: Weapon[] = [
  {
    id: 'deagle',
    name: 'Desert Eagle',
    type: 'Pistol',
    damageHead: 100,
    damageBody: 25,
    fireRate: 280, // semi-auto tap
    magSize: 7,
    reloadTimeMs: 1200,
    image: deagleImg,
    recoilAmount: 7,
    hasScope: false,
    scopeZoom: 1,
    soundPreset: 'deagle',
  },
  {
    id: 'mp40',
    name: 'MP40 Cobra',
    type: 'SMG',
    damageHead: 100,
    damageBody: 25,
    fireRate: 95, // rapid continuous fire
    magSize: 32,
    reloadTimeMs: 1400,
    image: mp40Img,
    recoilAmount: 3.5,
    hasScope: false,
    scopeZoom: 1,
    soundPreset: 'mp40',
  },
  {
    id: 'awm',
    name: 'AWM Sniper',
    type: 'Sniper',
    damageHead: 150,
    damageBody: 60,
    fireRate: 900, // bolt action
    magSize: 5,
    reloadTimeMs: 1800,
    image: awmImg,
    recoilAmount: 14,
    hasScope: true,
    scopeZoom: 2.2, // 4x-8x scope simulation
    soundPreset: 'awm',
  },
  {
    id: 'm1887',
    name: 'M1887 Double-Barrel',
    type: 'Shotgun',
    damageHead: 100,
    damageBody: 35,
    fireRate: 450,
    magSize: 2,
    reloadTimeMs: 1100,
    pellets: 6,
    recoilAmount: 12,
    hasScope: false,
    scopeZoom: 1,
    soundPreset: 'shotgun',
  },
  {
    id: 'ak47',
    name: 'AK-47 Dragon',
    type: 'Rifle',
    damageHead: 100,
    damageBody: 30,
    fireRate: 140,
    magSize: 30,
    reloadTimeMs: 1500,
    recoilAmount: 5.5,
    hasScope: true,
    scopeZoom: 1.4,
    soundPreset: 'rifle',
  },
];
