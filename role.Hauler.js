let roleHauler = {

    /** @param {Creep} creep **/
    run: function (creep) {
        setHaulerParameter(creep)
        if (creep.memory.hauling) {
            if (RechargeExtension(creep)) {
                if (RechargeSpawn(creep)) {
                    if (RechargeTower(creep)) {
                        RechargeControllerContainer(creep);
                        if (creep.room.controller.level === 8) {
                            SupplyLabsEnergy(creep)
                            RechargeNuke(creep);
                            SupplyPowerSpawn(creep, RESOURCE_ENERGY);
                        }
                    }
                }
            }
        } else {
            if (creep.room.storage) {
                WithdrawFromStorage(creep, creep.room);
            } else {
                WithdrawFromEnergySourceContainer(creep);
            }
        }
    }
};

module.exports = roleHauler;

function setHaulerParameter(creep) {
    // Check Energy Capacity - if none, stop building and go harvest
    if (creep.memory.hauling && creep.store.getUsedCapacity() === 0) {
        creep.memory.hauling = false;
        creep.say('🔄 Reload');
    }
    // Reverse - if Energy Capacity is full, stop harvesting and go build
    if (!creep.memory.hauling && creep.store.getFreeCapacity() === 0) {
        creep.memory.hauling = true;
        creep.say('🚧 Haul');
    }
}