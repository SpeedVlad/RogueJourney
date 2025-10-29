import random
from game.game_objects import Item

def generate_random_item() -> Item:
    item_types = ['weapon', 'armor', 'aura', 'consumable']
    item_type = random.choice(item_types)
    rarity = get_random_rarity()
    
    rarity_multiplier = {
        'common': 1,
        'uncommon': 1.75,
        'rare': 3,
        'legendary': 5,
        'mythic': 15
    }[rarity]
    
    if item_type == 'weapon':
        return generate_weapon(rarity, rarity_multiplier)
    elif item_type == 'armor':
        return generate_armor(rarity, rarity_multiplier)
    elif item_type == 'aura':
        return generate_aura(rarity, rarity_multiplier)
    else:
        return generate_consumable(rarity, rarity_multiplier)

def get_random_rarity():
    roll = random.random()
    if roll < 0.6:
        return 'common'
    if roll < 0.85:
        return 'uncommon'
    if roll < 0.97:
        return 'rare'
    if roll < 0.99:
        return 'legendary'
    return 'mythic'

def generate_weapon(rarity, multiplier):
    weapons = [
        {'name': 'Rusty Sword', 'symbol': '/', 'base_damage': 3, 'description': 'An old, weathered blade'},
        {'name': 'Iron Dagger', 'symbol': '-', 'base_damage': 2, 'description': 'Quick and precise'},
        {'name': 'War Hammer', 'symbol': 'T', 'base_damage': 5, 'description': 'Heavy and devastating'},
        {'name': 'Magic Staff', 'symbol': '|', 'base_damage': 4, 'description': 'Crackling with energy'},
        {'name': 'Bow', 'symbol': ')', 'base_damage': 3, 'description': 'Silent and deadly'},
        {'name': 'Battle Axe', 'symbol': 'P', 'base_damage': 6, 'description': 'Cleaves through armor'}
    ]
    
    base = random.choice(weapons)
    damage = int(base['base_damage'] * multiplier)
    
    return Item(
        id=str(random.random()),
        name=f"{get_rarity_prefix(rarity)}{base['name']}",
        description=base['description'],
        type='weapon',
        symbol=base['symbol'],
        color=get_rarity_color(rarity),
        rarity=rarity,
        damage=damage
    )

def generate_armor(rarity, multiplier):
    armors = [
        {'name': 'Leather Armor', 'symbol': '[', 'base_defense': 2, 'description': 'Light and flexible'},
        {'name': 'Chain Mail', 'symbol': '#', 'base_defense': 3, 'description': 'Interlocked protection'},
        {'name': 'Plate Armor', 'symbol': 'H', 'base_defense': 5, 'description': 'Heavy metal protection'},
        {'name': 'Robe', 'symbol': '&', 'base_defense': 1, 'description': 'Mystical garment'},
        {'name': 'Scale Mail', 'symbol': 'S', 'base_defense': 4, 'description': 'Dragon scale protection'}
    ]
    
    base = random.choice(armors)
    defense = int(base['base_defense'] * multiplier)
    
    return Item(
        id=str(random.random()),
        name=f"{get_rarity_prefix(rarity)}{base['name']}",
        description=base['description'],
        type='armor',
        symbol=base['symbol'],
        color=get_rarity_color(rarity),
        rarity=rarity,
        defense=defense
    )

def generate_consumable(rarity, multiplier):
    consumables = [
        {'name': 'Health Potion', 'symbol': '!', 'base_healing': 15, 'description': 'Restores health'},
        {'name': 'Elixir', 'symbol': '%', 'base_healing': 25, 'description': 'Restores health'},
        {'name': 'Bread', 'symbol': '*', 'base_healing': 8, 'description': 'Simple sustenance'}
    ]
    
    base = random.choice(consumables)
    healing_power = int(base['base_healing'] * multiplier) if base.get('base_healing') else None
    
    return Item(
        id=str(random.random()),
        name=f"{get_rarity_prefix(rarity)}{base['name']}",
        description=base['description'],
        type='consumable',
        symbol=base['symbol'],
        color=get_rarity_color(rarity),
        rarity=rarity,
        healing_power=healing_power
    )

def generate_aura(rarity, multiplier):
    auras = [
        {'name': 'Healing Aura', 'symbol': '◊', 'base_health': 20, 'base_exp': 0, 'description': 'Increases maximum health'},
        {'name': 'Vitality Aura', 'symbol': '◊', 'base_health': 15, 'description': 'Increases health'},
        {'name': 'Experience Aura', 'symbol': '◊', 'base_health': 5, 'base_exp': 25, 'description': 'Boosts experience gain'},
        {'name': 'Radiant Aura', 'symbol': '◊', 'base_health': 25, 'base_exp': 10, 'description': 'Powerful magical enhancement'}
    ]
    
    base = random.choice(auras)
    health_bonus = int(base['base_health'] * multiplier) if base.get('base_health', 0) > 0 else None
    experience_bonus = int(base.get('base_exp', 0) * multiplier) if base.get('base_exp', 0) > 0 else None
    
    return Item(
        id=str(random.random()),
        name=f"{get_rarity_prefix(rarity)}{base['name']}",
        description=base['description'],
        type='aura',
        symbol=base['symbol'],
        color=get_rarity_color(rarity),
        rarity=rarity,
        health_bonus=health_bonus,
        experience_bonus=experience_bonus
    )

def get_rarity_prefix(rarity):
    prefixes = {
        'uncommon': 'Fine ',
        'rare': 'Superior ',
        'legendary': 'Outstanding ',
        'mythic': 'Godly '
    }
    return prefixes.get(rarity, '')

def get_rarity_color(rarity):
    colors = {
        'uncommon': (85, 85, 255),
        'rare': (170, 85, 255),
        'legendary': (255, 136, 0),
        'mythic': (255, 0, 0),
        'common': (255, 255, 255)
    }
    return colors.get(rarity, (255, 255, 255))
