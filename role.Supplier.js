require('ReactionManager');

let roleSupplier = {

    /** @param {Creep} creep **/
    run: function (creep) {
        // setSupplierParameters(creep)
        // RunReaction_OH(creep);

        let lab_OH = Game.getObjectById("663965edf48de476a7806534")
        let lab_H = Game.getObjectById("661c080a84abd364af6a38aa")
        let lab_O = Game.getObjectById("6612f415dab103865daf1104")

        let lab_Compound = Game.getObjectById("66189963dd2e5f18cba1a7bb")
        let lab_OH2=Game.getObjectById('660c8e2de8810c3e9ac686c1');
        let lab_CompoundOH=Game.getObjectById('662439aacc0d268d35dbd4b4');

        // Check if the labs have the required resources
        // if (lab_O.mineralAmount <= (LAB_MINERAL_CAPACITY - 200)) {
        //     SupplyLabMineral(creep, lab_O, RESOURCE_OXYGEN)
        // }

        // if (lab_Compound.mineralAmount <= (LAB_MINERAL_CAPACITY - 200)) {
        //     SupplyLabMineral(creep, lab_Compound, RESOURCE_UTRIUM_HYDRIDE)
        // }

        // if (lab_Compound.mineralAmount <= (LAB_MINERAL_CAPACITY - 200)) {
        //     SupplyLabMineral(creep, lab_Compound, RESOURCE_GHODIUM_OXIDE)
        // }

        // if (lab_OH2.mineralAmount <= (LAB_MINERAL_CAPACITY - 200)) {
        //     SupplyLabMineral(creep, lab_OH2, RESOURCE_HYDROXIDE)
        // }
        // WithdrawEnergy(creep,lab_Compound,RESOURCE_KEANIUM_ALKALIDE)
        // RechargeStorage(creep,creep.room,RESOURCE_UTRIUM_HYDRIDE)
        // if (lab_H.mineralAmount <= (LAB_MINERAL_CAPACITY - 200)) {
        //     SupplyLabMineral(creep, lab_H, RESOURCE_HYDROGEN)
        // }

        // if (lab_OH.mineralAmount >= 200) {
        //     WithdrawLabMineral(creep, lab_OH, RESOURCE_HYDROXIDE)
        // } else {
        //     RechargeStorage(creep, creep.room, RESOURCE_HYDROXIDE)
        // }

        // if (lab_CompoundOH.mineralAmount >= 200) {
        //     WithdrawLabMineral(creep, lab_CompoundOH, RESOURCE_UTRIUM_ACID)
        // } else {
        //     RechargeStorage(creep, creep.room, RESOURCE_UTRIUM_ACID)
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

