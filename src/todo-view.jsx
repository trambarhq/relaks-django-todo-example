import _ from 'lodash';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSaveBuffer, useStickySelection } from 'relaks';
import { mergeObjects } from 'merge-utils';
import { preserveObject, restoreObject } from 'storage-utils';

function TodoView(props) {
    const { django, todo } = props;
    const draft = useSaveBuffer({
        original: _.defaults(todo, { title: '', description: '' }),
        compare: _.isEqual,
        merge: mergeObjects,
        save: async (base, ours) => {
            return django.saveOne('/', ours);
        },
        delete: async (base, ours) => {
            return django.deleteOne('/', todo);
        },
        preserve: (base, ours) => {
            preserveObject('draft', ours);
        },
        restore: (base) => {
            return restoreObject('draft', base);
        },
    });
    const [ expanded, setExpanded ] = useState(draft.changed);
    const [ editing, setEditing ] = useState(draft.changed);

    const titleRef = useRef();
    const descriptionRef = useRef();
    useStickySelection([ titleRef, descriptionRef ]);

    const handleTitleClick = useCallback((evt) => {
        setExpanded(!expanded);
    }, [ expanded ]);
    const handleEditClick = useCallback((evt) => {
        setEditing(true);
    });
    const handleDeleteClick = useCallback(async (evt) => {
        draft.delete();
    });
    const handleSaveClick = useCallback(async (evt) => {
        await draft.save();
        setEditing(false);
        if (!todo) {
            draft.reset();
        }
    });
    const handleAddClick = useCallback((evt) => {
        setEditing(true);
    });
    const handleCancelClick = useCallback((evt) => {
        draft.cancel();
        setEditing(false);
    });
    const handleTitleChange = useCallback((evt) => {
        draft.assign({ title: evt.target.value });
    });
    const handleDescriptionChange = useCallback((evt) => {
        draft.assign({ description: evt.target.value });
    });

    if (editing) {
        return renderEditor();
    } else if (todo) {
        return renderView();
    } else {
        return renderAddButton();
    }

    function renderView() {
        let { title, description } = todo;
        let className = 'todo-view';
        if (expanded) {
            className += ' expanded';
        }
        return (
            <li className={className}>
                <div className="title">
                    <span onClick={handleTitleClick}>{title}</span>
                </div>
                <div className="extra">
                    <div className="description">{description}</div>
                    <div className="buttons">
                        <button onClick={handleEditClick}>Edit</button>
                        <button onClick={handleDeleteClick}>Delete</button>
                    </div>
                </div>
            </li>
        );
    }

    function renderEditor() {
        const { title, description } = draft.current;
        const empty = !_.trim(title) || !_.trim(description);
        const disabled = !draft.changed || empty;
        return (
            <li className="todo-view expanded edit">
                <div className="title">
                    <input ref={titleRef} type="text" value={title} onChange={handleTitleChange} />
                </div>
                <div className="extra">
                    <div className="description">
                        <textarea ref={descriptionRef} value={description} onChange={handleDescriptionChange} />
                    </div>
                    <div className="buttons">
                        <button onClick={handleSaveClick} disabled={disabled}>Save</button>
                        <button onClick={handleCancelClick}>Cancel</button>
                    </div>
                </div>
            </li>
        );
    }

    function renderAddButton() {
        return (
            <li className="todo-view add">
                <span className="add-button" onClick={handleAddClick}>
                    Add new item
                </span>
            </li>
        );
    }
}

export {
    TodoView,
};
