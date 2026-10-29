/**
 * Character definitions and attack profiles for NETA FIGHT ARENA
 */

import { CharacterConfig, AttackFrameData, CharacterId } from './types';

export const CHARACTERS: Record<CharacterId, CharacterConfig> = {
  modi: {
    id: 'modi',
    name: 'Narendra Modi',
    fullName: 'Narendra Modi',
    title: 'The 56-Inch Saffron Titan',
    partyName: 'BJP (Lotus)',
    primaryColor: '#f97316',   // Bright Saffron
    secondaryColor: '#ffffff', // White Kurta
    accentColor: '#ea580c',    // Deep Saffron
    auraColor: 'rgba(249, 115, 22, 0.45)',
    specialName: 'MITRON BLAST',
    specialDescription: 'Harnesses national energy to launch an unstoppable golden-saffron supersonic beam!',
    quotes: {
      win: [
        '56 inches of pure political power!',
        'This is the era of digital victory, Mitron!',
        'No opposition can stop this vikas momentum!',
        'Hard work defeated dynastic rhetoric today!'
      ],
      special: [
        'MITROOON!!',
        'HAR HAR MODI!',
        'DIGITAL STRIKE!',
        '56-INCH POWER!'
      ],
      taunt: [
        'Aap chronology samajhiye!',
        'Mitron, check your defense!',
        'Yoga makes me unbreakable!'
      ]
    }
  },
  rahul: {
    id: 'rahul',
    name: 'Rahul Gandhi',
    fullName: 'Rahul Gandhi',
    title: 'The Yatra Thunder Striker',
    partyName: 'Congress (Hand)',
    primaryColor: '#0284c7',   // Congress Cyan/Blue
    secondaryColor: '#ffffff', // White Polo
    accentColor: '#10b981',    // Tricolor Green
    auraColor: 'rgba(2, 132, 199, 0.45)',
    specialName: 'KHATAKHAT STORM',
    specialDescription: 'Sprints across the arena with lightning speed delivering a multi-strike high-voltage combo!',
    quotes: {
      win: [
        'Nafrat ke bazaar mein mohabbat ki jeet hui!',
        'Khatakhat, khatakhat, knockout!',
        'The Yatra continues all the way to the top!',
        'Fear has left the building today!'
      ],
      special: [
        'KHATAKHAT!!',
        'MOHABBAT KI DUKAAN!',
        'DARR MAT!',
        'BHARAT YATRA POWER!'
      ],
      taunt: [
        'Abhi to bas trailer tha!',
        'Chaliye thoda fast khelte hain!',
        'Khatakhat combo incoming!'
      ]
    }
  }
};

export const ATTACKS: Record<CharacterId, {
  punch: AttackFrameData;
  heavy_punch: AttackFrameData;
  kick: AttackFrameData;
  heavy_kick: AttackFrameData;
  special: AttackFrameData;
}> = {
  modi: {
    punch: {
      startup: 4,
      active: 4,
      recovery: 6,
      damage: 8,
      chipDamage: 1,
      rangeX: 75,
      rangeY: 45,
      knockback: 4,
      superGainAttacker: 6,
      superGainDefender: 3,
      sound: 'punch',
      comicWord: 'DHISHUM!'
    },
    heavy_punch: {
      startup: 8,
      active: 6,
      recovery: 12,
      damage: 18,
      chipDamage: 3,
      rangeX: 95,
      rangeY: 55,
      knockback: 12,
      superGainAttacker: 12,
      superGainDefender: 6,
      sound: 'heavy_punch',
      comicWord: '56-INCH!'
    },
    kick: {
      startup: 6,
      active: 5,
      recovery: 8,
      damage: 11,
      chipDamage: 2,
      rangeX: 85,
      rangeY: 50,
      knockback: 6,
      superGainAttacker: 8,
      superGainDefender: 4,
      sound: 'kick',
      comicWord: 'FATAK!'
    },
    heavy_kick: {
      startup: 11,
      active: 7,
      recovery: 14,
      damage: 22,
      chipDamage: 4,
      rangeX: 105,
      rangeY: 65,
      knockback: 16,
      superGainAttacker: 15,
      superGainDefender: 8,
      sound: 'heavy_kick',
      comicWord: 'YOGA KICK!'
    },
    special: {
      startup: 18,
      active: 32,
      recovery: 18,
      damage: 42,
      chipDamage: 10,
      rangeX: 550,
      rangeY: 90,
      knockback: 25,
      superGainAttacker: 0,
      superGainDefender: 14,
      sound: 'special',
      comicWord: 'MITRON!!'
    }
  },
  rahul: {
    punch: {
      startup: 3,
      active: 4,
      recovery: 5,
      damage: 7,
      chipDamage: 1,
      rangeX: 72,
      rangeY: 45,
      knockback: 3,
      superGainAttacker: 6,
      superGainDefender: 3,
      sound: 'punch',
      comicWord: 'DAPAT!'
    },
    heavy_punch: {
      startup: 7,
      active: 5,
      recovery: 11,
      damage: 17,
      chipDamage: 3,
      rangeX: 92,
      rangeY: 55,
      knockback: 11,
      superGainAttacker: 12,
      superGainDefender: 6,
      sound: 'heavy_punch',
      comicWord: 'KHATAKHAT!'
    },
    kick: {
      startup: 5,
      active: 5,
      recovery: 7,
      damage: 10,
      chipDamage: 2,
      rangeX: 88,
      rangeY: 50,
      knockback: 5,
      superGainAttacker: 8,
      superGainDefender: 4,
      sound: 'kick',
      comicWord: 'DHAMAAL!'
    },
    heavy_kick: {
      startup: 10,
      active: 7,
      recovery: 13,
      damage: 21,
      chipDamage: 4,
      rangeX: 110,
      rangeY: 65,
      knockback: 15,
      superGainAttacker: 15,
      superGainDefender: 8,
      sound: 'heavy_kick',
      comicWord: 'YATRA KICK!'
    },
    special: {
      startup: 16,
      active: 32,
      recovery: 18,
      damage: 42,
      chipDamage: 10,
      rangeX: 520,
      rangeY: 90,
      knockback: 24,
      superGainAttacker: 0,
      superGainDefender: 14,
      sound: 'special',
      comicWord: 'KHATAKHAT!!'
    }
  }
};
