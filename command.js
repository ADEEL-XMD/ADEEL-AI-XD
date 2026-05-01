var commands = [];
var commandMap = new Map(); // Ultra-fast O(1) command lookup

function cmd(info, func) {
    var data = info;
    data.function = func;
    if (!data.dontAddCommandList) data.dontAddCommandList = false;
    if (!info.desc) info.desc = '';
    if (!data.fromMe) data.fromMe = false;
    if (!info.category) data.category = 'misc';
    if (!info.filename) data.filename = "Not Provided";
    commands.push(data);
    
    // Index command patterns for O(1) lookup
    if (data.pattern) {
        const patternStr = data.pattern.toString();
        commandMap.set(patternStr, data);
    }
    if (data.on) {
        if (!commandMap.has('__on_' + data.on)) {
            commandMap.set('__on_' + data.on, []);
        }
        commandMap.get('__on_' + data.on).push(data);
    }
    
    return data;
}

function findCommand(text) {
    for (const [key, cmd] of commandMap) {
        if (key.startsWith('__on_')) continue;
        if (cmd.pattern && cmd.pattern.test(text)) {
            return cmd;
        }
    }
    return null;
}

function getEventHandlers(eventType) {
    return commandMap.get('__on_' + eventType) || [];
}

module.exports = {
    cmd,
    AddCommand: cmd,
    Function: cmd,
    Module: cmd,
    commands,
    commandMap,
    findCommand,
    getEventHandlers,
};
