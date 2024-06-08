require('lodash');

//Region 0 Basic Functions
global.WithdrawEnergy = WithdrawEnergy;
global.TransferEnergy = TransferEnergy;

//Region 1 Recharge Functions
global.RechargeSpawn = RechargeSpawn;
global.RechargeExtension = RechargeExtension;
global.RechargeContainer = RechargeContainer;
global.RechargeTower = RechargeTower;
global.RechargeLink = RechargeLink;
global.RechargeStorage = RechargeStorage;
global.RechargeFactory = RechargeFactory;
global.RechargeTerminal = RechargeTerminal;
global.RechargeNuke = RechargeNuke;
global.RechargeCreep = RechargeCreep;
global.RechargeControllerContainer = RechargeControllerContainer;

//Region 2 Withdraw Functions
global.WithdrawFromCreep = WithdrawFromCreep;
global.WithdrawFromNonEmptyContainer = WithdrawFromNonEmptyContainer;
global.WithdrawFromEnergySourceContainer = WithdrawFromEnergySourceContainer;
global.WithdrawFromStorage = WithdrawFromStorage;
global.WithdrawFromTerminal = WithdrawFromTerminal;
global.WithdrawFromFactory = WithdrawFromFactory;

//Region 3 Supply Functions
global.SupplyCreep = SupplyCreep;
global.SupplyFactory = SupplyFactory;
global.SupplyTerminal = SupplyTerminal;
global.SupplyLabsEnergy = SupplyLabsEnergy;
global.SupplyPowerSpawn = SupplyPowerSpawn;

const TRANSFER_PATH = {visualizePathStyle: {stroke: '#0005a7'}};
const WITHDRAW_PATH = {visualizePathStyle: {stroke: '#f9fd00'}};


//region Section 0: Basic Functions
/**
 * Universal WithdrawEnergy of Energy between Creeps and Structure.
 * @param creep - The empty object.
 * @param container - The full object.
 * @param resource - The Type of Resource to Withdraw
 */
function WithdrawEnergy(creep, container, resource = RESOURCE_ENERGY) {
    if (creep.withdraw(container, resource) === ERR_NOT_IN_RANGE) {
        creep.moveTo(container, WITHDRAW_PATH);
    }
}

/**
 * Universal TransferToReceiver of Energy between two Objects (Creeps or Structures)
 * @param creep - This is usually the Creep that can move towards the Provider.
 * @param receiver - In most cases that would be a Structure. Sometimes it can be a stationary Creep as well [like Upgrader or Harvester].
 * @param resource
 */
function TransferEnergy(creep, receiver, resource = RESOURCE_ENERGY) {
    if (creep.transfer(receiver, resource) === ERR_NOT_IN_RANGE) {
        creep.moveTo(receiver, TRANSFER_PATH);
    }
}

//endregion

// region Section 1: Recharge Functions
/**
 * Dedicated Function for Spawn Recharge
 * @param creep
 */
function RechargeSpawn(creep) {
    //Find the Spawns
    let allSpawn = creep.room.find(FIND_MY_SPAWNS, {
        filter: spawn => spawn.store[RESOURCE_ENERGY] < SPAWN_ENERGY_CAPACITY
    });

    //If there are empty spawns, charge the closest or return true to continue to the next objects.
    if (allSpawn.length > 0) {
        let spawn = creep.pos.findClosestByPath(allSpawn);
        creep.say('🔄 Spawn');
        TransferEnergy(creep, spawn);
    } else {
        return true;
    }
}

/**
 * Dedicated Function for Extension Recharge
 * @param creep
 */
function RechargeExtension(creep) {
    //Find the Extensions
    let allExtensions = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => structure.structureType === STRUCTURE_EXTENSION
            && structure.store[RESOURCE_ENERGY] < EXTENSION_ENERGY_CAPACITY[creep.room.controller.level]
    });

    //If there are empty extensions, charge the closest or return true to continue to the next objects.
    if (allExtensions.length > 0) {
        creep.say('🔄 E');
        let extension = creep.pos.findClosestByPath(allExtensions);
        TransferEnergy(creep, extension);
    } else {
        return true;
    }
}

/**
 * Store any Resource to an Empty Container.
 * @param creep
 */
function RechargeContainer(creep) {
    //Find the Container
    let allContainers = creep.room.find(FIND_STRUCTURES, {
        filter: container => container.structureType === STRUCTURE_CONTAINER
            && container.store.getUsedCapacity() < CONTAINER_CAPACITY
    });

    //Take the closest one and Recharge it.
    if (allContainers.length > 0) {
        let container = creep.pos.findClosestByPath(allContainers)
        if (container && container.store.getUsedCapacity() < CONTAINER_CAPACITY) {
            creep.say('🔄 C');
            for (let resource in creep.store) {
                TransferEnergy(creep, container, resource);
            }
        }
    }
}

/**
 * Recharges Towers and returns true if the recharge is complete
 * @param creep
 * @returns {boolean}
 */
