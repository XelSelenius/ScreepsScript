let roleManager = {
    /** @param {Creep} creep *
     * @param room
     */
    run: function (creep, room) {
        //Set Position Parameters
        ManagerPositioning(creep);

        //Set Constants for Energy and Component Values.
        room = room[creep.room.name];
        let FACTORY_ENERGY = 2000;
        let TERMINAL_ENERGY = 25000;

        //Set Structure shortcuts
        let storage = creep.room.storage;
        let terminal = creep.room.terminal;
        let factory = Game.getObjectById(room.factory);
        let storageLink = creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {
            filter: s => s.structureType === STRUCTURE_LINK
        })[0];

        // Manage the Empty Containers
        WithdrawFromNonEmptyContainer(creep)

        // Energy Supply
        EnergyManagement(creep, storageLink, storage, factory, terminal, TERMINAL_ENERGY, FACTORY_ENERGY)

        // Mineral Supply
        MineralFactoryManagement(creep, room, storage, factory, terminal)

        // Storage Management
        // CleanStorage(creep, storage, terminal, room)
    }
};

module.exports = roleManager;

function ManagerPositioning(creep) {
    switch (creep.room.name) {
        case "W59S4":
            creep.moveTo(new RoomPosition(14, 31, creep.room.name));
            break;
        case "W59S3":
            creep.moveTo(new RoomPosition(22, 20, creep.room.name));
            break;
        case "W59S5":
            creep.moveTo(new RoomPosition(14, 19, creep.room.name));
            break;
        case "W59S7":
            creep.moveTo(new RoomPosition(20, 22, creep.room.name));
            break;
    }
}

/**
 * Management of the Energy Balance withing the Core of the Room.
 * @param creep
 * @param storageLink
 * @param storage
 * @param factory
 * @param terminal
 * @param TERMINAL_ENERGY
 * @param FACTORY_ENERGY
 */
function EnergyManagement(creep, storageLink,storage, factory, terminal, TERMINAL_ENERGY, FACTORY_ENERGY) {
    if (storageLink && storageLink.store[RESOURCE_ENERGY] > 0) {
        // console.log(`${creep.room.name} Link Energy Transfer`)
        creep.withdraw(storageLink, RESOURCE_ENERGY)
        RechargeStorage(creep, creep.room);
    } else if (factory && factory.store[RESOURCE_ENERGY] < FACTORY_ENERGY) {
        // console.log(`${creep.room.name} Factory Energy Supply`)
        let requiredEnergy = FACTORY_ENERGY - factory.store[RESOURCE_ENERGY];
        if (creep.store[RESOURCE_ENERGY] < requiredEnergy) {
            creep.withdraw(storage,RESOURCE_ENERGY)
        }
        creep.transfer(factory, RESOURCE_ENERGY, Math.min(requiredEnergy, creep.store.getCapacity()));
    } else if (terminal && terminal.store[RESOURCE_ENERGY] < TERMINAL_ENERGY) {
        // console.log(`${creep.room.name} Terminal Energy Supply`)
        let requiredEnergy = TERMINAL_ENERGY - terminal.store[RESOURCE_ENERGY];
        if (creep.store[RESOURCE_ENERGY] < Math.min(requiredEnergy, creep.store.getCapacity())) {
            creep.withdraw(storage,RESOURCE_ENERGY)
        }
        creep.transfer(terminal, RESOURCE_ENERGY, Math.min(requiredEnergy, creep.store.getCapacity()));
    } else if (terminal && terminal.store[RESOURCE_ENERGY] > TERMINAL_ENERGY) {
        // console.log(`${creep.room.name} Terminal Energy Withdraw`)
        let overheadEnergy = terminal.store[RESOURCE_ENERGY] - TERMINAL_ENERGY;
        creep.withdraw(terminal,RESOURCE_ENERGY,Math.min(overheadEnergy, creep.store.getCapacity()))
        RechargeStorage(creep, creep.room)
    } else if (creep.store[RESOURCE_ENERGY] > 0) {
        RechargeStorage(creep, creep.room)
    }
}

