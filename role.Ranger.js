const roleRanger = {
    /** @param {Creep} creep **/
    run: function (creep) {

        // Check for hostile creeps in the room
        const hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
        // console.log(`Hostiles: ${hostiles.length}`)

        // if (hostiles.length > 0) {
        //     Attack(creep,hostiles)
        // } else {
        Defend(creep,hostiles)
        // }
    }
};

module.exports = roleRanger;