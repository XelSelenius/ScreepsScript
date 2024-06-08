const roleTombraider = {

    /** @param {Creep} creep **/
    run: function (creep) {
        setLootingParameter(creep)
        if (creep.memory.looting) {
            creep.say('🚧 Loot');
            Tombraiding(creep);
            WithdrawFromEnergySourceContainer(creep);
            if (creep.ticksToLive < 300) {
                creep.suicide();
            }
            let mineral = creep.room.find(FIND_MINERALS)
            let mineralContainer = mineral[0].pos.findInRange(FIND_STRUCTURES, 2, {
                filter: s => s.structureType === STRUCTURE_CONTAINER
            });
            let resource;
            switch (mineral[0].mineralType) {
                case 'Z':
                    resource = RESOURCE_ZYNTHIUM;
                    break;
                case 'H':
                    resource = RESOURCE_HYDROGEN;
                    break;
                case 'O':
                    resource = RESOURCE_OXYGEN;
                    break;
            }
            if (mineralContainer.length > 0 && mineralContainer[0].store.getUsedCapacity() > 200) {
                WithdrawEnergy(creep, mineralContainer[0], resource);
            }
        } else {
            if (creep.room.name === "W58S3") {
                RechargeStorage(creep, Game.rooms["W59S3"])
            }
            creep.say('🔄 Deploy');
            RechargeStorage(creep, creep.room);
        }

        // if (creep.room.energyAvailable <= 1500) {
        //     if (creep.store.getUsedCapacity() === 0) {
        //         WithdrawFromStorage(creep, creep.room, RESOURCE_ENERGY);
        //     } else {
        //         RechargeExtension(creep);
        //         RechargeSpawn(creep);
        //         RechargeTower(creep);
        //     }
        // }
    }
};

module.exports = roleTombraider;

function setLootingParameter(creep) {
    // Check Energy Capacity - if none, stop building and go harvest
    if (creep.memory.looting && creep.store.getFreeCapacity() === 0) {
        creep.memory.looting = false;
        creep.say('🔄 Deploy');
    }
    // Reverse - if Energy Capacity is full, stop harvesting and go build
    if (!creep.memory.looting && creep.store.getUsedCapacity() === 0) {
        creep.memory.looting = true;
        creep.say('🚧 Loot');
    }
}