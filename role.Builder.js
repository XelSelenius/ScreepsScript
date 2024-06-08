require('EnergyGridManager');
require('CreepActionManager');

let roleBuilder = {

    /** @param {Creep} creep **/
    run: function (creep) {
        setBuildingParameter(creep);

        //Define Actions when creep is full of Energy
        if (creep.memory.building) {
            if (Memory.rooms[creep.room.name].constructionSites.length > 0) {
                Build(creep, creep.room.name);
            } else {
                Reinforce(creep);
            }

        //Define Recharging Strategy as per room Level
        } else {
            if (creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] > 0) {
                RechargeCreep(creep, 'S')
            } else if(creep.room.terminal){
                RechargeCreep(creep, 'T')
            } else {
                RechargeCreep(creep,'C')
            }

            if (Game.rooms[creep.room.name].controller.level === 1) {
                RechargeCreep(creep, 'M')
            }
        }
    }
};

module.exports = roleBuilder;

/**
 * Sets parameters that would define if the creep needs to recharge, or it still can perform its duties.
 * @param creep
 */
function setBuildingParameter(creep) {
    // Check Energy Capacity - if none, stop building and go harvest
    if (creep.memory.building && creep.store[RESOURCE_ENERGY] === 0) {
        creep.memory.building = false;
        creep.say('🔄 Charge');
    }
    // Reverse - if Energy Capacity is full, stop harvesting and go build
    if (!creep.memory.building && creep.store.getFreeCapacity() === 0) {
        creep.memory.building = true;
        creep.say('🚧 Build');
    }
}