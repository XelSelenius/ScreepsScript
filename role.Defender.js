require('CreepActionManager')

const roleDefender = {
    /** @param {Creep} creep **/
    run: function (creep) {

        creep.memory.targetRoom = 'W59S3';
        let target = new RoomPosition(20, 44, creep.memory.targetRoom)
        creep.moveTo(target);
        creep.attack(Game.getObjectById("65899b65d97500439e3b7a0e"))

        // // Check for hostile creeps in the room
        // const hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
        // // console.log(`Hostiles: ${hostiles.length}`)
        //
        // // if (hostiles.length > 0) {
        //     Attack(creep,hostiles)
        // // } else {
        //     Defend(creep,hostiles)
        // // }
    }
};

module.exports = roleDefender;