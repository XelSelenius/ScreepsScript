require('lodash');

//Global Functions and Constants
global.BuildCreepsForRoom = BuildCreepsForRoom;

/**
 * Room-Based Initializer of BuildCreep.
 * Recieves the room configuration from the data-object in main.js.
 * @param room
 */
function BuildCreepsForRoom(room) {
    const spawner = room.spawner;
    for (let role in room.creepCounts) {
        const roleByController = getCreepBodyParts(role, Game.rooms[room.name].controller.level);
        const bodyParts = BodyPartsRenderer[roleByController];
        const creepCounter = room.creepCounts[role];
        BuildCreep(role, bodyParts, role.charAt(0).toUpperCase() + role.slice(1), creepCounter, spawner);
    }

    //Say what you build, Spawner
    if (spawner && Game.spawns[spawner].spawning) {
        let spawningCreep = Game.creeps[Game.spawns[spawner].spawning.name];
        Game.spawns[spawner].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns[spawner].pos.x + 1,
            Game.spawns[spawner].pos.y,
            {align: 'left', opacity: 0.8});
    }
}

/**
 * Universal Creep Builder.
 * Recieves all the components needed for the spawner to build a creep.
 * @param role
 * @param bodyParts
 * @param roleName
 * @param creepCounter
 * @param spawner
 */
function BuildCreep(role, bodyParts, roleName, creepCounter, spawner) {
    let room = Game.spawns[spawner].room; // Get the room where the spawner is located
    let creepsOfType = room.find(FIND_MY_CREEPS, {
        filter: (creep) => creep.memory.role === role
    });
    if (creepsOfType && creepsOfType.length < creepCounter) {
        let newName = roleName + Game.time;
        console.log(`Spawning new ${roleName} in ${spawner}: ${newName}`);
        Game.spawns[spawner].spawnCreep(bodyParts, newName, {memory: {role: role}});
    }
}

function getCreepBodyParts(role, controllerLevel) {
    // Retrieve body parts based on role and controller level
    switch (controllerLevel) {
        case 1:
            return role = "minor" + '-' + role;
        case 2:
            return role = "lesser" + '-' + role;
        // case 4:
        //     return role = "greater" + '-' + role;
        default:
            return role;
    }
}

const BodyPartsRenderer = {
    'minor-harvester': [WORK, WORK, CARRY, MOVE],
    'lesser-harvester': [WORK, WORK, WORK, CARRY, MOVE],
    'greater-harvester': [WORK, WORK, WORK, WORK, CARRY, MOVE],
    'harvester': [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE],

    'minor-repairer': [WORK, CARRY, MOVE, MOVE],
    'lesser-repairer': [WORK, CARRY, CARRY, MOVE, MOVE],
    'greater-repairer': [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
    'repairer': [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],

    'minor-upgrader': [WORK, CARRY, MOVE, MOVE],
    'lesser-upgrader': [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
    'greater-upgrader': [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE],
    'upgrader': [WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE],

    'minor-builder': [WORK, CARRY, MOVE, MOVE],
    'lesser-builder': [WORK, WORK, CARRY, MOVE, MOVE],
    'greater-builder': [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
    'builder': [WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],

    'minor-collector': [CARRY, CARRY, MOVE, MOVE],
    'lesser-collector': [CARRY, CARRY, MOVE, MOVE],
    'greater-collector': [CARRY, CARRY, MOVE, MOVE],
    'collector': [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE],


    'minor-hauler': [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
    'lesser-hauler': [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
    'greater-hauler': [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
    'hauler': [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],

    'manager': [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],

    'minor-tombraider': [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
    'lesser-tombraider': [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
    'tombraider': [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],

    'carrier': [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
    'defender': [MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK],
    'ranger': [TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK],
    'supplier': [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
    'claimer': [CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE],
    'miner': [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
    'healer': [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL],
    'attacker': [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK],
    'colonizer': [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
}