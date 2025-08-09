import { Item } from './entities';

export function generateRandomItem(): Item {
  const itemTypes = ['weapon', 'armor', 'aura', 'consumable'] as const;
  const rarities = ['common', 'uncommon', 'rare', 'legendary'] as const;
  
  const type = itemTypes[Math.floor(Math.random() * itemTypes.length)];
  const rarity = getRandomRarity();
  
  const rarityMultiplier = {
    common: 1,
    uncommon: 1.5,
    rare: 2,
    legendary: 3
  }[rarity];

  if (type === 'weapon') {
    return generateWeapon(rarity, rarityMultiplier);
  } else if (type === 'armor') {
    return generateArmor(rarity, rarityMultiplier);
  } else if (type === 'aura') {
    return generateAura(rarity, rarityMultiplier);
  } else {
    return generateConsumable(rarity, rarityMultiplier);
  }
}

function getRandomRarity(): 'common' | 'uncommon' | 'rare' | 'legendary' {
  const roll = Math.random();
  if (roll < 0.6) return 'common';
  if (roll < 0.85) return 'uncommon';
  if (roll < 0.97) return 'rare';
  return 'legendary';
}

function generateWeapon(rarity: string, multiplier: number): Item {
  const weapons = [
    { name: 'Rusty Sword', symbol: '/', baseDamage: 3, description: 'An old, weathered blade' },
    { name: 'Iron Dagger', symbol: '-', baseDamage: 2, description: 'Quick and precise' },
    { name: 'War Hammer', symbol: 'T', baseDamage: 5, description: 'Heavy and devastating' },
    { name: 'Magic Staff', symbol: '|', baseDamage: 4, description: 'Crackling with energy' },
    { name: 'Bow', symbol: ')', baseDamage: 3, description: 'Silent and deadly' },
    { name: 'Battle Axe', symbol: 'P', baseDamage: 6, description: 'Cleaves through armor' }
  ];

  const base = weapons[Math.floor(Math.random() * weapons.length)];
  const damage = Math.floor(base.baseDamage * multiplier);

  return {
    id: Math.random().toString(36),
    name: `${getRarityPrefix(rarity)}${base.name}`,
    description: base.description,
    type: 'weapon',
    symbol: base.symbol,
    color: getRarityColor(rarity),
    rarity: rarity as any,
    damage
  };
}

function generateArmor(rarity: string, multiplier: number): Item {
  const armors = [
    { name: 'Leather Armor', symbol: '[', baseDefense: 2, description: 'Light and flexible' },
    { name: 'Chain Mail', symbol: '#', baseDefense: 3, description: 'Interlocked protection' },
    { name: 'Plate Armor', symbol: 'H', baseDefense: 5, description: 'Heavy metal protection' },
    { name: 'Robe', symbol: '&', baseDefense: 1, description: 'Mystical garment' },
    { name: 'Scale Mail', symbol: 'S', baseDefense: 4, description: 'Dragon scale protection' }
  ];

  const base = armors[Math.floor(Math.random() * armors.length)];
  const defense = Math.floor(base.baseDefense * multiplier);

  return {
    id: Math.random().toString(36),
    name: `${getRarityPrefix(rarity)}${base.name}`,
    description: base.description,
    type: 'armor',
    symbol: base.symbol,
    color: getRarityColor(rarity),
    rarity: rarity as any,
    defense
  };
}

function generateConsumable(rarity: string, multiplier: number): Item {
  const consumables = [
    { name: 'Health Potion', symbol: '!', baseHealing: 15, description: 'Restores health' },
    { name: 'Mana Potion', symbol: '?', baseMana: 10, description: 'Restores mana' },
    { name: 'Elixir', symbol: '%', baseHealing: 25, baseMana: 15, description: 'Restores health and mana' },
    { name: 'Bread', symbol: '*', baseHealing: 8, description: 'Simple sustenance' }
  ];

  const base = consumables[Math.floor(Math.random() * consumables.length)];
  const healingPower = base.baseHealing ? Math.floor(base.baseHealing * multiplier) : undefined;
  const manaPower = base.baseMana ? Math.floor(base.baseMana * multiplier) : undefined;

  return {
    id: Math.random().toString(36),
    name: `${getRarityPrefix(rarity)}${base.name}`,
    description: base.description,
    type: 'consumable',
    symbol: base.symbol,
    color: getRarityColor(rarity),
    rarity: rarity as any,
    healingPower,
    manaPower
  };
}

function getRarityPrefix(rarity: string): string {
  switch (rarity) {
    case 'uncommon': return 'Fine ';
    case 'rare': return 'Superior ';
    case 'legendary': return 'Legendary ';
    default: return '';
  }
}

function generateAura(rarity: string, multiplier: number): Item {
  const auras = [
    { name: 'Healing Aura', symbol: '◊', baseHealth: 20, baseMana: 0, baseExp: 0, description: 'Increases maximum health' },
    { name: 'Mana Aura', symbol: '◊', baseHealth: 0, baseMana: 15, baseExp: 0, description: 'Increases maximum mana' },
    { name: 'Vitality Aura', symbol: '◊', baseHealth: 15, baseMana: 10, baseExp: 0, description: 'Increases health and mana' },
    { name: 'Experience Aura', symbol: '◊', baseHealth: 5, baseMana: 5, baseExp: 25, description: 'Boosts experience gain' },
    { name: 'Radiant Aura', symbol: '◊', baseHealth: 25, baseMana: 20, baseExp: 10, description: 'Powerful magical enhancement' }
  ];

  const base = auras[Math.floor(Math.random() * auras.length)];
  const healthBonus = base.baseHealth > 0 ? Math.floor(base.baseHealth * multiplier) : undefined;
  const manaBonus = base.baseMana > 0 ? Math.floor(base.baseMana * multiplier) : undefined;
  const experienceBonus = base.baseExp > 0 ? Math.floor(base.baseExp * multiplier) : undefined;

  return {
    id: Math.random().toString(36),
    name: `${getRarityPrefix(rarity)}${base.name}`,
    description: base.description,
    type: 'aura',
    symbol: base.symbol,
    color: getRarityColor(rarity),
    rarity: rarity as any,
    healthBonus,
    manaBonus,
    experienceBonus
  };
}

function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'uncommon': return '#5555ff';
    case 'rare': return '#aa55ff';
    case 'legendary': return '#ff8800';
    default: return '#ffffff';
  }
}
