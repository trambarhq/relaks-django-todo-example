import _ from 'lodash';
import React, { useState, useRef } from 'react';
import { useListener, useSaveBuffer, useStickySelection } from 'relaks';
import { mergeObjects } from './merge-utils.js';
import { preserveObject, restoreObject } from './storage-utils.js';

export function TodoView(props) {
  const { django, todo } = props;
  const draft = useSaveBuffer({
    original: _.defaults(todo, { title: '', description: '' }),
    compare: _.isEqual,
    merge: mergeObjects,
    preserve: (base, ours) => {
      preserveObject('todo', ours);
    },
    restore: (base) => {
      return restoreObject('todo', base);
    },
  });
  const [ editing, setEditing ] = useState(draft.changed);
  const [ expanded, setExpanded ] = useState(draft.changed);

  const titleRef = useRef();
  const descriptionRef = useRef();
  useStickySelection([ titleRef, descriptionRef ]);

  const handleTitleClick = useListener((evt) => {
    setExpanded(!expanded);
  });
  const handleEditClick = useListener((evt) => {
    setEditing(true);
  });
  const handleDeleteClick = useListener(async (evt) => {
    await django.deleteOne('/', todo);
  });
  const handleSaveClick = useListener(async (evt) => {
    await django.saveOne('/', draft.current);
    setEditing(false);
    draft.reset();
  });
  const handleCancelClick = useListener((evt) => {
    setEditing(false);
    draft.reset();
  });
  const handleTitleChange = useListener((evt) => {
    draft.assign({ title: evt.target.value });
  });
  const handleDescriptionChange = useListener((evt) => {
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
    const { title, description } = todo;
    const classNames = [ 'todo-view' ];
    if (expanded) {
      classNames.push('expanded');
    }
    return (
      <li className={classNames.join(' ')}>
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
        <span className="add-button" onClick={handleEditClick}>
          Add new item
        </span>
      </li>
    );
  }
}
