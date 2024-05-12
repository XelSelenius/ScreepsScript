let roleManager = {

    /** @param {Creep} creep **/
    run: function (creep) {
        setManagerParameter(creep)
        let storage = creep.room.storage;
        let factory = Game.getObjectById('65d71e80e4219d254f628572');
        let terminal = Game.getObjectById('65d72196e456720d57347646');
        let storageLink = Game.getObjectById('65dd931c21504f238816cc46');
        creep.moveTo(new RoomPosition(14, 31, creep.room.name))

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
                case RESOURCE_KEANIUM_OXIDE:
                    SupplyTerminal(creep, RESOURCE_KEANIUM_OXIDE);
                    break;
                case RESOURCE_GHODIUM_OXIDE:
                    SupplyTerminal(creep, RESOURCE_GHODIUM_OXIDE);
                    break;
                case RESOURCE_UTRIUM_HYDRIDE:
                    SupplyTerminal(creep, RESOURCE_UTRIUM_HYDRIDE);
                    break;
                case RESOURCE_OXIDANT:
                    SupplyTerminal(creep, RESOURCE_OXIDANT);
                    break;
                case RESOURCE_ZYNTHIUM_BAR:
                    SupplyTerminal(creep, RESOURCE_ZYNTHIUM_BAR);
                    break;
                case RESOURCE_ENERGY:
                    if (factory.store[RESOURCE_ENERGY] < 2000) {
                        SupplyFactory(creep, RESOURCE_ENERGY);
                    } else if (terminal.store[RESOURCE_ENERGY] < 10000) {
                        SupplyTerminal(creep, RESOURCE_ENERGY);
                    } else {
                        RechargeStorage(creep, creep.room, RESOURCE_ENERGY);
                    }
                    break;
            }
        } else {
            if (storageLink.store[RESOURCE_ENERGY] > 0) {
                WithdrawEnergy(creep, storageLink, RESOURCE_ENERGY);
            }
            if (storage.store[RESOURCE_ENERGY] < storage.store.getUsedCapacity()) {
                for (let resource in storage.store) {
                    if (resource !== RESOURCE_ENERGY) {
                        WithdrawFromStorage(creep, creep.room, resource);
                    }
                }
            }
            //TODO:Use roomData to pass the given resource through there. This will reduce the amount of ifs.
            if (factory.store[RESOURCE_ZYNTHIUM_BAR]) {
                WithdrawEnergy(creep, factory, RESOURCE_ZYNTHIUM_BAR);
            }
            if (factory.store[RESOURCE_OXIDANT]) {
                WithdrawEnergy(creep, factory, RESOURCE_OXIDANT);
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