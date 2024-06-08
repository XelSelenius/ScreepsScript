let roleAttacker = {

    /** @param {Creep} creep **/
    run: function (creep) {
        let target = 'W60S4';
        PowerBankRobbery(creep, target, STRUCTURE_POWER_BANK);
    }
};

module.exports = roleAttacker;

function setAttackerParameter(creep) {
    // Check Energy Capacity - if none, stop building and go harvest
    if (creep.memory.attack && creep.store[RESOURCE_ENERGY] === 0) {
        creep.memory.attack = false;
        creep.say('🔄 Charging');
    }
    // Reverse - if Energy Capacity is full, stop harvesting and go build
    if (!creep.memory.attack && creep.store.getFreeCapacity() === 0) {
        creep.memory.attack = true;
        creep.say('🚧 Healing');
    }
}