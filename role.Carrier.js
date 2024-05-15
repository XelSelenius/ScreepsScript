let roleCarrier = {

    /** @param {Creep} creep
     * Designed as an Inter-Room Fearing Creep
     */
    run: function (creep) {
        setCarrierParameter(creep)

        let originRoom = Game.rooms['W59S5'];
        let targetRoom = Game.rooms['W59S4'];
        let cargo = RESOURCE_HYDROGEN;

        if (creep.memory.carrier) {
            WithdrawFromStorage(creep, originRoom, cargo)
        } else {
            RechargeStorage(creep, targetRoom);
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