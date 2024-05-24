require("lodash");

//Global Functions and Constants
global.Mine = Mine;
global.Salvage = Salvage;
global.Reinforce = Reinforce;
global.Repair = Repair;
global.Build = Build;
global.Upgrade = Upgrade;
global.Tombraiding = Tombraiding;
global.ConductCollection = ConductCollection;
global.ReserveController = ReserveController;
global.ClaimController = ClaimController;
global.DeliverPower = DeliverPower;
global.Attack = Attack;
global.Defend = Defend;
global.extendCreepLifespan = extendCreepLifespan;
global.powerBankRobbery = powerBankRobbery;

//Constants for PathStyle
const MINE_PATH = {visualizePathStyle: {stroke: '#ff0000'}};
const DEFENCE_PATH = {visualizePathStyle: {stroke: '#ff0000'}};
const REINFORCE_PATH = {visualizePathStyle: {stroke: '#f9fd00'}};
const REPAIR_PATH = {visualizePathStyle: {stroke: '#0b4b00'}};
const SALVAGE_PATH = {visualizePathStyle: {stroke: '#00f0fb'}};
const UPGRADE_PATH = {visualizePathStyle: {stroke: '#0005a7'}};
const BUILD_PATH = {visualizePathStyle: {stroke: '#53035c'}};
const TOMBRAIDING_PATH = {visualizePathStyle: {stroke: '#000000'}};

//Constants for this File
const REINFORCE_LEVEL = 30000;
const RAMPART = [
    new RoomPosition(11, 19, Game.rooms['W59S4'].name),
];

/**
 * Balanced and Optimized function to Mine from Energy Source
 * Mineral sources with Extractor if resource is available can be harvested too.
 * @param creep
 */
function Mine(creep) {
    try {
        // Check if the creep already has a source assigned. If not - Assign one
        if (!creep.memory.sourceId) {
            let sources = Object.values(Memory.rooms[creep.room.name].sourceIDs)
            // Find the least assigned source in the room with no Creep on it and Assign the least assigned source to the creep
            creep.memory.sourceId = _.min(sources, sourceId => {
                return _.filter(Game.creeps, c => c.memory.role === 'harvester' && c.memory.sourceId === sourceId).length;
            });
        }

        // Get the assigned source based on the creep.memory and move the creep to it.
        let source = Game.getObjectById(creep.memory.sourceId);
        let harvest = creep.harvest(source);
        if (harvest === ERR_NOT_IN_RANGE) {
            creep.moveTo(source, MINE_PATH);
        }
    } catch (error) {
        console.log(`Error while mining: ${error}`);
    }
}

/**
 * Used for the purpose of draining energy from Ruins if present in the room.
 * @param creep
 */
