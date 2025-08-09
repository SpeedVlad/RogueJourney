import { Player, Enemy } from './entities';
import { useAudio } from '../stores/useAudio';

export function calculateDamage(attacker: Player | Enemy, defender: Player | Enemy): number {
  const baseDamage = attacker.attackPower;
  const defense = defender.defense;
  const damage = Math.max(1, baseDamage - defense);
  
  // Add some randomness (±25%)
  const variance = 0.25;
  const randomFactor = 1 + (Math.random() - 0.5) * variance * 2;
  
  return Math.floor(damage * randomFactor);
}

export function performAttack(attacker: Player | Enemy, defender: Player | Enemy): {
  damage: number;
  killed: boolean;
  message: string;
} {
  const damage = calculateDamage(attacker, defender);
  defender.health = Math.max(0, defender.health - damage);
  const killed = defender.health <= 0;
  
  // Play hit sound
  const audio = useAudio.getState();
  audio.playHit();
  
  const attackerName = 'level' in attacker ? 'You' : getEnemyName(attacker as Enemy);
  const defenderName = 'level' in defender ? 'You' : getEnemyName(defender as Enemy);
  
  let message = `${attackerName} attack${attackerName === 'You' ? '' : 's'} ${defenderName} for ${damage} damage!`;
  
  if (killed) {
    message += ` ${defenderName} ${defenderName === 'You' ? 'die' : 'dies'}!`;
  }
  
  return { damage, killed, message };
}

export function getEnemyName(enemy: Enemy): string {
  return enemy.type.charAt(0).toUpperCase() + enemy.type.slice(1);
}

export function gainExperience(player: Player, experience: number): {
  newPlayer: Player;
  leveledUp: boolean;
  message: string;
} {
  let newPlayer = { ...player };
  newPlayer.experience += experience;
  let leveledUp = false;
  let message = `You gain ${experience} experience!`;
  
  // Check for level up
  while (newPlayer.experience >= newPlayer.experienceToNext) {
    newPlayer.experience -= newPlayer.experienceToNext;
    newPlayer.level++;
    leveledUp = true;
    
    // Increase stats on level up
    const healthIncrease = Math.floor(Math.random() * 8) + 5; // 5-12 health
    const manaIncrease = Math.floor(Math.random() * 5) + 3;   // 3-7 mana
    const attackIncrease = Math.floor(Math.random() * 2) + 1; // 1-2 attack
    const defenseIncrease = Math.floor(Math.random() * 2) + 1; // 1-2 defense
    
    newPlayer.maxHealth += healthIncrease;
    newPlayer.health = newPlayer.maxHealth; // Full heal on level up
    newPlayer.maxMana += manaIncrease;
    newPlayer.mana = newPlayer.maxMana; // Full mana restore on level up
    newPlayer.attackPower += attackIncrease;
    newPlayer.defense += defenseIncrease;
    
    // Increase experience needed for next level
    newPlayer.experienceToNext = Math.floor(newPlayer.experienceToNext * 1.3);
    
    message += ` Level up! You are now level ${newPlayer.level}!`;
  }
  
  return { newPlayer, leveledUp, message };
}
