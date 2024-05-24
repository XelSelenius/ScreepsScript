require("lodash");

//Global Functions and Constants
global.RunReaction_OH = RunReaction_OH;
global.SupplyLabMineral = SupplyLabMineral;
global.WithdrawLabMineral = WithdrawLabMineral;

/**
 * Runs basic Reaction
 */
function RunReaction_OH() {
    // Find labs in the room
    let lab_OH = Game.getObjectById("663965edf48de476a7806534")
    let lab_H = Game.getObjectById("661c080a84abd364af6a38aa")
    let lab_O = Game.getObjectById("6612f415dab103865daf1104")

    // Ensure we have enough labs
    if (!lab_OH || !lab_H || !lab_O) {
        console.log("Insufficient Labs");
        return;
    }

    // If there are enough idle labs, perform the reaction
    if (lab_H.cooldown === 0 && lab_O.cooldown === 0 && lab_OH.cooldown === 0) {
        if (lab_H.mineralAmount >= 5 && lab_O.mineralAmount >= 5) {
            // Run reaction
            let result = lab_OH.runReaction(lab_H, lab_O);
            if (result === OK) {
                console.log("Reaction performed successfully.");
            } else {
                console.log("Failed to perform reaction:", result);
            }
        } else {
            console.log("Not enough resources in the labs.");
        }
    } else {
        console.log("Not enough idle labs to perform reaction.");
    }
}

function SupplyLabMineral(creep, lab, resource) {
    if (creep.store[resource]) {
        TransferEnergy(creep, lab, resource)
    } else {
        WithdrawEnergy(creep, Game.getObjectById('65d71e80e4219d254f628572'), resource)
        // WithdrawEnergy(creep, creep.room.storage, resource)
    }
}

function WithdrawLabMineral(creep, lab, resource) {
    if (creep.store.getUsedCapacity() === 0) {
        WithdrawEnergy(creep, lab, resource)
    } else {
        TransferEnergy(creep, creep.room.storage, resource)
    }
}