require("lodash");

global.RoomLabsClassification = RoomLabsClassification;
global.RunReaction1 = RunReaction1;
global.RunReaction2 = RunReaction2;
global.RunReaction3 = RunReaction3;

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

    // Find first catalyzer lab
    labs.forEach(lab => {
        let nearbyLabs = labs.filter(otherLab => lab.pos.inRangeTo(otherLab, 1) && lab.id !== otherLab.id);
        if (nearbyLabs.length >= 2 && !catalyzerLab1) {
            catalyzerLab1 = lab;
        }
    });

    // Remove the first catalyzer lab
    labs = labs.filter(lab => lab.id !== catalyzerLab1.id);

    // Find second catalyzer lab
    labs.forEach(lab => {
        let nearbyLabs = labs.filter(otherLab => lab.pos.inRangeTo(otherLab, 1) && lab.id !== otherLab.id);
        if (nearbyLabs.length >= 1 && !catalyzerLab2) {
            catalyzerLab2 = lab;
        }
    });

    // Remove the second catalyzer lab
    labs = labs.filter(lab => lab.id !== catalyzerLab2.id);

    // Remaining labs are slaveCatalyzerLabs
    pre_catLabs = labs;

    return {
        'Lab1': slaveLabs1[0],
        'Lab2': slaveLabs1[1],
        'Lab3': slaveLabs2[0],
        'Lab4': slaveLabs2[1],
        'Reaction1': masterLab1,
        'Reaction2': masterLab2,
        'Reaction3_1': catalyzerLab1,
        'Reaction3_2': catalyzerLab2,
        'Lab5': pre_catLabs[0] ? pre_catLabs[0] : null,
        'Lab6': pre_catLabs[1] ? pre_catLabs[1] : null
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

function RunReaction3(RoomLabs, room) {
    let reaction3_1 = RoomLabs.Reaction3_1.runReaction(RoomLabs.Lab5, RoomLabs.Lab6);
    let reaction3_2 = RoomLabs.Reaction3_2.runReaction(RoomLabs.Lab5, RoomLabs.Lab6);
    if (reaction3_1 === OK) {
        console.log(`${room.name} Reaction 3_1 Initialized`)
    }
    if (reaction3_2 === OK) {
        console.log(`${room.name} Reaction 3_2 Initialized`)
    }
}