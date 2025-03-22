/**
Carbalite Ore 
Monster Bone Large
Machalite Ore 
Monster Keenbone
Dragonite Ore 
Monster Hardbone
Fucium Ore 
Ancient Bone
Quality Bone 
Boulder Bone
Monster Bone
Small Dragonvein Crystal
Monster Bone 
Medium Wingdrake Hide
*/

export type Loot = {
  tags: string[];
};

export type LootTable = Record<string, Loot>;

export const defaultLoot = {
  "Carbalite Ore": { tags: ["Basic", "Ore"] },
  "Monster Bone Large": { tags: ["Basic", "Bone"] },
  "Machalite Ore": { tags: ["Basic", "Ore"] },
  "Monster Keenbone": { tags: ["Basic", "Bone"] },
  "Dragonite Ore": { tags: ["Basic", "Ore"] },
  "Monster Hardbone": { tags: ["Basic", "Bone"] },
  "Fucium Ore": { tags: ["Basic", "Ore"] },
  "Ancient Bone": { tags: ["Basic", "Bone"] },
  "Quality Bone": { tags: ["Basic", "Bone"] },
  "Boulder Bone": { tags: ["Basic", "Bone"] },
  "Monster Bone": { tags: ["Basic", "Bone"] },
  "Small Dragonvein Crystal": { tags: ["Basic", "Ore"] },
  "Medium Wingdrake Hide": { tags: ["Basic", "Hide"] },
  "Potions": { tags: ["Consumable"] },
} as const satisfies LootTable;
