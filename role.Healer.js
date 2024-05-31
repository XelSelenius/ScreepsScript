let roleHealer = {

    /** @param {Creep} creep **/
    run: function (creep) {
        let origin = Game.rooms['W59S4'];
        let target = 'W60S4';

        HealCreep(creep,target);
        // setHealerParameter(creep)
        // if (creep.memory.healing && creep.ticksToLive > 75) {
        // }
    }
};

module.exports = roleHealer;

function setHealerParameter(creep) {
    // Check Energy Capacity - if none, stop building and go harvest
    if (creep.memory.healing && creep.store[RESOURCE_ENERGY] === 0) {
        creep.memory.healing = false;
        creep.say('🔄 Charging');
    }
    // Reverse - if Energy Capacity is full, stop harvesting and go build
    if (!creep.memory.healing && creep.store.getFreeCapacity() === 0) {
        creep.memory.healing = true;
        creep.say('🚧 Healing');
    }
}