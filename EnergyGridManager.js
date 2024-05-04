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
global.RechargeNuke = RechargeNuke;
global.RechargeCreep = RechargeCreep;
global.RechargeControllerContainer = RechargeControllerContainer;

//Region 2 Withdraw Functions
global.WithdrawFromCreep = WithdrawFromCreep;
global.WithdrawFromNonEmptyContainer = WithdrawFromNonEmptyContainer;
global.WithdrawFromEnergySourceContainer = WithdrawFromEnergySourceContainer;
global.WithdrawFromStorage = WithdrawFromStorage;

//Region 3 Supply Functions
global.SupplyCreep = SupplyCreep;
global.SupplyFactory = SupplyFactory;
global.SupplyTerminal = SupplyTerminal;

//region Section 0: Basic Functions
/**
 * Universal WithdrawEnergy of Energy between Creeps and Structure.
 * @param creep - The empty object.
 * @param container - The full object.
 * @param resource - The Type of Resource to Withdraw
 */
function WithdrawEnergy(creep, container, resource = RESOURCE_ENERGY) {
    if (creep.withdraw(container, resource) === ERR_NOT_IN_RANGE) {
        creep.moveTo(container, {visualizePathStyle: {stroke: '#ffaa00'}});
    }
}

/**
 * Universal TransferToReceiver of Energy between two Objects (Creeps or Structures)
 * @param creep - This is usually the Creep that can move towards the Provider.
 * @param provider - In most cases that would be a Structure. Sometimes it can be a stationary Creep as well [like Upgrader or Harvester].
 * @param resource
 */
function TransferEnergy(creep, provider, resource = RESOURCE_ENERGY) {
    if (creep.transfer(provider, resource) === ERR_NOT_IN_RANGE) {
        creep.moveTo(provider, {visualizePathStyle: {stroke: '#000000'}});
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
 */
function RechargeStorage(creep, room) {
    let storage = room.storage;
    if (storage) {
        for (let resource in creep.store) {
            TransferEnergy(creep, storage, resource)
        }
    }
}

/**
 * If nothing passes through the other 3 functions, everything goes into the storage.
 * @param creep
 */
function RechargeNuke(creep) {
    let nuke = Game.getObjectById("6613931edd2e5f6ae6a07f59");
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
 * @param resource
 */
function WithdrawFromNonEmptyContainer(creep, resource) {
    let allNonemptyContainers = creep.room.find(FIND_STRUCTURES, {
        filter: structure => structure.structureType === STRUCTURE_CONTAINER
            && structure.store.getUsedCapacity() > 0
    });
    if (allNonemptyContainers.length > 0) {
        let container = creep.pos.findClosestByPath(allNonemptyContainers);
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
 * @param resource
 */
function SupplyFactory(creep, resource) {
    if (creep.room.controller.level < 7) {
        return;
    }
    let factory = creep.room.find(FIND_MY_STRUCTURES, {
        filter: structure => structure.structureType === STRUCTURE_FACTORY
    });
    if (factory !== null) {
        TransferEnergy(creep, factory, resource);
    }
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
    if (terminal !== null) {
        TransferEnergy(creep, terminal, resource);
    }
}
//endregion