require('ReactionManager');

let roleSupplier = {

    /** @param {Creep} creep *
     * @param room
     */
    run: function (creep, room) {
        //Commission the Labs in the room.
        let labs = creep.room.find(FIND_MY_STRUCTURES, {
            filter: {structureType: STRUCTURE_LAB}
        });

        let RoomLabs = RoomLabsClassification(labs);

        let terminal = creep.room.terminal;
        room = room[creep.room.name];

        let StatusObserver = {
            'Lab1': RoomLabs.Lab1.mineralAmount <= LAB_MINERAL_CAPACITY - 200,
            'Lab2': RoomLabs.Lab2.mineralAmount <= LAB_MINERAL_CAPACITY - 200,
            'Lab3': RoomLabs.Lab3.mineralAmount <= LAB_MINERAL_CAPACITY - 200,
            'Lab4': RoomLabs.Lab4.mineralAmount <= LAB_MINERAL_CAPACITY - 200,
            'Lab5': RoomLabs.Lab5.mineralAmount <= LAB_MINERAL_CAPACITY - 200,
            'Lab6': RoomLabs.Lab6.mineralAmount <= LAB_MINERAL_CAPACITY - 200,
            'Reaction1': RoomLabs.Reaction1.mineralAmount >= 200,
            'Reaction2': RoomLabs.Reaction2.mineralAmount >= 200,
            'Reaction3_1': RoomLabs.Reaction3_1.mineralAmount >= 200,
            'Reaction3_2': RoomLabs.Reaction3_1.mineralAmount >= 200,
        };

        RunReaction1(RoomLabs, creep.room);
        RunReaction2(RoomLabs, creep.room);
        RunReaction3(RoomLabs, creep.room);

        for (let lab in RoomLabs) {
            let mineral = room.reactions[lab]
            if (lab[0] === 'R' && RoomLabs[lab].mineralAmount >= 200) {
                if (creep.store.getUsedCapacity() > 0) {
                    RechargeStorage(creep, creep.room);
                    return;
                }
                WithdrawEnergy(creep, RoomLabs[lab], mineral);
                return;
            }
            if (lab[0] === 'L' && (terminal.store[mineral] || creep.store[mineral]) && RoomLabs[lab].mineralAmount <= LAB_MINERAL_CAPACITY - 200) {
                if (!creep.store[mineral] && creep.store.getUsedCapacity() > 0) {
                    RechargeStorage(creep, creep.room);
                    return;
                } else {
                    WithdrawFromTerminal(creep, creep.room, mineral);
                    if (creep.store[mineral]) {
                        TransferEnergy(creep, RoomLabs[lab], mineral);
                    }
                    return;
                }
            }
        }
        SupplyTerminal(creep, Object.keys(creep.store)[0]);
    }
}

module.exports = roleSupplier;

function setSupplierParameter(creep) {
    // Check Energy Capacity - if none, stop building and go harvest
    if (creep.memory.suppling && creep.store.getUsedCapacity() === 0) {
        creep.memory.suppling = false;
        creep.say('🔄 Reload');
    }
    // Reverse - if Energy Capacity is full, stop harvesting and go build
    if (!creep.memory.suppling && creep.store.getFreeCapacity() === 0) {
        creep.memory.suppling = true;
        creep.say('🚧 Haul');
    }
}