function Salvage(creep) {
    //Find Ruins
    let ruins = creep.room.find(FIND_RUINS);

    //If Ruins in the room Exist, WithdrawEnergy existing Energy from them
    if (ruins.length > 0) {
        for (let ruin of ruins) {
            if (ruin.store[RESOURCE_ENERGY] > 0) {
                if (creep.withdraw(ruin, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(ruin, SALVAGE_PATH);
                }
                break;
            }
        }
    } else {
        // console.log("No Ruins present in the room at the moment");
    }
}

/**
 * Reinforces Walls and Ramparts to hit points limited by the REINFORCE_LEVEL constant.
 * @param creep
 */
function Reinforce(creep) {
    let defences = creep.room.find(FIND_STRUCTURES, {
        filter: structure => {
            return (structure.structureType === STRUCTURE_WALL
                    || structure.structureType === STRUCTURE_RAMPART)
                && structure.hits < REINFORCE_LEVEL
        }
    });
    for (let structure of defences) {
        if (creep.repair(structure) === ERR_NOT_IN_RANGE) {
            creep.moveTo(structure, REINFORCE_PATH);
        }
    }
}

/**
 * Commences repair based on Room.memory.damagedStructures list. Upon depletion of the list it is automatically renews from main.js
 * @param creep
 * @param roomName
 */
function Repair(creep, roomName) {
    //Get repair Creeps and the structure IDs from room memory
    let structuresID = Memory.rooms[roomName].damagedStructures;

    if (creep.memory.repairID === '') {
        if (structuresID[0]) {
            creep.memory.repairID = structuresID[0];
            Memory.rooms[roomName].damagedStructures = _.without(Memory.rooms[roomName].damagedStructures, structuresID[0]);
        }
    } else {
        let structure = Game.getObjectById(creep.memory.repairID)
        if (structure) {
            let repair = creep.repair(structure)
            if (repair === ERR_NOT_IN_RANGE) {
                creep.moveTo(structure, REPAIR_PATH);
            }
            // If Repaired, Remove the structure from the list
            if (structure.hits === structure.hitsMax) {
                creep.memory.repairID = '';
            }
        } else {
            creep.memory.repairID = '';
        }
    }
}

/**
 * Build Function - finds any sites and moves the creep there and performs the build operation.
 * Inter-Room now available
 * @param creep
 * @param roomName
 */
function Build(creep, roomName) {
    //Get builder Creeps and the construction site IDs from room memory
    let siteIDs = Memory.rooms[roomName].constructionSites;

    if (!creep.memory.siteID || creep.memory.siteID === '') {
        if (siteIDs[0]) {
            creep.memory.siteID = siteIDs[0];
            Memory.rooms[roomName].constructionSites = _.without(Memory.rooms[roomName].constructionSites, siteIDs[0]);
        }
    } else {
        let site = Game.getObjectById(creep.memory.siteID);
        if (site) {
            let build = creep.build(site)
            if (build === ERR_NOT_IN_RANGE) {
                creep.moveTo(site, BUILD_PATH);
            }
        } else {
            creep.memory.siteID = '';
        }
    }
}

/**
 * Upgrade Function modified for Trans-Room Usability
 * @param creep
 * @param room
 * */
function Upgrade(creep, room) {
    if (creep.upgradeController(room.controller) === ERR_NOT_IN_RANGE) {
        creep.moveTo(room.controller, UPGRADE_PATH);
    }
}

/**
 * Raids Tombstones in the room and takes all their belongings
 * @param creep
 */
function Tombraiding(creep) {
    // Find tombstones with resources
    let tombstones = creep.room.find(FIND_TOMBSTONES, {
        filter: tombstone => tombstone.store && Object.keys(tombstone.store).length > 0
    });

    if (tombstones.length > 0) {
        // console.log("Number of Tombstones: " + tombstones.length)

        // Harvest from the nearest tombstone
        if (creep.withdraw(tombstones[0], Object.keys(tombstones[0].store)[0]) === ERR_NOT_IN_RANGE) {
            creep.moveTo(tombstones[0], TOMBRAIDING_PATH);
        }
    } else {
        creep.say('🔄 Idle');
        RechargeStorage(creep, creep.room);

        if (creep.store.getUsedCapacity() === 0)
            switch (creep.room.name){
                case"W59S4":
                    creep.moveTo(new RoomPosition(22, 32, creep.room.name))
                    break;
                case"W59S5":
                    creep.moveTo(new RoomPosition(11, 23, creep.room.name))
                    break;
                case"W59S3":
                    creep.moveTo(new RoomPosition(25, 25, creep.room.name))
                    break;
            }
    }
}

/**
 * Conducts Collection of dropped resources
 * @param creep
 */
function ConductCollection(creep) {
    // Find all dropped resources in the room
    const droppedResources = creep.room.find(FIND_DROPPED_RESOURCES);

    // Filter out undefined or null resources
    const validDroppedResources = droppedResources.filter(resource => resource);

    if (validDroppedResources.length > 0) {
        // Choose the closest dropped resource and move towards it
        const closestResource = creep.pos.findClosestByRange(validDroppedResources);
        if (creep.pickup(closestResource) === ERR_NOT_IN_RANGE) {
            creep.moveTo(closestResource, TOMBRAIDING_PATH);
        }
    } else {
        // Handle the case when there are no  dropped valid resources
        creep.say('🔄 Idle');
        RechargeStorage(creep, creep.room);
        if (creep.store.getUsedCapacity() === 0)
            switch (creep.room.name){
                case"W59S4":
                    creep.moveTo(new RoomPosition(22, 30, creep.room.name))
                    break;
                case"W59S5":
                    creep.moveTo(new RoomPosition(10, 23, creep.room.name))
                    break;
                case"W59S3":
                    creep.moveTo(new RoomPosition(26, 26, creep.room.name))
                    break;
            }    }
}

/**
 * Function to reserve the controller. Required if Neutral
 * @param creep
 */
function ReserveController(creep) {
    let controller = creep.room.controller;

    if (controller) {
        if (creep.pos.inRangeTo(controller, 1)) {
            // Reserve the controller
            let reserveResult = creep.reserveController(controller);
            console.log('Reserve Result:', reserveResult);
            return reserveResult;
        } else {
            // Move closer to the controller
            let moveResult = creep.moveTo(controller, {visualizePathStyle: {stroke: '#650a65'}});
            console.log('Move Result:', moveResult);
        }
    } else {
        // Handle the case when the controller is not present (optional)
        console.log("No controller found in the room.");
    }
}

/**
 * Function to Claim the controller.
 * @param creep
 */
function ClaimController(creep) {
    let controller = creep.room.controller;

    if (controller) {
        if (creep.pos.inRangeTo(controller, 1)) {
            // Claim the controller
            console.log("Claiming Controller: In Progress...")
            let result = creep.claimController(controller);
            console.log("Claiming Controller Result: " + result);
        } else {
            // Move closer to the controller
            creep.moveTo(controller, {visualizePathStyle: {stroke: '#650a65'}});
        }
    } else {
        // Handle the case when the controller is not present (optional)
        console.log("No controller found in the room.");
    }
}

function DeliverPower(creep) {
    if (creep.room.name === "W59S4") {
        let powerSpawn = creep.room.find(FIND_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_POWER_SPAWN
        });
        if (creep.store.getUsedCapacity(RESOURCE_POWER) === 0
            && powerSpawn[0].store[RESOURCE_ENERGY] === 5000
            && powerSpawn[0].store[RESOURCE_POWER] === 0) {
            creep.say("goPower")
            WithdrawEnergy(creep, creep.room.terminal, RESOURCE_POWER);
        }
    }
}

