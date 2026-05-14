const DIRECTIONS = ['north', 'south', 'east', 'west'];
const OPPOSITES = { north: 'south', south: 'north', east: 'west', west: 'east' };

export function generateFloor(floorLevel, rng, templateProvider) {
  const roomCount = 5 + floorLevel * 3;
  const rooms = {};
  const roomIds = [];

  // Create entrance
  const entranceId = `f${floorLevel}_r0`;
  rooms[entranceId] = makeRoom(entranceId, 'entrance', floorLevel, rng, templateProvider);
  roomIds.push(entranceId);

  // Generate rooms via branching random walk
  const frontier = [entranceId];
  let roomNum = 1;

  while (roomIds.length < roomCount && frontier.length > 0) {
    const parentId = rng.pick(frontier);
    const parent = rooms[parentId];
    const usedDirs = Object.keys(parent.exits);
    const freeDirs = DIRECTIONS.filter(d => !usedDirs.includes(d));

    if (freeDirs.length === 0) {
      frontier.splice(frontier.indexOf(parentId), 1);
      continue;
    }

    const dir = rng.pick(freeDirs);
    const newId = `f${floorLevel}_r${roomNum++}`;

    // Determine room type
    let type = 'corridor';
    if (roomIds.length === roomCount - 1) {
      type = 'stairs';
    } else if (roomIds.length === Math.floor(roomCount / 2)) {
      type = 'safe';
    } else if (roomIds.length === Math.floor(roomCount * 0.7) && floorLevel > 1) {
      type = 'shop';
    } else if (rng.next() < 0.4) {
      type = 'chamber';
    }

    const room = makeRoom(newId, type, floorLevel, rng, templateProvider);

    // Link rooms
    parent.exits[dir] = newId;
    room.exits[OPPOSITES[dir]] = parentId;

    // Occasionally add cross-links for non-linear layout
    if (rng.next() < 0.2 && roomIds.length > 2) {
      const linkTarget = rng.pick(roomIds.filter(id => id !== parentId && id !== newId));
      const linkRoom = rooms[linkTarget];
      const linkFreeDirs = DIRECTIONS.filter(d => !Object.keys(linkRoom.exits).includes(d));
      const newFreeDirs = DIRECTIONS.filter(d => !Object.keys(room.exits).includes(d));
      if (linkFreeDirs.length > 0 && newFreeDirs.length > 0) {
        const ld = rng.pick(linkFreeDirs);
        room.exits[OPPOSITES[ld] in room.exits ? rng.pick(newFreeDirs) : OPPOSITES[ld]] = linkTarget;
        linkRoom.exits[ld] = newId;
      }
    }

    rooms[newId] = room;
    roomIds.push(newId);
    frontier.push(newId);
  }

  // Place enemies in non-special rooms
  for (const id of roomIds) {
    const room = rooms[id];
    if (['entrance', 'safe', 'shop'].includes(room.type)) continue;
    if (room.type === 'stairs') {
      room.enemies = templateProvider.generateBoss(floorLevel, rng);
      room.isBoss = true;
    } else if (rng.next() < 0.65) {
      room.enemies = templateProvider.generateEnemies(floorLevel, rng);
    }
  }

  // Place items in some rooms
  for (const id of roomIds) {
    const room = rooms[id];
    if (room.type === 'entrance' || room.type === 'stairs') continue;
    if (rng.next() < 0.2) {
      room.items = templateProvider.generateRoomItems(floorLevel, rng);
    }
  }

  return {
    level: floorLevel,
    rooms,
    roomIds,
    entranceId,
    stairsId: roomIds.find(id => rooms[id].type === 'stairs') || roomIds[roomIds.length - 1],
  };
}

function makeRoom(id, type, floorLevel, rng, tp) {
  const tmpl = tp.getRoomTemplate(type, floorLevel, rng);
  return {
    id,
    type,
    title: tmpl.title,
    description: tmpl.description,
    exits: {},
    enemies: [],
    items: [],
    visited: false,
    cleared: false,
    isBoss: false,
    shopItems: type === 'shop' ? tp.generateShopItems(floorLevel, rng) : [],
  };
}

export function generateDungeon(totalFloors, rng, templateProvider) {
  const floors = [];
  for (let i = 1; i <= totalFloors; i++) {
    floors.push(generateFloor(i, rng, templateProvider));
  }
  return {
    floors,
    currentFloor: 0,
    currentRoom: floors[0].entranceId,
    totalRooms: floors.reduce((s, f) => s + f.roomIds.length, 0),
  };
}

export function getCurrentRoom(dungeon) {
  return dungeon.floors[dungeon.currentFloor].rooms[dungeon.currentRoom];
}

export function moveRoom(dungeon, direction) {
  const room = getCurrentRoom(dungeon);
  const targetId = room.exits[direction];
  if (!targetId) return null;

  dungeon = {
    ...dungeon,
    floors: dungeon.floors.map((f, i) => i === dungeon.currentFloor ? {
      ...f,
      rooms: { ...f.rooms }
    } : f),
  };

  const floor = dungeon.floors[dungeon.currentFloor];
  floor.rooms[targetId] = { ...floor.rooms[targetId], visited: true };
  dungeon.currentRoom = targetId;
  return dungeon;
}

export function moveToNextFloor(dungeon) {
  if (dungeon.currentFloor + 1 >= dungeon.floors.length) return null;
  dungeon = { ...dungeon, currentFloor: dungeon.currentFloor + 1 };
  const floor = dungeon.floors[dungeon.currentFloor];
  dungeon.currentRoom = floor.entranceId;
  floor.rooms[floor.entranceId] = { ...floor.rooms[floor.entranceId], visited: true };
  return dungeon;
}

export function markCleared(dungeon) {
  dungeon = {
    ...dungeon,
    floors: dungeon.floors.map((f, i) => i === dungeon.currentFloor ? {
      ...f,
      rooms: {
        ...f.rooms,
        [dungeon.currentRoom]: { ...f.rooms[dungeon.currentRoom], cleared: true, enemies: [] }
      }
    } : f),
  };
  return dungeon;
}

export function getExplorationPercent(dungeon) {
  let visited = 0;
  for (const floor of dungeon.floors) {
    for (const id of floor.roomIds) {
      if (floor.rooms[id].visited) visited++;
    }
  }
  return Math.round((visited / dungeon.totalRooms) * 100);
}
