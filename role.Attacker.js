let roleAttacker = {

    /** @param {Creep} creep **/
    run: function (creep) {
        // let target = 'W60S4';
        let targetRoom = 'W58S5';
        // PowerBankRobbery(creep, target, STRUCTURE_POWER_BANK);
        // attackTarget(creep,targetRoom)
        creep.moveTo(Game.getObjectById("64b12ad68a7e932bac7e2f69"));
        creep.attack(Game.getObjectById("64b12ad68a7e932bac7e2f69"));
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

function attackTarget(creep, targetRoom) {
    if (creep.room.name !== targetRoom) {
        // Move to the target room
        creep.moveTo(new RoomPosition(11, 37, targetRoom), { visualizePathStyle: { stroke: '#ff0000' } });
    } else {
        // Find the nearest hostile creep or structure
        const target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS) ||
            creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES);

        if (target) {
            if (creep.attack(target) === ERR_NOT_IN_RANGE) {
                // Move towards the target if not in range
                creep.moveTo(target, { visualizePathStyle: { stroke: '#ff0000' } });
            }
        } else {
            // No targets found; move to the center of the room
            creep.moveTo(25, 25, { visualizePathStyle: { stroke: '#ff0000' } });
        }
    }
}