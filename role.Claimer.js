let roleClaimer = {

    /** @param {Creep} creep **/
    run: function (creep) {
        creep.memory.targetRoom = 'W59S3';
        // if (creep.room.name !== creep.memory.targetRoom) {
        let roomPosition=new RoomPosition(26, 35, creep.memory.targetRoom);
        creep.moveTo(roomPosition);
        if (creep.room.controller.owner) {
            creep.attackController(Game.getObjectById("5bbca9dd9099fc012e630402"))
        } else {
            ClaimController(creep);
        }

        //TODO: Define a Reservation Strategy
        // if (!creep.room.controller.reservation) {
        //     let reservation = ReserveController(creep);
        //     if (reservation === 0) {
        //         console.log("Controller in " + creep.memory.targetRoom + " Successfully Reserved",);
        //         console.log(`Controller Status: ${Game.rooms['W59S3'].controller.reservation}`)
        //     }
        // }
    }
};

module.exports = roleClaimer;