function RechargeTower(creep) {
    //Find the Towers
    let allTowers = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => structure.structureType === STRUCTURE_TOWER
            && structure.store[RESOURCE_ENERGY] < 750
    });

    //If there are empty tower, charge the closest or return true to continue to the next objects.
    if (allTowers.length > 0) {
        for (let tower of allTowers) {
            creep.say('🔄 T');
            TransferEnergy(creep, tower);
        }
    } else {
        return true;
    }
}

/**
 * Recharges the nearest Link
 * @param creep
 */
function RechargeLink(creep) {
    let allLinks = creep.room.find(FIND_MY_STRUCTURES, {
        filter: structure => structure.structureType === STRUCTURE_LINK
    });
    if (allLinks.length > 0) {
        let link = creep.pos.findClosestByPath(allLinks);
        if (creep.transfer(link, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(link);
        }
    }
}

/**
 * If nothing passes through the other 3 functions, everything goes into the storage.
 * @param creep
 * @param room
 * @param resource
 */
function RechargeStorage(creep, room, resource) {
    let storage = room.storage;
    if (storage) {
        if (resource) {
            TransferEnergy(creep, storage, resource)
        } else {
            for (let mineral in creep.store) {
                TransferEnergy(creep, storage, mineral)
            }
        }
    }
}

/**
 * If nothing passes through the other 3 functions, everything goes into the storage.
 * @param creep
 */
function RechargeNuke(creep) {
    let nuke = creep.room.find(FIND_MY_STRUCTURES, {
        filter:n=>n.structureType===STRUCTURE_NUKER
    })[0];
    if (nuke) {
        for (let resource in creep.store) {
            TransferEnergy(creep, nuke, resource)
        }
    }
}

/**
 * Recharges the Creeps energy to continue performing operations. Used by Builder and Repairer.
 * Store can be of string equal to S for Storage and C for Container.
 * @param creep
 * @param store
 */
function RechargeCreep(creep, store = 'S') {
    switch (store) {
        case 'S':
            let storage = creep.room.storage;
            if (storage && storage.store[RESOURCE_ENERGY] > 0) {
                WithdrawEnergy(creep, storage, RESOURCE_ENERGY);
            }
            break;
        case 'C':
            let container = creep.room.find(FIND_STRUCTURES, {
                filter: container => container.structureType === STRUCTURE_CONTAINER
                    && container.store[RESOURCE_ENERGY] > 0
            });
            if (container) {
                WithdrawEnergy(creep, creep.pos.findClosestByPath(container));
            }
            break;
        case 'L':
            let link = creep.room.find(FIND_STRUCTURES, {
                filter: container => container.structureType === STRUCTURE_LINK
                    && container.store[RESOURCE_ENERGY] > 0
            });
            if (link) {
                WithdrawEnergy(creep, creep.pos.findClosestByPath(link));
            }
            break;
        case 'T':
            let terminal = creep.room.find(FIND_MY_STRUCTURES, {
                filter: terminal => terminal.structureType === STRUCTURE_TERMINAL
                    && terminal.store[RESOURCE_ENERGY] > 0
            });
            if (terminal.length > 0) {
                WithdrawEnergy(creep, terminal[0], RESOURCE_ENERGY);
            }
            break;
        case 'M':
            Mine(creep);
    }
}

/**
 * Dedicated for rooms with controller Level under 5.
 * Utilizing Container instead of Links
 * @param creep
 */
function RechargeControllerContainer(creep) {
    let controllerContainer = creep.room.controller.pos.findInRange(FIND_STRUCTURES, 5, {
        filter: s => s.structureType === STRUCTURE_CONTAINER
    });
    if (controllerContainer.length > 0 && controllerContainer[0].store[RESOURCE_ENERGY] < CONTAINER_CAPACITY) {
        TransferEnergy(creep, controllerContainer[0]);
    }
}

/**
 * Restocks the Energy of the FactoryStructure.
 * @param creep
 * @param factory
 * @param energy
 */
function RechargeFactory(creep, factory, energy) {
    creep.say('F')
    if (factory && factory.store[RESOURCE_ENERGY] < energy) {
        TransferEnergy(creep, factory, RESOURCE_ENERGY);
    }
}

/**
 *
 * @param creep
 * @param terminal
 * @param energy
 */
function RechargeTerminal(creep, terminal, energy) {
    creep.say('T')
    if (terminal && terminal.store[RESOURCE_ENERGY] < energy) {
        TransferEnergy(creep, terminal, RESOURCE_ENERGY);
    }
}


// endregion

// region Section 2: Withdraw Functions
/**
 * Withdrawal of items from Creep that has a given role.
 * @param creep
 * @param role
 */
function WithdrawFromCreep(creep, role) {
    let allTargetCreeps = Object.values(Game.creeps).filter(target => target.memory.role === role && target.room.name === creep.room.name);
    allTargetCreeps.sort((a, b) => a.store[RESOURCE_ENERGY] - b.store[RESOURCE_ENERGY]);

    if (allTargetCreeps.length > 0 && creep.store[RESOURCE_ENERGY] > 0) {
        WithdrawEnergy(creep, allTargetCreeps[0]);
    }
}

/**
 * Withdraws from Any container closest by path
 * @param creep
 */
function WithdrawFromNonEmptyContainer(creep) {
    let allNonemptyContainers = creep.pos.findInRange(FIND_STRUCTURES, 2, {
        filter: structure => structure.structureType === STRUCTURE_CONTAINER
            && structure.store.getUsedCapacity() > 0
    });
    if (allNonemptyContainers.length > 0) {
        let container = creep.pos.findClosestByPath(allNonemptyContainers);
        for (let resource in container.store)
            WithdrawEnergy(creep, container, resource);
    }
}

/**
 * Withdraw only from containers next to Energy Sources.
 * Usually they are used by Miners so need to be always emptied. Yet excluding Controller Containers
 * @param creep
 */
function WithdrawFromEnergySourceContainer(creep) {
    let energySources = creep.room.find(FIND_SOURCES);
    let allEnergyContainers = [];
    for (let i = 0; i < energySources.length; i++) {
        let energyContainer = energySources[i].pos.findInRange(FIND_STRUCTURES, 2, {
            filter: s => s.structureType === STRUCTURE_CONTAINER
        });
        if (energyContainer.length > 0) {
            allEnergyContainers.push(energyContainer[0]);
        }
    }

    //Sort the Energy containers and add the Minerals before extraction the goods.
    allEnergyContainers = allEnergyContainers.sort((a, b) => b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY]);
    if (allEnergyContainers.length > 0 && allEnergyContainers[0].store[RESOURCE_ENERGY] > 200) {
        WithdrawEnergy(creep, allEnergyContainers[0])
    }
}

