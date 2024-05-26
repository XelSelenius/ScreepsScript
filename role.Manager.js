let roleManager = {

    /** @param {Creep} creep **/
    run: function (creep) {
        setManagerParameter(creep)

        let FACTORY_ENERGY = 2000;
        let TERMINAL_ENERGY = 25000;

        let storage = creep.room.storage;

        let factory = creep.room.find(FIND_MY_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_FACTORY
        })[0];

        let terminal = creep.room.find(FIND_MY_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_TERMINAL
        })[0];

        let storageLink = creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {
            filter: s => s.structureType === STRUCTURE_LINK
        })[0];

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
        }

        if (creep.memory.managing) {
            switch (Object.keys(creep.store)[0]) {
                case RESOURCE_ZYNTHIUM:
                    SupplyFactory(creep, RESOURCE_ZYNTHIUM);
                    break;
                case RESOURCE_HYDROGEN:
                    SupplyFactory(creep, RESOURCE_HYDROGEN);
                    break;
                case RESOURCE_OXYGEN:
                    SupplyFactory(creep, RESOURCE_OXYGEN);
                    break;
                case RESOURCE_ZYNTHIUM_HYDRIDE:
                    SupplyTerminal(creep, RESOURCE_ZYNTHIUM_HYDRIDE);
                    break;
                case RESOURCE_GHODIUM_OXIDE:
                    SupplyTerminal(creep, RESOURCE_GHODIUM_OXIDE);
                    break;
                case RESOURCE_KEANIUM_OXIDE:
                    SupplyTerminal(creep, RESOURCE_KEANIUM_OXIDE);
                    break;
                case RESOURCE_UTRIUM_HYDRIDE:
                    SupplyTerminal(creep, RESOURCE_UTRIUM_HYDRIDE);
                    break;
                case RESOURCE_OXIDANT:
                    SupplyTerminal(creep, RESOURCE_OXIDANT);
                    break;
                case RESOURCE_REDUCTANT:
                    SupplyTerminal(creep, RESOURCE_REDUCTANT);
                    break;
                case RESOURCE_ZYNTHIUM_BAR:
                    SupplyTerminal(creep, RESOURCE_ZYNTHIUM_BAR);
                    break;
                case RESOURCE_POWER:
                    SupplyTerminal(creep, RESOURCE_POWER);
                    break;
                case RESOURCE_HYDROXIDE:
                    SupplyTerminal(creep, RESOURCE_HYDROXIDE);
                    break;
                case RESOURCE_ENERGY:
                    if (factory && factory.store[RESOURCE_ENERGY] < FACTORY_ENERGY) {
                        SupplyFactory(creep, RESOURCE_ENERGY);
                    } else if (terminal && terminal.store[RESOURCE_ENERGY] < TERMINAL_ENERGY) {
                        SupplyTerminal(creep, RESOURCE_ENERGY);
                    } else {
                        RechargeStorage(creep, creep.room, RESOURCE_ENERGY);
                    }
                    break;
            }
        } else {
            if (storageLink && storageLink.store[RESOURCE_ENERGY] > 0) {
                WithdrawEnergy(creep, storageLink, RESOURCE_ENERGY);
            }

            if (factory.store[RESOURCE_ENERGY] > FACTORY_ENERGY && factory.store.getFreeCapacity() > 500
                && terminal.store[RESOURCE_ENERGY] > TERMINAL_ENERGY && terminal.store.getFreeCapacity() > 0) {
                if (storage.store[RESOURCE_ENERGY] < storage.store.getUsedCapacity()) {
                    for (let resource in storage.store) {
                        if (resource !== RESOURCE_ENERGY) {
                            WithdrawFromStorage(creep, creep.room, resource);
                        }
                    }
                }
            }

            //TODO:Use roomData to pass the given resource through there. This will reduce the amount of ifs.
            if (factory && factory.store[RESOURCE_ZYNTHIUM_BAR]) {
                WithdrawEnergy(creep, factory, RESOURCE_ZYNTHIUM_BAR);
            }
            if (factory && factory.store[RESOURCE_OXIDANT]) {
                WithdrawEnergy(creep, factory, RESOURCE_OXIDANT);
            }
            if (factory && factory.store[RESOURCE_REDUCTANT]) {
                WithdrawEnergy(creep, factory, RESOURCE_REDUCTANT);
            }
            WithdrawFromNonEmptyContainer(creep)
        }
    }
};

module.exports = roleManager;

function setManagerParameter(creep) {
    // Check Energy Capacity - if none, stop building and go harvest
    if (creep.memory.managing && creep.store.getUsedCapacity() === 0) {
        creep.memory.managing = false;
        creep.say('🔄 Reload');
    }
    // Reverse - if Energy Capacity is full, stop harvesting and go build
    if (!creep.memory.managing && creep.store.getUsedCapacity() > 0) {
        creep.memory.managing = true;
        creep.say('🚧 Manage');
    }
}