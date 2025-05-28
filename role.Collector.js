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
            DeliverPower(creep)
            Salvage(creep, RESOURCE_ENERGY);
            creep.memory.collecting = false;
        } else {
            // creep.say('🔄 Deploy');
            if (creep.store[RESOURCE_POWER]) {
                SupplyPowerSpawn(creep, RESOURCE_POWER);
            } else {
                for (let item in creep.store) {
                    SupplyTerminal(creep,item)
                }
            }
        }

        // if (creep.room.energyAvailable <= 1500) {
        //     creep.say('112')
        //     if (creep.store[RESOURCE_ENERGY] === 0) {
        //         // RechargeStorage(creep, creep.room);
        //         if(creep.room.storage.store[RESOURCE_ENERGY] === 0){
        //             WithdrawFromTerminal(creep, creep.room, RESOURCE_ENERGY);
        //         }else{
        //             WithdrawFromStorage(creep, creep.room, RESOURCE_ENERGY);
        //         }
        //     } else {
        //         RechargeExtension(creep);
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