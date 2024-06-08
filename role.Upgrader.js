let roleUpgrader = {

    /** @param {Creep} creep **/
    run: function (creep) {
        setUpgradingParameter(creep);
        let controller = creep.room.find(FIND_STRUCTURES, {
            filter: controller => controller.structureType === STRUCTURE_CONTROLLER
        })[0];
        //Define Actions when creep is full of Energy
        if (creep.memory.upgrading) {
            Upgrade(creep, creep.room);

            //Define Recharging Strategy as per room Level
        } else {
            if (controller) {
                let chargingPoint = creep.room.controller.pos.findInRange(FIND_STRUCTURES, 3, {
                    filter: s => (s.structureType === STRUCTURE_STORAGE
                        || s.structureType === STRUCTURE_CONTAINER
                        || s.structureType === STRUCTURE_LINK) && s.store[RESOURCE_ENERGY] > 0
                });

                if (chargingPoint.length > 0) {
                    if (chargingPoint[0].structureType === STRUCTURE_STORAGE) {
                        RechargeCreep(creep, 'S')
                    }
                    if (chargingPoint[0].structureType === STRUCTURE_CONTAINER) {
                        RechargeCreep(creep, 'C')
                    }
                    if (chargingPoint[0].structureType === STRUCTURE_LINK) {
                        RechargeCreep(creep, 'L')
                    }
                } else if (creep.room.controller.level === 1) {
                    RechargeCreep(creep, 'M')
                }
            }
        }
    }
};

module.exports = roleUpgrader;

/**
 * @param creep
 */
function setUpgradingParameter(creep) {
    // Check Energy Capacity - if none, stop building and go harvest
    if (!creep.memory.upgrading && creep.store.getFreeCapacity() === 0) {
        creep.memory.upgrading = true;
        creep.say('🔄 Upgrading');
    }
    // Reverse - if Energy Capacity is full, stop harvesting and go build
    if (creep.memory.upgrading && creep.store.getUsedCapacity() === 0) {
        creep.memory.upgrading = false;
        creep.say('🚧 Recharging');
    }
}