const _=require("lodash");

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
global.extendCreepLifespan = extendCreepLifespan;
global.PowerBankRobbery = PowerBankRobbery;
global.CorridorMining = CorridorMining;
global.HealCreep = HealCreep;

//Constants for PathStyle
const MINE_PATH = {visualizePathStyle: {stroke: '#ff0000'}};
const REINFORCE_PATH = {visualizePathStyle: {stroke: '#f9fd00'}};
const REPAIR_PATH = {visualizePathStyle: {stroke: '#0b4b00'}};
const SALVAGE_PATH = {visualizePathStyle: {stroke: '#00f0fb'}};
const UPGRADE_PATH = {visualizePathStyle: {stroke: '#0005a7'}};
const BUILD_PATH = {visualizePathStyle: {stroke: '#53035c'}};
const TOMBRAIDING_PATH = {visualizePathStyle: {stroke: '#000000'}};

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
 * @param resource
 */
function Salvage(creep, resource) {
    //Find Ruins
    let ruins = creep.room.find(FIND_RUINS);

    //If Ruins in the room Exist, WithdrawEnergy existing Energy from them
    if (ruins.length > 0) {
        for (let ruin of ruins) {
            if (ruin.store[resource] > 0) {
                if (creep.withdraw(ruin, resource) === ERR_NOT_IN_RANGE) {
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
 * @param wallsHP
 * @param rampartsHP
 */
function Reinforce(creep, wallsHP, rampartsHP) {
    let walls = creep.room.find(FIND_STRUCTURES, {
        filter: structure => structure.structureType === STRUCTURE_WALL
            && structure.hits < wallsHP
    });
    let ramparts = creep.room.find(FIND_STRUCTURES, {
        filter: structure => structure.structureType === STRUCTURE_RAMPART
            && structure.hits < rampartsHP
    });
    let defences = walls.concat(ramparts);
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

        if (creep.store.getUsedCapacity() === 0) {
            switch (creep.room.name) {
                case"W59S4":
                    creep.moveTo(new RoomPosition(22, 32, creep.room.name))
                    break;
                case"W59S5":
                    creep.moveTo(new RoomPosition(7, 18, creep.room.name))
                    break;
                case"W59S3":
                    creep.moveTo(new RoomPosition(25, 25, creep.room.name))
                    break;
                case"W59S7":
                    creep.moveTo(new RoomPosition(11, 23, creep.room.name))
                    break;
            }
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
            switch (creep.room.name) {
                case"W59S4":
                    creep.moveTo(new RoomPosition(22, 30, creep.room.name))
                    break;
                case"W59S5":
                    creep.moveTo(new RoomPosition(7, 20, creep.room.name))
                    break;
                case"W59S3":
                    creep.moveTo(new RoomPosition(26, 26, creep.room.name))
                    break;
                case"W59S7":
                    creep.moveTo(new RoomPosition(11, 21, creep.room.name))
                    break;
            }
    }
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

/**
 * Delivers Power to the PowerSpawn. Requires rework so to function more completely and smoothly.
 * @param creep
 */
function DeliverPower(creep) {
    if (creep.room.name === "W59S4") {
        let powerSpawn = creep.room.find(FIND_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_POWER_SPAWN
        });
        if (creep.store.getUsedCapacity(RESOURCE_POWER) === 0
            && powerSpawn[0].store[RESOURCE_ENERGY] === 5000
            && powerSpawn[0].store[RESOURCE_POWER] === 0) {
            creep.say("goPower")
            if (creep.ticksToLive < 300 && creep.store.getUsedCapacity() === 0) {
                creep.suicide();
            }
            WithdrawEnergy(creep, creep.room.terminal, RESOURCE_POWER);
        }
    }
}

//TODO: Make it work
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

/**
 * Healing a creep in a given room
 * @param creep
 * @param targetRoom
 */
function HealCreep(creep, targetRoom) {
    //Get in position
    let position = new RoomPosition(36, 24, targetRoom)
    creep.moveTo(position);
    if (creep.room.name === targetRoom) {
        // Find the target creep in the specified room
        let targetCreep = Game.rooms[targetRoom].find(FIND_MY_CREEPS);

        targetCreep.sort((a, b) => (b.hitsMax - b.hits) - (a.hitsMax - a.hits));

        // Target the most damaged creep
        let mostDamagedCreep = targetCreep[0];

        // Move towards and heal the target creep
        if (creep.heal(mostDamagedCreep) === ERR_NOT_IN_RANGE) {
            creep.moveTo(mostDamagedCreep, {visualizePathStyle: {stroke: '#00ff00'}});
        }
    }
}

/**
 * Detector for any structure that is seeked after.
 * @param roomName
 * @param structure_const
 */
function HasStructure(roomName, structure_const) {
    let room = Game.rooms[roomName];
    if (!room) return false; // Room not visible, can't determine
    let structures = room.find(FIND_STRUCTURES, {
        filter: structure => structure.structureType === structure_const
    });
    if (structures.length > 0) {
        return structures[0];
    }
}

/**
 * Detector for Deposits in a given Corridor Room.
 * To be reworked to feature an array of rooms.
 * @param roomName
 */
function HasDeposit(roomName) {
    let room = Game.rooms[roomName];
    if (!room) return false; // Room not visible, can't determine
    let deposits = room.find(FIND_DEPOSITS)
    if (deposits.length > 0) {
        return deposits[0];
    }
}

/**
 * Functional Method for finding and sending creeps to attack a PowerBank.
 * @param creep
 * @param targetRoom
 * @param structure_const
 */
function PowerBankRobbery(creep, targetRoom, structure_const) {
    let observer = Game.getObjectById("6612807d4b090f1095ccb32a");

    if (observer) {
        let result = observer.observeRoom(targetRoom);
        if (result === OK) {
            console.log(`Observing room ${targetRoom}`);
            let structure = HasStructure(targetRoom, structure_const);
            if (structure) {
                console.log(`Power bank detected in room ${targetRoom}: x:${structure.pos.x}, y:${structure.pos.y}`);
                let position = new RoomPosition(structure.pos.x, structure.pos.y, targetRoom);
                creep.moveTo(position, MINE_PATH);
                creep.attack(structure);
                console.log(structure.hits)
            } else {
                console.log(`No power bank detected in room ${targetRoom}`);
            }
        } else {
            console.log(`Failed to observe room ${targetRoom}: ${result}`);
        }
    } else {
        console.log("No observer found.");
    }
}

/**
 * Functional Corridor Mining operator.
 * @param creep
 * @param targetRoom
 */
function CorridorMining(creep, targetRoom) {
    let observer = Game.getObjectById("6612807d4b090f1095ccb32a");
    if (observer) {
        let result = observer.observeRoom(targetRoom);
        if (result === OK) {
            let deposit = HasDeposit(targetRoom);
            if (deposit) {
                console.log(`Deposit detected in room ${targetRoom}: x:${deposit.pos.x}, y:${deposit.pos.y}`);
                let position = new RoomPosition(deposit.pos.x, deposit.pos.y, targetRoom);
                creep.moveTo(position, MINE_PATH);
                creep.harvest(deposit);
            } else {
                console.log(`No deposits detected in room ${targetRoom}`);
            }
        } else {
            console.log(`Failed to observe room ${targetRoom}: ${result}`);
        }
    } else {
        console.log("No observer found.");
    }
}