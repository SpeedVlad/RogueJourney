import { useRoguelike } from "./lib/stores/useRoguelike";
import { Item } from "./lib/game/entities";
import { X, Trash2, Merge, ArrowUpDown, Star, Sword } from "lucide-react";
import { useState } from "react";

const Inventory = () => {
  const { gameState, closeInventory, useItem, equipItem, deleteItem, mergeItems, unequipItem } = useRoguelike();
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'rarity' | 'enhancement' | 'type'>(() => {
    return localStorage.getItem('inventorySortBy') as 'rarity' | 'enhancement' | 'type' || 'rarity';
  });

  if (!gameState) return null;

  const { player } = gameState;

  const handleItemClick = (item: Item, index: number) => {
    if (selectedItems.includes(index)) {
      // Deselect item
      setSelectedItems(selectedItems.filter(i => i !== index));
    } else {
      // Add to selection
      setSelectedItems([...selectedItems, index]);
    }
  };

  const handleUseOrEquip = (item: Item, index: number) => {
    if (item.type === 'consumable') {
      useItem(index);
    } else if (item.type === 'weapon' || item.type === 'armor' || item.type === 'aura') {
      equipItem(index);
    }
    setSelectedItems([]); // Clear selection after use/equip
  };

  const handleDeleteItem = (index: number) => {
    deleteItem(index);
    setSelectedItems([]);
  };

  const handleMergeItems = () => {
    if (selectedItems.length === 2) {
      mergeItems(selectedItems[0], selectedItems[1]);
      setSelectedItems([]);
    }
  };

  const getItemTypeColor = (type: string) => {
    switch (type) {
      case 'weapon': return 'text-red-400';
      case 'armor': return 'text-blue-400';
      case 'aura': return 'text-purple-400';
      case 'consumable': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'weapon': return '⚔️';
      case 'armor': return '🛡️';
      case 'aura': return '✨';
      case 'consumable': return '❤️';
      default: return '📦';
    }
  };

  const getEnhancementRank = (item: Item) => {
    if (!item.name.includes('Enhanced')) return null;
    
    // Count how many times "Enhanced" appears to determine rank
    const enhancementLevel = (item.name.match(/Enhanced/g) || []).length;
    
    if (enhancementLevel >= 1 && enhancementLevel <= 10) {
      return { text: `Bronze Rank ${enhancementLevel}`, color: 'text-orange-600' };
    } else if (enhancementLevel >= 11 && enhancementLevel <= 20) {
      return { text: `Silver Rank ${enhancementLevel}`, color: 'text-gray-300' };
    } else if (enhancementLevel >= 21 && enhancementLevel <= 30) {
      return { text: `Gold Rank ${enhancementLevel}`, color: 'text-yellow-400' };
    }
    return null;
  };

  const formatItemName = (item: Item) => {
    const baseName = item.name.replace(/Enhanced\s*/g, '');
    const rank = getEnhancementRank(item);
    return rank ? `${baseName}` : baseName;
  };

  const sortItems = (items: Item[]) => {
    const itemsWithIndex = items.map((item, index) => ({ item, index }));
    
    return itemsWithIndex.sort((a, b) => {
      if (sortBy === 'rarity') {
        const rarityOrder = { 'legendary': 4, 'rare': 3, 'uncommon': 2, 'common': 1 };
        return (rarityOrder[b.item.rarity as keyof typeof rarityOrder] || 0) - 
               (rarityOrder[a.item.rarity as keyof typeof rarityOrder] || 0);
      } else if (sortBy === 'enhancement') {
        const aLevel = (a.item.name.match(/Enhanced/g) || []).length;
        const bLevel = (b.item.name.match(/Enhanced/g) || []).length;
        return bLevel - aLevel;
      } else if (sortBy === 'type') {
        return a.item.type.localeCompare(b.item.type);
      }
      return 0;
    });
  };

  const handleAutoMerge = () => {
    // Merge ALL pairs of same type and rarity
    const items = player.inventory;
    let mergedAny = false;
    
    // Keep merging until no more pairs can be merged
    while (true) {
      let foundPair = false;
      
      for (let i = 0; i < items.length - 1; i++) {
        for (let j = i + 1; j < items.length; j++) {
          if (items[i] && items[j] && 
              items[i].type === items[j].type && 
              items[i].rarity === items[j].rarity) {
            mergeItems(i, j);
            foundPair = true;
            mergedAny = true;
            break;
          }
        }
        if (foundPair) break;
      }
      
      if (!foundPair) break;
    }
    
    if (!mergedAny) {
      // Show message if nothing to merge
      console.log('No items to merge');
    }
  };

  const handleDeleteAll = () => {
    // Delete all selected items
    selectedItems.sort((a, b) => b - a).forEach(index => deleteItem(index));
    setSelectedItems([]);
  };

  const handleDeleteAllUnequipped = () => {
    // Delete all unequipped items
    const indices = [];
    for (let i = player.inventory.length - 1; i >= 0; i--) {
      indices.push(i);
    }
    indices.forEach(index => deleteItem(index));
  };

  const handleEquipBest = () => {
    // Find best weapon, armor, and aura
    const weapons = player.inventory.filter(item => item.type === 'weapon');
    const armors = player.inventory.filter(item => item.type === 'armor');
    const auras = player.inventory.filter(item => item.type === 'aura');
    
    const getBestItem = (items: Item[]) => {
      return items.reduce((best, current) => {
        const bestLevel = (best.name.match(/Enhanced/g) || []).length;
        const currentLevel = (current.name.match(/Enhanced/g) || []).length;
        
        if (currentLevel > bestLevel) return current;
        
        if (currentLevel === bestLevel) {
          const rarityOrder = { 'legendary': 4, 'rare': 3, 'uncommon': 2, 'common': 1 };
          const bestRarity = rarityOrder[best.rarity as keyof typeof rarityOrder] || 0;
          const currentRarity = rarityOrder[current.rarity as keyof typeof rarityOrder] || 0;
          
          if (currentRarity > bestRarity) return current;
          
          if (currentRarity === bestRarity) {
            const bestStat = (best.damage || best.defense || 0);
            const currentStat = (current.damage || current.defense || 0);
            return currentStat > bestStat ? current : best;
          }
        }
        
        return best;
      });
    };
    
    if (weapons.length > 0) {
      const bestWeapon = getBestItem(weapons);
      const weaponIndex = player.inventory.findIndex(item => item === bestWeapon);
      if (weaponIndex >= 0) equipItem(weaponIndex);
    }
    
    if (armors.length > 0) {
      const bestArmor = getBestItem(armors);
      const armorIndex = player.inventory.findIndex(item => item === bestArmor);
      if (armorIndex >= 0) equipItem(armorIndex);
    }
    
    if (auras.length > 0) {
      const bestAura = getBestItem(auras);
      const auraIndex = player.inventory.findIndex(item => item === bestAura);
      if (auraIndex >= 0) equipItem(auraIndex);
    }
  };

  const canMergeItems = () => {
    // Check if we have at least 3 items of the same type and rarity
    const itemGroups: { [key: string]: Item[] } = {};
    
    player.inventory.forEach(item => {
      const key = `${item.type}-${item.rarity}`;
      if (!itemGroups[key]) itemGroups[key] = [];
      itemGroups[key].push(item);
    });
    
    return Object.values(itemGroups).some(group => group.length >= 3);
  };

  const handleSortChange = (newSort: 'rarity' | 'enhancement' | 'type') => {
    setSortBy(newSort);
    localStorage.setItem('inventorySortBy', newSort);
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-40">
      <div className="bg-gray-900 border border-gray-600 rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Inventory</h2>
          <div className="flex gap-2 items-center">
            {/* Sorting Controls */}
            <div className="flex gap-1">
              <button
                onClick={() => handleSortChange('rarity')}
                className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                  sortBy === 'rarity' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
                }`}
              >
                <Star size={12} />
                Rarity
              </button>
              <button
                onClick={() => handleSortChange('enhancement')}
                className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                  sortBy === 'enhancement' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
                }`}
              >
                <ArrowUpDown size={12} />
                Rank
              </button>
              <button
                onClick={() => handleSortChange('type')}
                className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                  sortBy === 'type' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
                }`}
              >
                <Sword size={12} />
                Type
              </button>
            </div>
            
            {/* Action Buttons */}
            <button
              onClick={handleEquipBest}
              className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
            >
              Equip Best
            </button>
            {canMergeItems() && (
              <button
                onClick={handleAutoMerge}
                className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
              >
                Auto Merge
              </button>
            )}
            {selectedItems.length === 0 && player.inventory.length > 0 && (
              <button
                onClick={handleDeleteAllUnequipped}
                className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
              >
                Delete All
              </button>
            )}
            {selectedItems.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
              >
                Delete
              </button>
            )}
            <button
              onClick={closeInventory}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6 text-white">
          <div className="bg-gray-800 p-3 rounded flex items-center gap-2">
            <span className="text-red-400">❤️</span>
            <div>
              <div className="text-sm text-gray-400">Health</div>
              <div className="text-lg font-bold text-red-400">{player.health}/{player.maxHealth}</div>
            </div>
          </div>
          <div className="bg-gray-800 p-3 rounded flex items-center gap-2">
            <span className="text-orange-400">🔥</span>
            <div>
              <div className="text-sm text-gray-400">Attack</div>
              <div className="text-lg font-bold text-orange-400">{player.attackPower}</div>
            </div>
          </div>
          <div className="bg-gray-800 p-3 rounded flex items-center gap-2">
            <span className="text-blue-400">🛡️</span>
            <div>
              <div className="text-sm text-gray-400">Defense</div>
              <div className="text-lg font-bold text-blue-400">{player.defense}</div>
            </div>
          </div>
          <div className="bg-gray-800 p-3 rounded flex items-center gap-2">
            <span className="text-yellow-400">⭐</span>
            <div>
              <div className="text-sm text-gray-400">Level</div>
              <div className="text-lg font-bold text-yellow-400">{gameState.level}</div>
            </div>
          </div>
        </div>

        {/* Equipment */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Equipment</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-800 p-3 rounded border border-gray-600">
              <div className="text-sm text-gray-400 mb-1">Weapon</div>
              {player.weapon ? (
                <div className="text-white">
                  <div className="font-semibold flex items-center gap-2">
                    <span>⚔️</span>
                    <span>{formatItemName(player.weapon)}</span>
                    {getEnhancementRank(player.weapon) && (
                      <span className={`text-xs px-1 py-0.5 rounded bg-gray-700 ${getEnhancementRank(player.weapon)!.color}`}>
                        {getEnhancementRank(player.weapon)!.text}
                      </span>
                    )}
                    {player.weapon.damage && <span className="text-red-400">+{player.weapon.damage}</span>}
                    <span className={`text-xs px-2 py-1 rounded ${
                      player.weapon.rarity === 'legendary' ? 'bg-orange-600' :
                      player.weapon.rarity === 'rare' ? 'bg-purple-600' :
                      player.weapon.rarity === 'uncommon' ? 'bg-blue-600' :
                      'bg-gray-600'
                    }`}>
                      {player.weapon.rarity}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300">{player.weapon.description}</div>
                  <button
                    onClick={() => unequipItem('weapon')}
                    className="text-xs text-red-400 hover:text-red-300 mt-1"
                  >
                    Unequip
                  </button>
                </div>
              ) : (
                <div className="text-gray-500">None equipped</div>
              )}
            </div>
            <div className="bg-gray-800 p-3 rounded border border-gray-600">
              <div className="text-sm text-gray-400 mb-1">Armor</div>
              {player.armor ? (
                <div className="text-white">
                  <div className="font-semibold flex items-center gap-2">
                    <span>🛡️</span>
                    <span>{formatItemName(player.armor)}</span>
                    {getEnhancementRank(player.armor) && (
                      <span className={`text-xs px-1 py-0.5 rounded bg-gray-700 ${getEnhancementRank(player.armor)!.color}`}>
                        {getEnhancementRank(player.armor)!.text}
                      </span>
                    )}
                    {player.armor.defense && <span className="text-blue-400">+{player.armor.defense}</span>}
                    <span className={`text-xs px-2 py-1 rounded ${
                      player.armor.rarity === 'legendary' ? 'bg-orange-600' :
                      player.armor.rarity === 'rare' ? 'bg-purple-600' :
                      player.armor.rarity === 'uncommon' ? 'bg-blue-600' :
                      'bg-gray-600'
                    }`}>
                      {player.armor.rarity}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300">{player.armor.description}</div>
                  <button
                    onClick={() => unequipItem('armor')}
                    className="text-xs text-red-400 hover:text-red-300 mt-1"
                  >
                    Unequip
                  </button>
                </div>
              ) : (
                <div className="text-gray-500">None equipped</div>
              )}
            </div>
            <div className="bg-gray-800 p-3 rounded border border-gray-600">
              <div className="text-sm text-gray-400 mb-1">Aura</div>
              {player.aura ? (
                <div className="text-white">
                  <div className="font-semibold flex items-center gap-2">
                    <span>✨</span>
                    <span>{formatItemName(player.aura)}</span>
                    {getEnhancementRank(player.aura) && (
                      <span className={`text-xs px-1 py-0.5 rounded bg-gray-700 ${getEnhancementRank(player.aura)!.color}`}>
                        {getEnhancementRank(player.aura)!.text}
                      </span>
                    )}
                    <div className="flex gap-1">
                      {player.aura.healthBonus && <span className="text-red-400">+{player.aura.healthBonus}❤️</span>}
                      {player.aura.experienceBonus && <span className="text-green-400">+{player.aura.experienceBonus}%XP</span>}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      player.aura.rarity === 'legendary' ? 'bg-orange-600' :
                      player.aura.rarity === 'rare' ? 'bg-purple-600' :
                      player.aura.rarity === 'uncommon' ? 'bg-blue-600' :
                      'bg-gray-600'
                    }`}>
                      {player.aura.rarity}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300">{player.aura.description}</div>
                  <button
                    onClick={() => unequipItem('aura')}
                    className="text-xs text-red-400 hover:text-red-300 mt-1"
                  >
                    Unequip
                  </button>
                </div>
              ) : (
                <div className="text-gray-500">None equipped</div>
              )}
            </div>
          </div>
        </div>

        {/* Inventory Items */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Items ({player.inventory.length}/{player.inventorySize})
          </h3>
          {player.inventory.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              Your inventory is empty
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {sortItems(player.inventory).map(({ item, index }) => (
                <div
                  key={index}
                  onClick={() => handleItemClick(item, index)}
                  onMouseEnter={() => setHoveredItem(index)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`p-3 rounded cursor-pointer transition-all relative ${
                    selectedItems.includes(index) 
                      ? 'bg-purple-900 border-purple-400' 
                      : 'bg-gray-800 hover:bg-gray-700 border-gray-600'
                  } border ${hoveredItem === index ? 'scale-105 shadow-lg' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span>{getItemTypeIcon(item.type)}</span>
                        <span>{item.symbol}</span>
                        <span>{formatItemName(item)}</span>
                        {getEnhancementRank(item) && (
                          <span className={`text-xs px-2 py-1 rounded bg-gray-700 ${getEnhancementRank(item)!.color}`}>
                            {getEnhancementRank(item)!.text}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded ${
                          item.rarity === 'legendary' ? 'bg-orange-600' :
                          item.rarity === 'rare' ? 'bg-purple-600' :
                          item.rarity === 'uncommon' ? 'bg-blue-600' :
                          'bg-gray-600'
                        }`}>
                          {item.rarity}
                        </span>
                      </div>
                      
                      {/* Hover Stats Expansion */}
                      {hoveredItem === index && (
                        <div className="mt-2 p-2 bg-gray-700 rounded border border-gray-500">
                          <div className="text-sm text-gray-300 mb-1">{item.description}</div>
                          <div className="flex gap-3 text-sm">
                            {item.damage && <span className="text-red-400">🔥 +{item.damage} Attack</span>}
                            {item.defense && <span className="text-blue-400">🛡️ +{item.defense} Defense</span>}
                            {item.healthBonus && <span className="text-red-400">❤️ +{item.healthBonus} Health</span>}
                            {item.experienceBonus && <span className="text-green-400">⭐ +{item.experienceBonus}% XP</span>}
                            {item.healingPower && <span className="text-green-400">❤️ Heals {item.healingPower}</span>}
                          </div>
                        </div>
                      )}

                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUseOrEquip(item, index);
                        }}
                        className="text-xs text-green-400 hover:text-green-300 px-2 py-1 bg-green-900 bg-opacity-30 rounded"
                      >
                        {item.type === 'consumable' ? 'Use' : 'Equip'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(index);
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-6 text-sm text-gray-400 text-center">
          Click items to select • Use action buttons • Select 2 items to merge • Press I to close
        </div>
      </div>
    </div>
  );
};

export default Inventory;