//incomplete

function Attack(creep, hostiles) {
    console.log(`Hostiles: ${hostiles.length}`)
    // Attack the nearest hostile creep
    if (creep.attack(hostiles[0]) === ERR_NOT_IN_RANGE) {
        creep.moveTo(hostiles[0], {visualizePathStyle: {stroke: '#ff0000'}});
    }
}

function Defend(creep, hostiles) {
    let defenders = Object.values(Game.creeps).filter(creep => creep.memory.role === 'defender');
    let rangers = Object.values(Game.creeps).filter(creep => creep.memory.role === 'ranger');
    for (let d = 0; d < defenders.length; d++) {
        if (defenders[d].pos !== RAMPART[d] && defenders[d].memory.role === 'defender') {
            defenders[d].moveTo(RAMPART[d], DEFENCE_PATH)
            // Find hostile creeps in Melee range
            let hostileCreepsInMelee = defenders[d].pos.findInRange(FIND_HOSTILE_CREEPS, 1); // Adjust the range as needed
            if (hostiles.length > 0 && defenders[d].memory.role === 'defender') {
                // Attack the closest hostile creep
                let targetCreep = defenders[d].pos.findClosestByRange(hostileCreepsInMelee);
                defenders[d].attack(targetCreep);
            }
        }
        if (rangers[d].pos !== RAMPART[d]) {
            rangers[d].moveTo(new RoomPosition(RAMPART[d].x + 1, RAMPART[d].y + 1, Game.rooms['W59S4'].name), DEFENCE_PATH)
            // Find hostile creeps in Ranged range
            let hostileCreepsInRange = rangers[d].pos.findInRange(FIND_HOSTILE_CREEPS, 3); // Adjust the range as needed
            if (hostiles.length > 0 && rangers[d].memory.role === 'ranger') {
                // Range Attack the closest hostile creep
                let targetCreep = rangers[d].pos.findClosestByRange(hostileCreepsInRange);
                rangers[d].rangedAttack(targetCreep);
            }
        }
    }
}

function extendCreepLifespan(creep) {
    // Check if the creep needs healing
    if (creep.hits < creep.hitsMax) {
        // Find all healers within range
        let healers = creep.pos.findInRange(FIND_MY_CREEPS, 3, {
            filter: c => c.getActiveBodyparts(HEAL) > 0
        });

        // Sort the healers by distance to the creep
        healers.sort((a, b) => creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b));

        // If there are healers nearby, heal the creep
        if (healers.length > 0) {
            let healer = healers[0];
            let healResult = healer.renewCreep(creep);
            if (healResult === ERR_NOT_IN_RANGE) {
                // Move the healer towards the creep if not in range
                healer.moveTo(creep, {visualizePathStyle: {stroke: '#ffaa00'}});
            } else if (healResult === OK) {
                // Successful healing
                console.log(`Healer ${healer.name} extended the lifespan of ${creep.name}`);
            }
        } else {
            // No healers nearby to extend the creep's lifespan
            console.log(`No healers found nearby to extend the lifespan of ${creep.name}`);
        }
    }
}


//TODO: Implement powerbank robbery
// Define a function to check if the adjacent room has a power bank
function hasPowerBank(roomName) {
    let room = Game.rooms[roomName];
    if (!room) return false; // Room not visible, can't determine
    let structures = room.find(FIND_STRUCTURES, {
        filter: structure => structure.structureType === STRUCTURE_POWER_BANK
    });
    return structures.length > 0;
}

// Define a function to direct the creep towards the power bank
function directToPowerBank(creep, roomName) {
    let exitDir = Game.map.findExit(creep.room.name, roomName);
    let exit = creep.pos.findClosestByPath(exitDir);
    if (exit) {
        creep.moveTo(exit);
    } else {
        console.log(`Unable to find path to room ${roomName}`);
    }
}

function powerBankRobbery(creep) {
    // Assuming you have an observer structure stored in the variable observer
    let observer = Game.getObjectById("6612807d4b090f1095ccb32a");
    let roomName = 'W60S4';

    if (observer) {
        let result = observer.observeRoom(roomName);
        if (result === OK) {
            console.log(`Observing room ${roomName}`);
            if (hasPowerBank(roomName)) {
                console.log(`Power bank detected in room ${roomName}`);
                // Assuming you have a creep stored in the variable 'creep'
                directToPowerBank(creep, roomName);
            } else {
                console.log(`No power bank detected in room ${roomName}`);
            }
        } else {
            console.log(`Failed to observe room ${roomName}: ${result}`);
        }
    } else {
        console.log("No observer found.");
    }
}