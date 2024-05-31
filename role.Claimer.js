let roleClaimer = {

    /** @param {Creep} creep **/
    run: function (creep) {
        creep.memory.targetRoom = 'W59S7';
        let roomPosition = new RoomPosition(8, 6, creep.memory.targetRoom);
        creep.moveTo(roomPosition);

        //Claim or Reserve Controller
        ClaimController(creep);
        // ReserveController(creep);
    }
};

module.exports = roleClaimer;