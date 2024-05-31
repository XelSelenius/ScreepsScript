let roleHarvester = {

    /** @param {Creep} creep **/
    run: function (creep) {
        Mine(creep);
        let droppedEnergy=creep.pos.findInRange(FIND_DROPPED_RESOURCES,1);
        if(droppedEnergy[0]){
            creep.pickup(droppedEnergy[0]);
        }
        let deploymentPoint = Game.getObjectById(creep.memory.sourceId).pos.findInRange(FIND_STRUCTURES, 2, {
            filter: s => s.structureType === STRUCTURE_CONTAINER
                || s.structureType === STRUCTURE_STORAGE
                || s.structureType === STRUCTURE_LINK
        });
        if (deploymentPoint.length > 0 && creep.store.getUsedCapacity() > 0) {
            if (deploymentPoint[0].structureType === STRUCTURE_STORAGE) {
                RechargeStorage(creep, creep.room)
            }
            if (deploymentPoint[0].structureType === STRUCTURE_CONTAINER) {
                RechargeContainer(creep);
            }
            if (deploymentPoint[0].structureType === STRUCTURE_LINK) {
                RechargeLink(creep);
            }
        }
    }
};

module.exports = roleHarvester;