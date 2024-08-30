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
        WithdrawFromNonEmptyContainer(creep);

        // Energy Supply
        EnergyManagement(creep, storageLink, storage, factory, terminal, TERMINAL_ENERGY, FACTORY_ENERGY)

        if (factory && terminal) {
            // Mineral Supply
            MineralFactoryManagement(creep, room, storage, factory, terminal)

            // Storage Management
            // CleanStorage(creep, storage, terminal, factory, room);
            // ReloadStorage(creep, storage, terminal, room);
        }
    }
};

module.exports = roleManager;

/**
 * Sets the position of the Manager Creep in the Room Core.
 * @param creep
 */
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
        case "W59S6":
            creep.moveTo(new RoomPosition(16, 28, creep.room.name));
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
function EnergyManagement(creep, storageLink, storage, factory, terminal, TERMINAL_ENERGY, FACTORY_ENERGY) {
    if (storageLink && storageLink.store[RESOURCE_ENERGY] > 0) {
        creep.withdraw(storageLink, RESOURCE_ENERGY)
        creep.transfer(storage, RESOURCE_ENERGY)
    } else if (factory && factory.store[RESOURCE_ENERGY] < FACTORY_ENERGY) {
        let requiredEnergy = FACTORY_ENERGY - factory.store[RESOURCE_ENERGY];
        if (creep.store[RESOURCE_ENERGY] < requiredEnergy) {
            creep.withdraw(storage, RESOURCE_ENERGY)
        }
        creep.transfer(factory, RESOURCE_ENERGY, Math.min(requiredEnergy, creep.store.getCapacity()));
    } else if (terminal && terminal.store[RESOURCE_ENERGY] < TERMINAL_ENERGY) {
        let requiredEnergy = TERMINAL_ENERGY - terminal.store[RESOURCE_ENERGY];
        if (creep.store[RESOURCE_ENERGY] < Math.min(requiredEnergy, creep.store.getCapacity())) {
            creep.withdraw(storage, RESOURCE_ENERGY)
        }
        creep.transfer(terminal, RESOURCE_ENERGY, Math.min(requiredEnergy, creep.store.getCapacity()));
    } else if (terminal && terminal.store[RESOURCE_ENERGY] > TERMINAL_ENERGY) {
        let overheadEnergy = terminal.store[RESOURCE_ENERGY] - TERMINAL_ENERGY;
        creep.withdraw(terminal, RESOURCE_ENERGY, Math.min(overheadEnergy, creep.store.getCapacity()))
        creep.transfer(storage, RESOURCE_ENERGY)
    } else if (creep.store[RESOURCE_ENERGY] > 0) {
        creep.transfer(storage, RESOURCE_ENERGY)
    }
}

/**
 * Management of the Factory and its supply and product through the Config
 * @param creep
 * @param room
 * @param storage
 * @param factory
 * @param terminal
 */
function MineralFactoryManagement(creep, room, storage, factory, terminal) {
    let product = room.product;

    if (room.ingredients) {
        for (let [mineral, mineralVolume] of room.ingredients) {
            let terminalAmount = terminal.store[mineral] || 0;
            let creepAmount = creep.store[mineral] || 0;
            if (terminalAmount || creepAmount) {
                let requiredMineral = mineralVolume - factory.store[mineral];
                if (requiredMineral > 0) {
                    let amountToWithdraw = Math.min(requiredMineral, creep.store.getCapacity(), terminal.store[mineral]);
                    if (amountToWithdraw > 0) {
                        creep.withdraw(terminal, mineral, amountToWithdraw);
                    }
                    if (creep.store[mineral] > 0) {
                        creep.transfer(factory, mineral);
                    }
                } else if (creep.store[mineral] > 0) {
                    SupplyTerminal(creep, mineral);
                }
            }
        }
    } else {
        console.log(`No ingredients specified for room: ${creep.room.name}`);
    }

    if (factory && product) {
        if (factory.store[product] > 0 && creep.store.getFreeCapacity() > 0) {
            WithdrawFromFactory(creep, factory, product);
        } else if (creep.store[product] > 0) {
            SupplyTerminal(creep, product);
        }
    }
}

/**
 * Clears Storage from unwanted items by discarding them into the Terminal as per Config Specifications
 * @param creep
 * @param storage
 * @param terminal
 * @param factory
 * @param room
 */
function CleanStorage(creep, storage, terminal, factory, room) {
    for (let item in storage.store) {
        if (creep.store.getUsedCapacity() === 0) {
            if (item !== RESOURCE_ENERGY) {
                let requiredAmount = room.storage[item] || 0; // Default to 0 if undefined
                if (storage.store[item] > requiredAmount) {
                    let amount = Math.min(storage.store[item] - requiredAmount, creep.store.getFreeCapacity());
                    if (amount > 0) {
                        if (creep.withdraw(storage, item, amount) === OK) {
                            creep.transfer(terminal, item);
                        }
                    }
                }
            } else {
                creep.transfer(storage, RESOURCE_ENERGY);
            }
        } else if (!storage.store[Object.keys(creep.store)[0]] || creep.store.getUsedCapacity() > 0) {
            SupplyTerminal(creep, Object.keys(creep.store)[0]);
        }
    }
}

/**
 * Reloads the Storage from Terminal for any missing resources as per Config specification - Type and Amount
 * @param creep
 * @param storage
 * @param terminal
 * @param room
 */
function ReloadStorage(creep, storage, terminal, room) {
    for (let item in terminal.store) {
        if (creep.store.getFreeCapacity() > 0) {
            if (item !== RESOURCE_ENERGY) {
                let storageAmount = storage.store[item] || 0; // Default to 0 if undefined
                let requiredAmount = room.storage[item] || 0; // Default to 0 if undefined

                if (requiredAmount > 0 && storageAmount < requiredAmount) {
                    let amount = Math.min(requiredAmount - storageAmount, creep.store.getFreeCapacity());
                    if (amount > 0) {
                        if (creep.withdraw(terminal, item, amount) === OK) {
                            RechargeStorage(creep, creep.room);
                        }
                    }
                }
            }
        } else if (!terminal.store[Object.keys(creep.store)[0]] && storage.store[Object.keys(creep.store)[0]] < room.storage[Object.keys(creep.store)[0]]) {
            RechargeStorage(creep, creep.room);
        }
    }
}