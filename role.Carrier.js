let roleCarrier = {

    /** @param {Creep} creep
     * Designed as an Inter-Room Fearing Creep
     */
    run: function (creep) {
        setCarrierParameter(creep)
        creep.memory.targetRoom = 'W59S3';
        creep.memory.originRoom = 'W59S4';
        if (creep.memory.carrier) {
            WithdrawFromStorage(creep, Game.rooms[creep.memory.originRoom])
        } else {
            RechargeStorage(creep, Game.rooms[creep.memory.targetRoom]);
        }
    }
};

module.exports = roleCarrier;

/**
 * Set parameters of direction of the Carrier - going or returning
 * @param creep
 */
function setCarrierParameter(creep) {
    // Check Energy Capacity - if none, stop building and go harvest
    if (creep.memory.carrier && creep.store.getFreeCapacity() === 0) {
        creep.memory.carrier = false;
        creep.say('🔄 Reload');
    }
    // Reverse - if Energy Capacity is full, stop harvesting and go build
    if (!creep.memory.carrier && creep.store.getUsedCapacity() === 0) {
        creep.memory.carrier = true;
        creep.say('🚧 Haul');
    }
}