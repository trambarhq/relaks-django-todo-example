function preserveObject(name, object) {
    if (object) {
        const date = (new Date).toISOString();
        const json = JSON.stringify({ object, date });
        localStorage[name] = json;
    } else {
        delete localStorage[name];
    }
}

function restoreObject(name, base) {
    const json = localStorage.draft;
    if (json) {
        const { object, date } = JSON.parse(json);
        if (object.id === base.id) {
            if ((new Date - new Date(date)) < 3600000) {
                return object;
            }
        }
    }
}

export {
    preserveObject,
    restoreObject,
};
