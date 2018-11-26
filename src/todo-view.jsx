import React, { PureComponent } from 'react';

class TodoView extends PureComponent {
    static displayName = 'TodoView';

    constructor(props) {
        super(props);
        this.state = {
            expanded: false,
            editing: false,
            id: undefined,
            title: '',
            description: '',
        };
    }

    render() {
        let { todo } = this.props;
        let { editing } = this.state;
        if (editing) {
            return this.renderEditor();
        } else if (todo) {
            return this.renderView();
        } else {
            return this.renderAddButton();
        }
    }

    renderView() {
        let { todo } = this.props;
        let { expanded } = this.state;
        let { title, description } = todo;
        let className = 'todo-view';
        if (expanded) {
            className += ' expanded';
        }
        return (
            <li className={className}>
                <div className="title">
                    <span onClick={this.handleTitleClick}>{title}</span>
                </div>
                <div className="extra">
                    <div className="description">{description}</div>
                    <div className="buttons">
                        <button onClick={this.handleEditClick}>Edit</button>
                        <button onClick={this.handleDeleteClick}>Delete</button>
                    </div>
                </div>
            </li>
        );
    }

    renderEditor() {
        let { title, description } = this.state;
        let disabled = !title.trim() || !description.trim();
        return (
            <li className="todo-view expanded edit">
                <div className="title">
                    <input type="text" value={title} onChange={this.handleTitleChange} />
                </div>
                <div className="extra">
                    <div className="description">
                        <textarea value={description} onChange={this.handleDescriptionChange} />
                    </div>
                    <div className="buttons">
                        <button onClick={this.handleSaveClick} disabled={disabled}>Save</button>
                        <button onClick={this.handleCancelClick}>Cancel</button>
                    </div>
                </div>
            </li>
        );
    }

    renderAddButton() {
        return (
            <li className="todo-view add">
                <span className="add-button" onClick={this.handleAddClick}>
                    Add new item
                </span>
            </li>
        );
    }

    handleTitleClick = (evt) => {
        let { expanded } = this.state;
        this.setState({ expanded: !expanded });
    }

    handleEditClick = (evt) => {
        let { todo } = this.props;
        let { id, title, description } = todo;
        this.setState({ editing: true, id, title, description });
    }

    handleDeleteClick = async (evt) => {
        let { django, todo } = this.props;
        await django.deleteOne('/', todo);
    }

    handleSaveClick = async (evt) => {
        let { django } = this.props;
        let { id, title, description } = this.state;
        let todo = { id, title, description };
        await django.saveOne('/', todo);
        this.setState({ editing: false });
    }

    handleAddClick = (evt) => {
        this.setState({ editing: true, id: undefined, title: '', description: '' });
    }

    handleCancelClick = (evt) => {
        this.setState({ editing: false });
    }

    handleTitleChange = (evt) => {
        this.setState({ title: evt.target.value });
    }

    handleDescriptionChange = (evt) => {
        this.setState({ description: evt.target.value });
    }
}

export {
    TodoView as default,
    TodoView,
};
