let roleMiner = {

    /** @param {Creep} creep **/
    run: function (creep) {
        let origin = Game.rooms['W59S4'];
        let target = Game.rooms['W60S4'];
        setMinerParameter(creep)
        if (creep.memory.mining && creep.ticksToLive > 150) {
            CorridorMining(creep, target.name);
        } else {
            RechargeStorage(creep, origin, RESOURCE_METAL);
        }
    }
};

module.exports = roleMiner;

function setMinerParameter(creep) {
    // Check Energy Capacity - if none, stop building and go harvest
    if (creep.memory.mining && creep.store.getUsedCapacity() === 0) {
        creep.memory.mining = false;
        creep.say('🔄 Deposit');
    }
    // Reverse - if Energy Capacity is full, stop harvesting and go build
    if (!creep.memory.mining && creep.store.getUsedCapacity() > 0) {
        creep.memory.mining = true;
        creep.say('🚧 Mine');
    }
}