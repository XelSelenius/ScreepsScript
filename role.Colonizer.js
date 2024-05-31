let roleColonizer = {

    /** @param {Creep} creep
     * Designed as an Inter-Room Upgrade and Multi-Tasking
     */
    run: function (creep) {
        setColonizationParameter(creep)

        let originRoom = Game.rooms['W59S3'];
        let targetRoom = Game.rooms['W59S7'];

        if (creep.memory.colonization) {
            //Make it to Level 4 and build Storage
            if (targetRoom.controller.level < 4) {
                creep.moveTo(targetRoom.controller);
                Upgrade(creep, targetRoom);
            } else {
                //Micromanage what is a priority
                Build(creep, targetRoom.name);
                RechargeTower(creep)
                RechargeExtension(creep);
                RechargeSpawn(creep)
            }
        } else {
            //Eliminate losses by self-destruction
            if (creep.ticksToLive <= 50) {
                creep.suicide();
            }

            //Have a head-start and refill before you go
            if (creep.room.name === originRoom.name) {
                WithdrawFromStorage(creep, originRoom, RESOURCE_ENERGY)
            }

            //Optional
            Salvage(creep, RESOURCE_ENERGY)
            Tombraiding(creep);
            ConductCollection(creep);

            //Primary Energy Consumption
            if (creep.room.name === targetRoom.name) {
                RechargeCreep(creep, 'M')
            }

            //Post Container-Harvester Construction
            WithdrawFromEnergySourceContainer(creep)
        }
    }
};

module.exports = roleColonizer;

function setColonizationParameter(creep) {
    // Check Energy Capacity - if none, stop building and go harvest
    if (creep.store.getUsedCapacity() === 0) {
        creep.memory.colonization = false;
        // creep.say('🔄 Reload');
    }
    // Reverse - if Energy Capacity is full, stop harvesting and go build
    if (creep.store.getFreeCapacity() === 0) {
        creep.memory.colonization = true;
        // creep.say('🚧 Colonize');
    }
}