/**
 * Management of the Factory its supply and product through the Config
 * @param creep
 * @param room
 * @param storage
 * @param factory
 * @param terminal
 */
function MineralFactoryManagement(creep, room, storage, factory, terminal) {
    let mineral;
    let mineralVolume;
    let product = room.product

    if (room.ingredients) {
        mineral = room.ingredients[0][0];
        mineralVolume = room.ingredients[0][1];

        // console.log(`${creep.room.name} Factory Mineral Supply`);

        if (terminal.store[mineral] || creep.store[mineral]) {
            let requiredMineral = mineralVolume - factory.store[mineral];
            if (requiredMineral > 0) {
                creep.withdraw(terminal, mineral, Math.min(requiredMineral, creep.store.getCapacity(), terminal.store[mineral]))
                creep.transfer(factory, mineral, creep.store[mineral]);
            } else if (creep.store[mineral]) {
                SupplyTerminal(creep, mineral)
            }
        }
    } else {
        // console.log(`No mineral or mineral volume specified for room: ${creep.room.name}`);
    }

    if (factory && product) {
        // console.log(`${creep.room.name} Factory Product Withdraw`)
        if (factory.store[product] > 0) {
            WithdrawFromFactory(creep, factory, product)
        } else if (creep.store[product] > 0) {
            SupplyTerminal(creep, product)
        }
    }
}

/**
 * Clears Storage from unwanted items and reloads it with missing items.
 * @param creep
 * @param storage
 * @param terminal
 * @param room
 */
function CleanStorage(creep, storage, terminal, room) {
    for (let item in storage.store) {
        if (item !== RESOURCE_ENERGY) {
            if (room.storage[item] && storage.store[item] > room.storage[item]) {
                let amount = Math.min(storage.store[item] - room.storage[item], creep.store.getCapacity() - creep.store.getUsedCapacity());
                if (amount > 0) {
                    if (creep.withdraw(storage, item, amount) === OK) {
                        creep.transfer(terminal, item);
                    }
                }
            } else if (!room.storage[item]) {
                let amount = Math.min(storage.store[item], creep.store.getCapacity() - creep.store.getUsedCapacity());
                if (amount > 0) {
                    if (creep.withdraw(storage, item, amount) === OK) {
                        creep.transfer(terminal, item);
                    }
                }
            }
        }
    }

    for (let item in terminal.store) {
        if (item !== RESOURCE_ENERGY && room.storage[item] && storage.store[item] < room.storage[item]) {
            let amount = Math.min(room.storage[item] - storage.store[item], creep.store.getCapacity() - creep.store.getUsedCapacity());
            if (amount > 0) {
                if (creep.withdraw(terminal, item, amount) === OK) {
                    RechargeStorage(creep, creep.room);
                }
            }
        }
    }

    // Check creep's store and deposit any remaining resources to storage
    // for (const resourceType in creep.store) {
    //     if (creep.store[resourceType] > 0) {
    //         RechargeStorage(creep, creep.room);
    //     }
    // }
}

/*  Honorable Mention.
if (storage.store[mineral] >= STORAGE_MINERAL) {
    let overheadStorageMineral = storage.store[mineral] - STORAGE_MINERAL;
    let requiredFactoryMineral = mineralVolume - factory.store[mineral];
    console.log(`Overhead: ${overheadStorageMineral}, Required: ${requiredFactoryMineral}`);
    if (overheadStorageMineral > 0 && creep.store[mineral] === 0) {
        creep.withdraw(storage, mineral, Math.min(overheadStorageMineral, creep.store.getCapacity()));     } else if (requiredFactoryMineral > 0 && creep.store[mineral] > 0) {
        creep.transfer(factory, mineral, Math.min(requiredFactoryMineral, creep.store[mineral]));
    } else {
        creep.transfer(terminal, mineral, creep.store[mineral]);
    }
}
*/