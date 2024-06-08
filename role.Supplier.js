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

        room = room[creep.room.name];

        let StatusObserver = {
            'Lab1': RoomLabs.Lab1.mineralAmount <= LAB_MINERAL_CAPACITY - 200,
            'Lab2': RoomLabs.Lab2.mineralAmount <= LAB_MINERAL_CAPACITY - 200,
            'Lab3': RoomLabs.Lab3.mineralAmount <= LAB_MINERAL_CAPACITY - 200,
            'Lab4': RoomLabs.Lab4.mineralAmount <= LAB_MINERAL_CAPACITY - 200,
            // 'Lab5': RoomLabs.Lab5.mineralAmount <= LAB_MINERAL_CAPACITY - 200,
            // 'Lab6': RoomLabs.Lab6.mineralAmount <= LAB_MINERAL_CAPACITY - 200,
            'Reaction1': RoomLabs.Reaction1.mineralAmount >= 200,
            'Reaction2': RoomLabs.Reaction2.mineralAmount >= 200,
        };

        RunReaction1(RoomLabs, creep.room)
        RunReaction2(RoomLabs, creep.room)

        if (StatusObserver.Lab1) {
            console.log(room.reactions.Lab1)
            if (creep.store[room.reactions.Lab1] === 0) {
                WithdrawFromTerminal(creep, creep.room, room.reactions.Lab1);
            } else if(creep.store[room.reactions.Lab1]){
                TransferEnergy(creep, RoomLabs.Lab1, room.reactions.Lab1);
            }
        } else if (StatusObserver.Lab2) {
            if (creep.store[room.reactions.Lab2] === 0) {
                WithdrawFromTerminal(creep, creep.room, room.reactions.Lab2);
            } else if(creep.store[room.reactions.Lab2]){
                TransferEnergy(creep, RoomLabs.Lab2, room.reactions.Lab2);
            }
        } else if (StatusObserver.Lab3) {
            if (creep.store[room.reactions.Lab3] === 0) {
                WithdrawFromTerminal(creep, creep.room, room.reactions.Lab3);
            } else {
                TransferEnergy(creep, RoomLabs.Lab3, room.reactions.Lab3);
            }
        } else if (StatusObserver.Lab4) {
            if (creep.store[room.reactions.Lab4] === 0) {
                WithdrawFromTerminal(creep, creep.room, room.reactions.Lab4);
            } else {
                TransferEnergy(creep, RoomLabs.Lab4, room.reactions.Lab4);
            }
        } else if (StatusObserver.Reaction1) {
            if (creep.store.getFreeCapacity() === 0) {
                RechargeStorage(creep, creep.room);
            } else {
                WithdrawEnergy(creep, RoomLabs.Reaction1, room.reactions.Reaction1);
            }
        } else if (StatusObserver.Reaction2) {
            if (creep.store.getFreeCapacity() === 0) {
                RechargeStorage(creep, creep.room);
            } else {
                WithdrawEnergy(creep, RoomLabs.Reaction2, room.reactions.Reaction2);
            }
        } else{
            if (creep.store.getUsedCapacity() > 0) {
                for (const resourceType in creep.store) {
                    if (creep.store[resourceType] > 0) {
                        SupplyTerminal(creep, resourceType);
                    }
                }
            }
        }
    }
}

module.exports = roleSupplier;

function RoomLabsClassification(labs) {
    let masterLab1;
    let slaveLabs1;
    let masterLab2;
    let slaveLabs2;
    let catalyzerLab1;
    let catalyzerLab2;
    let pre_catLabs;

    // Helper function to remove a lab and its nearby labs from the list
    const removeLabs = (labs, masterLab, slaveLabs) => {
        const labIdsToRemove = new Set([masterLab.id, ...slaveLabs.map(lab => lab.id)]);
        return labs.filter(lab => !labIdsToRemove.has(lab.id));
    };

    // // Find first catalyzer lab
    // labs.forEach(lab => {
    //     let nearbyLabs = labs.filter(otherLab => lab.pos.inRangeTo(otherLab, 1) && lab.id !== otherLab.id);
    //     console.log(lab)
    //     if (nearbyLabs.length >= 2 && !catalyzerLab1) {
    //         catalyzerLab1 = lab;
    //     }
    // });
    //
    // // Remove the first catalyzer lab
    // labs = labs.filter(lab => lab.id !== catalyzerLab1.id);
    // console.log(`${catalyzerLab1} is fucked up`)

    // // Find second catalyzer lab
    // labs.forEach(lab => {
    //     let nearbyLabs = labs.filter(otherLab => lab.pos.inRangeTo(otherLab, 1) && lab.id !== otherLab.id);
    //     if (nearbyLabs.length >= 2 && !catalyzerLab2) {
    //         catalyzerLab2 = lab;
    //     }
    // });
    //
    // // Remove the second catalyzer lab
    // labs = labs.filter(lab => lab.id !== catalyzerLab2.id);

    // Find first master lab and its slaves
    labs.forEach(lab => {
        let nearbyLabs = labs.filter(otherLab => lab.pos.inRangeTo(otherLab, 1) && lab.id !== otherLab.id);
        if (nearbyLabs.length === 2 && !masterLab1) {
            masterLab1 = lab;
            slaveLabs1 = nearbyLabs.slice(0, 2);
        }
    });

    // Remove the first master lab and its slaves
    labs = removeLabs(labs, masterLab1, slaveLabs1);

    // Find second master lab and its slaves
    labs.forEach(lab => {
        let nearbyLabs = labs.filter(otherLab => lab.pos.inRangeTo(otherLab, 1) && lab.id !== otherLab.id);
        if (nearbyLabs.length === 2 && !masterLab2) {
            masterLab2 = lab;
            slaveLabs2 = nearbyLabs.slice(0, 2);
        }
    });

    // Remove the second master lab and its slaves
    labs = removeLabs(labs, masterLab2, slaveLabs2);

    // // Remaining labs are slaveCatalyzerLabs
    // pre_catLabs = labs;

    return {
        'Lab1': slaveLabs1[0],
        'Lab2': slaveLabs1[1],
        'Lab3': slaveLabs2[0],
        'Lab4': slaveLabs2[1],
        'Reaction1': masterLab1,
        'Reaction2': masterLab2,
        // 'Reaction3_1': catalyzerLab1,
        // 'Reaction3_2': catalyzerLab2,
        // 'Lab5': pre_catLabs[0] ? pre_catLabs[0] : null,
        // 'Lab6': pre_catLabs[1] ? pre_catLabs[1] : null
    };
}

function RunReaction1(RoomLabs, room) {
    let reaction1 = RoomLabs.Reaction1.runReaction(RoomLabs.Lab1, RoomLabs.Lab2);
    if (reaction1 === OK) {
        console.log(`${room.name} Reaction 1 Initialized`)
    }
}

function RunReaction2(RoomLabs, room) {
    let reaction2 = RoomLabs.Reaction2.runReaction(RoomLabs.Lab3, RoomLabs.Lab4);
    if (reaction2 === OK) {
        console.log(`${room.name} Reaction 2 Initialized`)
    }
}