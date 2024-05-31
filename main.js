require('CreepGeneratorManager')

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
let roleMiner = require('role.Miner');
let roleHealer = require('role.Healer');
let roleAttacker = require('role.Attacker');
let roleColonizer = require('role.Colonizer');

const roomData = {
    'W59S4': {
        'name': 'W59S4',
        'factory': RESOURCE_ZYNTHIUM_BAR,
        'spawner': `Xel'Invictus Primus`,
        'creepCounts': {
            'harvester': Memory.rooms['W59S4'].sourceIDs.length,
            // 'repairer': Math.max(1, Memory.rooms['W59S4'].damagedStructures.length / 20),
            'upgrader': 1,
            'builder': 0,
            'hauler': 1,
            'collector': 1,
            'tombraider': 1,
            // 'supplier': 1,
            // 'defender': 1,
            // 'ranger': 1,
            // 'claimer': 1,
            'manager': 1,
            'carrier': 0,
            // 'miner': 1,
            // 'healer': 1,
            // 'attacker': 1,
            // Add more roles and counts as needed for the Room
        },
        'walls': 30000,
        'ramparts': 30000,
    },
    'W59S5': {
        'name': 'W59S5',
        'factory': '',
        'spawner': `Xel'Hydrogenius`,
        'creepCounts': {
            'harvester': Memory.rooms['W59S5'].sourceIDs.length,
            'upgrader': 1,//Math.max(1, Game.rooms['W59S5'].storage.store[RESOURCE_ENERGY] / 100000),
            'builder': 0,
            'hauler': 1,
            'collector': 1,
            'tombraider': 1,
            'manager': 1,
            // 'carrier': 0,
            // Add more roles and counts as needed for the Room
        },
        'walls': 30000,
        'ramparts': 30000,
    },
    'W59S3': {
        'name': 'W59S3',
        'factory': RESOURCE_LEMERGIUM_BAR,
        'spawner': `Xel'Aurelius Primus`,
        'creepCounts': {
            'harvester': Memory.rooms['W59S3'].sourceIDs.length,
            'hauler': 1,
            'upgrader': 3,//Math.max(1, Math.round(Game.rooms['W59S3'].storage.store[RESOURCE_ENERGY] / 100000)),
            'builder': 0,
            'collector': 1,
            'tombraider': 1,
            'manager': 1,
            'carrier': 0,
            // 'colonizer': 2,
        },
        'walls': 40000,
        'ramparts': 30000,
    },
    'W59S7': {
        'name': 'W59S7',
        'spawner': `Xel'Gildeon Primus`,
        'creepCounts': {
            'harvester': Memory.rooms['W59S7'].sourceIDs.length,
            'upgrader': 3,//Math.max(1, Math.round(Game.rooms['W59S3'].storage.store[RESOURCE_ENERGY] / 100000)),
            'hauler': 2,
            // 'builder': 2,
            'tombraider': 3,
            'collector': 3,

        },
        'walls': 500,
        'ramparts': 800,
    },
    // Add more rooms as needed
};

/**
 * Entry point to All Scripts
 */
module.exports.loop = function () {
    //Creeps and Roles Initializer
    for (let roomName in roomData) {
        BuildCreepsForRoom(roomData[roomName]);
    }
    CreepDrivers()
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

    //ProcessDrivers
    ProcessLinkTransfer();
    ProcessReaction_OH();
    ProcessReaction_ZH20();
    for (let roomName in roomData) {
        //MemoryDrivers
        MemoriseDamagedStructures(roomName);
        MemoriseConstructionSites(roomName);
        MemoriseSources(roomName);

        //StructureDrivers
        FactoryDriver(Game.rooms[roomName]);
        TowerDriver(Game.rooms[roomName]);
    }

    //Market Interface
    Game.market.deal('', 1700, 'W59S5');
    // Game.getObjectById('6644e2f8ce89aa5adf869f8b').send(RESOURCE_ENERGY, 22000, 'W59S5');

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
        'miner': roleMiner,
        'healer': roleHealer,
        'attacker': roleAttacker,
        'colonizer': roleColonizer,
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
function MemoriseDamagedStructures(roomName) {
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

/**
 * Finds and puts in memory all Construction sites in the rooms I own.
 */
function MemoriseConstructionSites(roomName) {
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

/**
 * Gathers all Source IDs, including Mineral Deposits that have Extractor constructed and are not Regenerating.
 */
function MemoriseSources(roomName) {
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

/**
 * Handles Energy-transfers between Links. Storage and Controller Links being special cases.
 * It is based on defined room in the RoomData Object as the Owned Room may have neither Link nor Storage.
 */
function ProcessLinkTransfer() {
    for (let roomName in roomData) {
        let room = Game.rooms[roomName];
        if (room.controller.level >= 5) {
            //Find all the Links
            let links = room.find(FIND_MY_STRUCTURES, {
                filter: structure => structure.structureType === STRUCTURE_LINK
            });

            // Find the closest Link to Storage
            let closestLinkToStorage;
            try {
                closestLinkToStorage = room.storage.pos.findInRange(links, 2);
                links = _.without(links, closestLinkToStorage[0]);
            } catch (error) {
                console.log(`${room.name} - S - ${closestLinkToStorage}`);
            }

            //Find the closest Link to Controller
            let closestLinkToController;
            try {
                closestLinkToController = room.controller.pos.findInRange(links, 3);
                links = _.without(links, closestLinkToController[0]);
            } catch (error) {
                console.log(`${room.name} - C - ${closestLinkToController[0].id}`);
            }

            //Cycle through the non-special Links and transfer Energy
            for (let link of links) {
                if (closestLinkToController && closestLinkToController.length > 0 && closestLinkToController[0].energy === 0 && link.energy === 800) {
                    room.visual.line(link.pos.x, link.pos.y, closestLinkToController[0].pos.x, closestLinkToController[0].pos.y, {
                        color: 'green',
                        lineStyle: 'dashed'
                    });
                    link.transferEnergy(closestLinkToController[0]);
                } else if (closestLinkToStorage && closestLinkToStorage.length > 0 && closestLinkToStorage[0].energy === 0 && link.energy === 800) {
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

/**
 * FactoryDriver function runs the factory in every room based on the resources it is selected to sell.
 * @param room
 */
function FactoryDriver(room) {
    let factory = room.find(FIND_MY_STRUCTURES, {
        filter: structure => structure.structureType === STRUCTURE_FACTORY
    });
    if (factory.length > 0) {
        let product = roomData[room.name].factory
        if (factory[0].produce(product) === OK) {
            console.log(`Production of ${product} successful.`);
        } else if (factory[0].cooldown > 0) {
            // console.log("Error: FactoryDriver on Cooldown");
        } else {
            // console.log("Error: Something went Wrong");
        }
    }
}

/**
 * Operates Towers for every given room
 * @param room
 */
function TowerDriver(room) {
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
                    Reinforce(towers[s], roomData[room.name].walls, roomData[room.name].ramparts);
                }
            }
        }
    }
}