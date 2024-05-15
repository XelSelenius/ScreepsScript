const _ = require('lodash');
let roleHarvester = require('role.Harvester');
let roleUpgrader = require('role.Upgrader');
let roleBuilder = require('role.Builder');
let roleHauler = require('role.Hauler');
let roleRepairer = require('role.Repairer');
let roleCollector = require('role.Collector');
let roleSupplier = require('role.Supplier');
let roleClaimer = require('role.Claimer');
let roleDefender = require('role.Defender');
let roleTombraider = require('role.Tombraider');
let roleRanger = require('role.Ranger');
let roleCarrier = require('role.Carrier');
let roleManager = require('role.Manager');

const roomData = {
    'W59S4': {
        'factory': RESOURCE_ZYNTHIUM_BAR,
        'spawner': 'Xel\'Invictus Primus',
        'creepCounts': {
            'harvester': Memory.rooms['W59S4'].sourceIDs.length,
            // 'repairer': Math.max(1, Memory.rooms['W59S4'].damagedStructures.length / 20),
            'upgrader': 1,
            'builder': 0,
            'hauler': 1,
            'collector': 1,
            'tombraider': 1,
            // 'defender': 1,
            // 'ranger': 1,
            // 'claimer': 1,
            'manager': 1,
            'carrier': 0,
            // Add more roles and counts as needed for the Room
        }
    },
    'W59S5': {
        'spawner': `Xel'Hydrogenius`,
        'creepCounts': {
            'harvester': Memory.rooms['W59S5'].sourceIDs.length,
            'upgrader': 1,//Math.max(1, Game.rooms['W59S5'].storage.store[RESOURCE_ENERGY] / 100000),
            'builder': 0,
            'hauler': 1,
            'collector': 1,
            'tombraider': 1,
            'manager': 1,
            'carrier': 2,
            // Add more roles and counts as needed for the Room
        }
    },
    'W59S3': {
        'spawner': `Xel'Aurelius Primus`,
        'creepCounts': {
            'harvester': Memory.rooms['W59S3'].sourceIDs.length,
            'hauler': 1,
            'upgrader': 2,//Math.max(1, Math.round(Game.rooms['W59S3'].storage.store[RESOURCE_ENERGY] / 100000)),
            'builder': 3,
            'collector': 1,
            'tombraider': 1,
            'manager': 1,
            'carrier': 0,
        },
    },
    // Add more rooms as needed
};

