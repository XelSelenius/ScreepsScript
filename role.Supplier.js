require('ReactionManager');

let roleSupplier = {

    /** @param {Creep} creep **/
    run: function (creep) {
        // setSupplierParameters(creep)
        // RunReaction_OH(creep);

        let lab_OH = Game.getObjectById("663965edf48de476a7806534")
        let lab_H = Game.getObjectById("661c080a84abd364af6a38aa")
        let lab_O = Game.getObjectById("6612f415dab103865daf1104")

        // Check if the labs have the required resources
        // if (lab_O.mineralAmount <= (LAB_MINERAL_CAPACITY - 200)) {
        //     SupplyLabMineral(creep, lab_O, RESOURCE_OXYGEN)
        // }

        // if (lab_H.mineralAmount <= (LAB_MINERAL_CAPACITY - 200)) {
        //     SupplyLabMineral(creep, lab_H, RESOURCE_HYDROGEN)
        // }

        // if (lab_OH.mineralAmount > 200) {
        //     WithdrawLabMineral(creep, lab_OH, RESOURCE_HYDROXIDE)
        // } else {
        //     RechargeStorage(creep, creep.room, RESOURCE_HYDROXIDE)
        // }
    }
};

module.exports = roleSupplier;

function setSupplierParameters(creep) {
    // Check Energy Capacity - if none, stop supplying and go harvest
    if (creep.memory.suppling && creep.store.getUsedCapacity() === 0) {
        creep.memory.suppling = false;
        creep.say('🔄 Recharge');
    }
    // Reverse - if Energy Capacity is full, stop harvesting and go build
    if (!creep.memory.suppling && creep.store.getFreeCapacity() === 0) {
        creep.memory.suppling = true;
        creep.say('⚡ Supply');
    }
}

