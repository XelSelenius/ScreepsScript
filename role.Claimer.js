let roleClaimer = {

    /** @param {Creep} creep **/
    run: function (creep) {
        creep.memory.targetRoom = 'W59S6';
        let roomPosition = new RoomPosition(8, 6, creep.memory.targetRoom);
        if (creep.claimController(Game.rooms[creep.memory.targetRoom].controller) === ERR_NOT_IN_RANGE)
            creep.moveTo(creep.room.controller.pos, {visualizePathStyle: {stroke: '#ff0000'}});
    }
};

module.exports = roleClaimer;