const BodyPartsRenderer = {
    'minor-harvester': [WORK, WORK, CARRY, MOVE],
    'lesser-harvester': [WORK, WORK, WORK, CARRY, MOVE],
    'greater-harvester': [WORK, WORK, WORK, WORK, CARRY, MOVE],
    'harvester': [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE],

    'minor-repairer': [WORK, CARRY, MOVE, MOVE],
    'lesser-repairer': [WORK, CARRY, CARRY, MOVE, MOVE],
    'greater-repairer': [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
    'repairer': [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],

    'minor-upgrader': [WORK, CARRY, MOVE, MOVE],
    'lesser-upgrader': [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
    'greater-upgrader': [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE],
    'upgrader': [WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE],

    'minor-builder': [WORK, CARRY, MOVE, MOVE],
    'lesser-builder': [WORK, WORK, CARRY, MOVE, MOVE],
    'greater-builder': [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
    'builder': [WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],

    'minor-collector': [CARRY, CARRY, MOVE, MOVE],
    'lesser-collector': [CARRY, CARRY, MOVE, MOVE],
    'greater-collector': [CARRY, CARRY, MOVE, MOVE],
    'collector': [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE],


    'minor-hauler': [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
    'lesser-hauler': [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
    'greater-hauler': [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
    'hauler': [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],

    'manager': [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],

    'minor-tombraider': [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
    'lesser-tombraider': [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
    'tombraider': [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],

    'carrier': [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
    'defender': [MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK],
    'ranger': [TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK],
    'supplier': [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
    'claimer': [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE],
}

/**
 * Entry point to All Scripts
 */
module.exports.loop = function () {
    //Creeps and Roles Initializer
    for (let roomName in roomData) {
        BuildCreepsForRoom(roomName);
    }
    CreepDrivers()
}

/**
 * Universal Creep Builder
 * @param role
 * @param bodyParts
 * @param roleName
 * @param creepCounter
 * @param spawner
 */
function BuildCreep(role, bodyParts, roleName, creepCounter, spawner) {
    let room = Game.spawns[spawner].room; // Get the room where the spawner is located
    let creepsOfType = room.find(FIND_MY_CREEPS, {
        filter: (creep) => creep.memory.role === role
    });
    if (creepsOfType && creepsOfType.length < creepCounter) {
        let newName = roleName + Game.time;
        console.log(`Spawning new ${roleName} in ${spawner}: ${newName}`);
        Game.spawns[spawner].spawnCreep(bodyParts, newName, {memory: {role: role}});
    }
}

/**
 * Room-Based Initializer of BuildCreep
 * @param roomName
 */
function BuildCreepsForRoom(roomName) {
    const room = roomData[roomName];
    const spawner = room.spawner;
    for (let role in room.creepCounts) {
        const roleByController = getCreepBodyParts(role, Game.rooms[roomName].controller.level);
        const bodyParts = BodyPartsRenderer[roleByController];
        const creepCounter = room.creepCounts[role];
        BuildCreep(role, bodyParts, role.charAt(0).toUpperCase() + role.slice(1), creepCounter, spawner);
    }

    //Say what you build, Spawner
    if (spawner && Game.spawns[spawner].spawning) {
        let spawningCreep = Game.creeps[Game.spawns[spawner].spawning.name];
        Game.spawns[spawner].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns[spawner].pos.x + 1,
            Game.spawns[spawner].pos.y,
            {align: 'left', opacity: 0.8});
    }
}

function getCreepBodyParts(role, controllerLevel) {
    // Retrieve body parts based on role and controller level
    switch (controllerLevel) {
        case 1:
            return role = "minor" + '-' + role;
        case 2:
            return role = "lesser" + '-' + role;
        // case 4:
        //     return role = "greater" + '-' + role;
        default:
            return role;
    }
}

/**
 * Initializes the roles of each creep post creation
 */
function CreepDrivers() {
    //Clean Memory from Dead Creeps
    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    //Define Memory Data
    getDamagedStructures();
    getConstructionSites();
    getSources();
    getLinkTransfer();

    for (let roomName in roomData) {
        Factory(Game.rooms[roomName]);
        Tower(Game.rooms[roomName]);
    }

    //Market Interface
    Game.market.deal('', 1000, 'W59S4');

    let powerSpawn = Game.getObjectById("66371beb7929396fee3bc5d4")
    if (powerSpawn.store[RESOURCE_ENERGY] > 0 && powerSpawn.store[RESOURCE_POWER] > 0) {
        powerSpawn.processPower();
    }

    // Define a mapping of roles to role functions
    const roleFunctions = {
        'harvester': roleHarvester,
        'upgrader': roleUpgrader,
        'builder': roleBuilder,
        'hauler': roleHauler,
        'repairer': roleRepairer,
        'collector': roleCollector,
        'supplier': roleSupplier,
        'claimer': roleClaimer,
        'defender': roleDefender,
        'tombraider': roleTombraider,
        'ranger': roleRanger,
        'carrier': roleCarrier,
        'manager': roleManager,
    };

    // Initialize the Role of each Creep
    for (let name in Game.creeps) {
        let creep = Game.creeps[name];
        let roleFunction = roleFunctions[creep.memory.role];
        if (roleFunction) {
            roleFunction.run(creep);
        }
    }
}

/**
 * Check Room memory for Damaged structures. If non, find all, order them by hit points lost and set in memory.
 */
function getDamagedStructures() {
    for (let roomName in roomData) {
        // Ensure Memory.rooms[roomName] is initialized as an object
        Memory.rooms[roomName] = Memory.rooms[roomName] || {};

        // Check if the room is visible
        if (Game.rooms[roomName]) {
            let room = Game.rooms[roomName];
            let damagedStructures = room.find(FIND_STRUCTURES, {
                filter: structure => {
                    return structure.hits < structure.hitsMax
                        && structure.structureType !== STRUCTURE_WALL
                        && structure.structureType !== STRUCTURE_RAMPART;
                }
            });

            // Store the list of damaged structure IDs in Memory
            Memory.rooms[roomName].damagedStructures = _.map(damagedStructures, 'id');
        } else {
            console.log(`No visibility into room ${roomName}`);
        }
    }
}

/**
 * Finds and puts in memory all Construction sites in the rooms I own.
 */
function getConstructionSites() {
    for (let roomName in roomData) {
        // Ensure Memory.rooms[roomName] is initialized as an object
        Memory.rooms[roomName] = Memory.rooms[roomName] || {};

        // Check if constructionSites array is not defined or empty
        if (!Memory.rooms[roomName].constructionSites || Memory.rooms[roomName].constructionSites.length === 0) {
            // Check if the room is visible
            if (Game.rooms[roomName]) {
                let room = Game.rooms[roomName];
                let sites = room.find(FIND_CONSTRUCTION_SITES);
                if (sites && sites.length > 0) {
                    // Store the list of construction site IDs in Memory
                    Memory.rooms[roomName].constructionSites = sites.map(site => site.id);
                }
            } else {
                console.log(`No visibility into room ${roomName}`);
            }
        }
    }
}

/**
 * Gathers all Source IDs, including Mineral Deposits that have Extractor constructed and are not Regenerating.
 */
function getSources() {
    for (let roomName in roomData) {
        //Get the Room Object from the name.
        let room = Game.rooms[roomName];

        //Through the Room Object find the sources needed.
        let sources = room.find(FIND_SOURCES);
        let mineral = room.find(FIND_MINERALS, {
            filter: mineral => {
                let extractor = mineral.pos.lookFor(LOOK_STRUCTURES).find(structure => structure.structureType === STRUCTURE_EXTRACTOR);
                return extractor && mineral.ticksToRegeneration === undefined; // Exclude respawning minerals
            }
        })[0];

        // Concatenate sources and mineral into one array
        let allSources = [...sources, mineral].filter(Boolean); // Filter out any undefined values

        // Map the IDs of all sources to Memory and print to Console
        Memory.rooms[roomName].sourceIDs = allSources.map(source => source.id);
        // console.log(`Sources Count [${roomName}]: ${Memory.rooms[roomName].sourceIDs.length}`)
    }
}

/**
 * Automatically transfers the Energy within the Link to the Receiving Link at the Storage.
 * It is based on defined room in the RoomData Object as the Owned Room may have neither Link nor Storage.
 */
function getLinkTransfer() {
    for (let roomName in roomData) {
        let room = Game.rooms[roomName];
        if (room.controller.level >= 5) {
            //find the links
            let links = room.find(FIND_MY_STRUCTURES, {
                filter: structure => structure.structureType === STRUCTURE_LINK
            });

            // Find the closest link to storage
            let closestLinkToStorage = room.storage.pos.findInRange(links, 2);
            links = _.without(links, closestLinkToStorage[0]);
            // console.log(`${room.name} - S - ${closestLinkToStorage.id}`);

            //Find the closest link to controller
            let closestLinkToController = room.controller.pos.findInRange(links, 3);
            links = _.without(links, closestLinkToController[0]);
            // console.log(`${room.name} - C - ${closestLinkToController[0].id}`);

            if (roomName === 'W59S5') {
                closestLinkToStorage[0].transferEnergy(closestLinkToController[0]);
            } else {
                for (let link of links) {
                    if (closestLinkToController.length > 0 && closestLinkToController[0].energy === 0 && link.energy === 800) {
                        room.visual.line(link.pos.x, link.pos.y, closestLinkToController[0].pos.x, closestLinkToController[0].pos.y, {
                            color: 'green',
                            lineStyle: 'dashed'
                        });
                        link.transferEnergy(closestLinkToController[0]);
                    } else if (closestLinkToStorage.length > 0 && closestLinkToStorage[0].energy === 0 && link.energy === 800) {
                        room.visual.line(link.pos.x, link.pos.y, closestLinkToStorage[0].pos.x, closestLinkToStorage[0].pos.y, {
                            color: 'blue',
                            lineStyle: 'dashed'
                        });
                        link.transferEnergy(closestLinkToStorage[0]);
                    }
                }
            }
        }
    }
}

/**
 * Factory function runs the factory in every room based on the resources it is selected to sell.
 * @param room
 */
function Factory(room) {
    let factory = room.find(FIND_MY_STRUCTURES, {
        filter: structure => structure.structureType === STRUCTURE_FACTORY
    });
    if (factory.length > 0) {
        let product = roomData[room.name].factory
        if (factory[0].produce(product) === OK) {
            console.log(`Production of ${product} successful.`);
        } else if (factory[0].cooldown > 0) {
            console.log("Error: Factory on Cooldown");
        } else {
            // console.log("Error: Something went Wrong");
        }
    }
}

/**
 * Operates Towers for every given room
 * @param room
 */
function Tower(room) {
    // Find the towers in the room
    let towers = room.find(FIND_MY_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_TOWER
    });

    // Find the enemy creep in the room
    let enemies = room.find(FIND_HOSTILE_CREEPS);

    // If Towers exist, use them for something
    if (towers.length > 0) {
        for (let s = 0; s < towers.length; s++) {
            // Conduct Attack on Existing Enemies as Primary Priority
            if (enemies && enemies.length > 0) {
                towers[s].attack(enemies[0]);

                // Conduct Repairs as Secondary Priority
            } else if (Memory.rooms[room.name].damagedStructures.length >= 0) {
                let structure = Game.getObjectById(Memory.rooms[room.name].damagedStructures[s]);
                if (structure) {
                    towers[s].repair(structure);
                    if (structure.hits === structure.hitsMax) {
                        Memory.rooms[room.name].damagedStructures = _.without(Memory.rooms[room.name].damagedStructures, structure.id);
                    }
                } else {
                    //Conduct Reinforcement of Defences as Ternary Priority
                    Reinforce(towers[s])
                }
            }
        }
    }
}

/**
 * Get Count of all creepers through the Console
 */
global.GroupCreepsByRole = function () {
    // Initialize an object to store the count of creeps for each role
    let creepCountByRole = {};

    // Iterate over all creeps in the game
    for (let creepName in Game.creeps) {
        let creep = Game.creeps[creepName];

        // Check if the creep has a role property
        if (creep.memory.role) {
            // Increment the count for the respective role
            creepCountByRole[creep.memory.role] = (creepCountByRole[creep.memory.role] || 0) + 1;
        }
    }

    // Print the count for each role
    for (let role in creepCountByRole) {
        console.log(`${role}: ${creepCountByRole[role]}`);
    }
}