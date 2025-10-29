import random
from game.game_objects import Player, Enemy

def calculate_damage(attacker, defender):
    base_damage = attacker.attack_power
    defense = defender.defense
    damage = max(1, base_damage - defense)
    
    if not isinstance(attacker, Player):
        damage = damage * 3
    
    variance = 0.25
    random_factor = 1 + (random.random() - 0.5) * variance * 2
    
    return int(damage * random_factor)

def perform_attack(attacker, defender):
    damage = calculate_damage(attacker, defender)
    defender.health = max(0, defender.health - damage)
    killed = defender.health <= 0
    
    attacker_name = 'You' if isinstance(attacker, Player) else get_enemy_name(attacker)
    defender_name = 'You' if isinstance(defender, Player) else get_enemy_name(defender)
    
    message = f"{attacker_name} attack{'s' if attacker_name != 'You' else ''} {defender_name} for {damage} damage!"
    
    if killed:
        message += f" {defender_name} {'die' if defender_name == 'You' else 'dies'}!"
    
    return {'damage': damage, 'killed': killed, 'message': message}

def get_enemy_name(enemy: Enemy):
    return enemy.type.capitalize()

def gain_experience(player: Player, experience: int):
    player.experience += experience
    leveled_up = False
    message = f"You gain {experience} experience!"
    
    while player.experience >= player.experience_to_next:
        player.experience -= player.experience_to_next
        player.level += 1
        leveled_up = True
        
        health_increase = random.randint(5, 12)
        mana_increase = random.randint(3, 7)
        attack_increase = random.randint(1, 2)
        defense_increase = random.randint(1, 2)
        
        player.max_health += health_increase
        player.health = player.max_health
        player.max_mana += mana_increase
        player.mana = player.max_mana
        player.attack_power += attack_increase
        player.defense += defense_increase
        
        player.experience_to_next = int(player.experience_to_next * 1.3)
        
        message += f" Level up! You are now level {player.level}!"
    
    return {'leveled_up': leveled_up, 'message': message}
