require('EnergyGridManager')

let roleCollector = {

    /** @param {Creep} creep **/
    run: function (creep) {
        setCollectingParameter(creep)

        if (creep.memory.collecting) {
            creep.say('🔄 Collecting');
            if (creep.ticksToLive <= 50) {
                creep.suicide();
            }

            //Choose Activity
            ConductCollection(creep);
            // WithdrawFromEnergySourceContainer(creep);
            // DeliverPower(creep)
            Salvage(creep, RESOURCE_KEANIUM)
        } else {
            creep.say('🔄 Deploy');
            if (creep.store[RESOURCE_POWER]) {
                SupplyPowerSpawn(creep, RESOURCE_POWER);
            } else {
                RechargeStorage(creep, creep.room);
            }
        }

        // if (creep.room.energyAvailable <= 1000) {
        //     if(creep.store.getUsedCapacity()===0){
        //         WithdrawFromStorage(creep, creep.room, RESOURCE_ENERGY);
        //     } else{
        //         RechargeExtension(creep);
        //         RechargeSpawn(creep);
        //         RechargeTower(creep);
        //     }
        // }
    }
};

module.exports = roleCollector;

function setCollectingParameter(creep) {
    // Check Energy Capacity - if none, stop building and go harvest
    if (!creep.memory.collecting && creep.store.getUsedCapacity() === 0) {
        creep.memory.collecting = true;
        creep.say('🔄 Collecting');
    }
    // Reverse - if Energy Capacity is full, stop harvesting and go build
    if (creep.memory.collecting && creep.store.getFreeCapacity() === 0) {
        creep.memory.collecting = false;
        creep.say('🚧 Storing');
    }
}