/**
 * Withdraws a specified resource from Storage Unit in a specified room
 * Default resource is Energy
 * @param creep
 * @param room
 * @param mineral
 */
function WithdrawFromStorage(creep, room, mineral = RESOURCE_ENERGY) {
    let storage = room.storage;
    if (storage) {
        WithdrawEnergy(creep, storage, mineral)
    }
}

/**
 * Withdraws a specified resource from Terminal Unit in a specified room
 * Default resource is Energy
 * @param creep
 * @param room
 * @param mineral
 */
function WithdrawFromTerminal(creep, room, mineral = RESOURCE_ENERGY) {
    let terminal = room.terminal;
    if (terminal) {
        WithdrawEnergy(creep, terminal, mineral);
    }
}

function WithdrawFromFactory(creep, factory, mineral = RESOURCE_ENERGY) {
    if (factory) {
        WithdrawEnergy(creep, factory, mineral)
    }
}
//endregion

// region Section 3: Supply Functions
/**
 * Withdrawal of items from Creep that has a given role.
 * @param creep
 * @param role
 */
function SupplyCreep(creep, role) {
    let allTargetCreeps = Object.values(Game.creeps).filter(target => target.memory.role === role && target.room.name === creep.room.name);
    allTargetCreeps.sort((a, b) => b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY]);

    if (allTargetCreeps.length > 0 && creep.store[RESOURCE_ENERGY] > 0) {
        TransferEnergy(creep, allTargetCreeps[0]);
    }
}

/**
 * Supplies Factory with any resource needed.
 * @param creep
 * @param factory
 * @param resource
 */
function SupplyFactory(creep, factory, resource) {
    creep.say('🔄 F')
    TransferEnergy(creep, factory, resource);
}

/**
 * Supply Terminal with any goods for sale or transfer.
 * @param creep
 * @param resource
 */
function SupplyTerminal(creep, resource) {
    let terminal = creep.room.find(FIND_MY_STRUCTURES, {
        filter: structure => structure.structureType === STRUCTURE_TERMINAL
    });
    if (terminal.length > 0) {
        creep.say('🔄 Market')
        TransferEnergy(creep, terminal[0], resource);
    } else {
        RechargeStorage(creep, creep.room)
    }
}

/**
 * Supplies all labs with Energy Only. The rest will be in the Lab Manager
 * @param creep
 */
function SupplyLabsEnergy(creep) {
    let allLabs = creep.room.find(FIND_STRUCTURES, {
        filter: structure => structure.structureType === STRUCTURE_LAB
            && structure.store[RESOURCE_ENERGY] < LAB_ENERGY_CAPACITY
    });
    allLabs.sort();
    for (let lab of allLabs) {
        creep.say('Lab')
        TransferEnergy(creep, lab, RESOURCE_ENERGY)
    }
}

/**
 * Power Spawn requires both Power and Energy. This function Provides both if asked for.
 * @param creep
 * @param resource
 */
function SupplyPowerSpawn(creep, resource) {
    let powerSpawn = creep.room.find(FIND_STRUCTURES, {
        filter: structure => structure.structureType === STRUCTURE_POWER_SPAWN
    });
    if (powerSpawn.length > 0) {
        if (powerSpawn[0].store[RESOURCE_POWER] <= POWER_SPAWN_POWER_CAPACITY) {
            creep.say('🔄 Power')
            TransferEnergy(creep, powerSpawn[0], resource);
        } else {
            return true;
        }
    }
}

//endregion