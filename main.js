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
    'W59S3': {
        'name': 'W59S3',
        'factory': '6644e536d2fc54b57f935a27',// Game.getObjectById('6644e536d2fc54b57f935a27'),
        'product': RESOURCE_OXIDANT,
        'ingredients': [
            // [RESOURCE_OXYGEN, 500],
        ],
        'spawner': `Xel'Aurelius Primus`,
        'creepCounts': {
            'harvester': Memory.rooms['W59S3'].sourceIDs.length,
            'hauler': 1,
            'upgrader': 1,//Math.max(1, Math.round(Game.rooms['W59S3'].storage.store[RESOURCE_ENERGY] / 100000)),
            'builder': 0,
            'collector': 1,
            'tombraider': 1,
            'manager': 1,
            'carrier': 0,
            // 'colonizer': 2,
        },
        'storage': {
            [RESOURCE_ZYNTHIUM]: 10000,
            [RESOURCE_LEMERGIUM]: 10000,
            [RESOURCE_UTRIUM]: 10000,
            [RESOURCE_KEANIUM]: 10000,
            [RESOURCE_OXYGEN]: 10000,
            [RESOURCE_HYDROGEN]: 10000,
            [RESOURCE_CATALYST]: 10000,
            [RESOURCE_OPS]: 10000,
        },
        'walls': 3000000,
        'ramparts': 5000000,
    },
    'W59S4': {
        'name': 'W59S4',
        'factory': '65d71e80e4219d254f628572',
        'product': RESOURCE_ZYNTHIUM_BAR,
        'ingredients': [
            // [RESOURCE_ZYNTHIUM, 500],
            // [RESOURCE_ZYNTHIUM_BAR, 500],
            // [RESOURCE_METAL, 500],
            // [RESOURCE_ENERGY,500]
        ],
        'spawner': `Xel'Invictus Primus`,
        'creepCounts': {
            'harvester': Memory.rooms['W59S4'].sourceIDs.length,
            'upgrader': 1,
            'builder': 0,
            'hauler': 2,
            'collector': 1,
            'tombraider': 1,
            'supplier': 1,
            'manager': 1,
            'miner': 0,
            'healer': 0,
            'attacker': 0,
            // Add more roles and counts as needed for the Room
        },
        'reactions': {
            'Lab1': RESOURCE_OXYGEN,
            'Lab2': RESOURCE_HYDROGEN,
            'Reaction1': RESOURCE_HYDROXIDE,
            'Lab3': RESOURCE_GHODIUM_OXIDE,
            'Lab4': RESOURCE_HYDROXIDE,
            'Reaction2': RESOURCE_GHODIUM_ALKALIDE,
            'Lab5': RESOURCE_CATALYST,
            'Lab6': RESOURCE_GHODIUM_ALKALIDE,
            'Reaction3_1': RESOURCE_CATALYZED_GHODIUM_ALKALIDE,
            'Reaction3_2': RESOURCE_CATALYZED_GHODIUM_ALKALIDE,
        },
        'storage': {
            [RESOURCE_ZYNTHIUM]: 10000,
            [RESOURCE_LEMERGIUM]: 10000,
            [RESOURCE_UTRIUM]: 10000,
            [RESOURCE_KEANIUM]: 10000,
            [RESOURCE_OXYGEN]: 10000,
            [RESOURCE_HYDROGEN]: 10000,
            [RESOURCE_CATALYST]: 10000,
            [RESOURCE_HYDROXIDE]: 10000,
            [RESOURCE_OPS]: 10000,
        },
        'walls': 2000000,
        'ramparts': 5000000,
    },
    'W59S5': {
        'name': 'W59S5',
        'factory': '664b79b94d45cc3937de4f09',//Game.getObjectById('664b79b94d45cc3937de4f09'),
        'product': RESOURCE_GHODIUM_MELT,
        'ingredients': [
            // [RESOURCE_GHODIUM, 500],
        ],
        'spawner': `Xel'Hydrogenius Primus`,
        'creepCounts': {
            'harvester': Memory.rooms['W59S5'].sourceIDs.length,
            'upgrader': 1,//Math.max(1, Game.rooms['W59S5'].storage.store[RESOURCE_ENERGY] / 100000),
            'builder': 0,
            'hauler': 1,
            'collector': 0,
            'tombraider': 1,
            'manager': 1,
            'supplier': 0,
            // Add more roles and counts as needed for the Room
        },
        'reactions': {
            'Lab1': RESOURCE_ZYNTHIUM,
            'Lab2': RESOURCE_KEANIUM,
            'Reaction1': RESOURCE_ZYNTHIUM_KEANITE,
            'Lab3': RESOURCE_UTRIUM,
            'Lab4': RESOURCE_LEMERGIUM,
            'Reaction2': RESOURCE_UTRIUM_LEMERGITE,
            'Lab5': RESOURCE_ZYNTHIUM_KEANITE,
            'Lab6': RESOURCE_UTRIUM_LEMERGITE,
            'Reaction3_1': RESOURCE_GHODIUM,
            'Reaction3_2': RESOURCE_GHODIUM,
        },
        'storage': {
            [RESOURCE_ZYNTHIUM]: 10000,
            [RESOURCE_LEMERGIUM]: 10000,
            [RESOURCE_UTRIUM]: 10000,
            [RESOURCE_KEANIUM]: 10000,
            [RESOURCE_OXYGEN]: 10000,
            [RESOURCE_HYDROGEN]: 10000,
            [RESOURCE_CATALYST]: 10000,
            [RESOURCE_HYDROXIDE]: 10000,
            [RESOURCE_OPS]: 10000,
            [RESOURCE_ZYNTHIUM_KEANITE]: 10000,
            [RESOURCE_UTRIUM_LEMERGITE]: 10000,
            [RESOURCE_GHODIUM]: 10000,
        },
        'walls': 1000000,
        'ramparts': 3000000,
    },
    'W59S6': {
        'name': 'W59S6',
        'factory': '66ad908c9c08f419eb0b8f78',//Game.getObjectById('664b79b94d45cc3937de4f09'),
        'product': RESOURCE_KEANIUM_BAR,
        'ingredients': [
            [RESOURCE_KEANIUM, 500],
        ],
        'spawner': `Xel'Keanite Secundis`,
        'creepCounts': {
            'harvester': Memory.rooms['W59S6'].sourceIDs.length,
            'hauler': 1,
            'upgrader': 2,
            'manager': 1,
            'collector': 1,
            'tombraider': 1,
            'builder': 2,
        },
        'walls': 0,
        'ramparts': 100000,
    },
    'W59S7': {
        'name': 'W59S7',
        'factory': '6675ca04be38cf0e9f7871e3',
        'product': RESOURCE_OXIDANT,
        'ingredients': [
            [RESOURCE_OXYGEN, 500],
        ],
        'spawner': `Xel'Gildeon Primus`,
        'creepCounts': {
            'harvester': Memory.rooms['W59S7'].sourceIDs.length,
            'hauler': 1,
            'upgrader': 3,
            'builder': 2,
            'tombraider': 1,
            'collector': 1,
            'manager': 1,
            'claimer': 0,
            'colonizer': 0,
            'attacker': 0,
            'miner': 0,
        },
        'storage': {
            [RESOURCE_ZYNTHIUM]: 10000,
            [RESOURCE_LEMERGIUM]: 10000,
            [RESOURCE_UTRIUM]: 10000,
            [RESOURCE_KEANIUM]: 10000,
            [RESOURCE_OXYGEN]: 10000,
            [RESOURCE_HYDROGEN]: 10000,
            [RESOURCE_CATALYST]: 10000,
            [RESOURCE_HYDROXIDE]: 10000,
            [RESOURCE_OPS]: 10000,

        },
        'walls': 1100000,
        'ramparts': 2000000,
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
    Object.entries(roomData).forEach(([roomName, room]) => {

        //MemoryDrivers
        MemoriseDamagedStructures(roomName);
        MemoriseConstructionSites(roomName);
        MemoriseSources(roomName);

        //StructureDrivers
        FactoryDriver(room.factory, room.product);
        TowerDriver(Game.rooms[roomName]);
        TerminalDriver()
        PowerProcessor()

        //ProcessDrivers
        ProcessLinkTransfer();
    });

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
            roleFunction.run(creep, roomData);
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
 * @param factory
 * @param product
 */
function FactoryDriver(factory, product) {
    let objFactory = Game.getObjectById(factory);
    if (objFactory) {
        if (objFactory.cooldown === 0) {
            const result = objFactory.produce(product);
            if (result === OK) {
                console.log(`Production of ${product} successful.`);
            } else {
                // console.log(`Error: ${result}`);
            }
        } else {
            // console.log(`Factory is in cooldown: ${objFactory.cooldown} ticks remaining.`);
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

/**
 * Market Manager - First inception
 */
function TerminalDriver() {
    Game.market.deal('', 3000, 'W59S5');
    // Game.market.createOrder(
    //     type: ORDER_SELL,
    //     resourceType: RESOURCE_OXIDANT,
    //     price: 255,
    //     totalAmount: 10000,
    //     roomName: 'W59S3'
    // });
    // Game.getObjectById('65d72196e456720d57347646').send(RESOURCE_ZYNTHIUM, 10000, 'W59S5');
}

/**
 * Deals with the processing of power
 */
function PowerProcessor() {
    let powerSpawn = Game.getObjectById("66371beb7929396fee3bc5d4")
    let powerSpawn2 = Game.getObjectById("66695afd836cc4e5e3418a6b")
    let powerSpawn3 = Game.getObjectById("66802a7c2dedfcbca21f9e05")
    if (powerSpawn.store[RESOURCE_ENERGY] > 0 && powerSpawn.store[RESOURCE_POWER] > 0) {
        powerSpawn.processPower();
    }
    if (powerSpawn2.store[RESOURCE_ENERGY] > 0 && powerSpawn2.store[RESOURCE_POWER] > 0) {
        powerSpawn2.processPower();
    }
    if (powerSpawn3.store[RESOURCE_ENERGY] > 0 && powerSpawn3.store[RESOURCE_POWER] > 0) {
        powerSpawn3.processPower();
    }
}