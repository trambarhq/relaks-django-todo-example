import { h, Component } from 'preact';

/** @jsx h */

class TodoView extends Component {
    static displayName = 'TodoView';

    constructor() {
        super();
        this.state = {
            expanded: false,
            editing: false,
            draft: null,
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
        let className = 'todo-view';
        if (expanded) {
            className += ' expanded';
        }
        return (
            <li className={className}>
                <div className="title">
                    <span onClick={this.handleTitleClick}>
                        {todo.title}
                    </span>
                </div>
                <div className="extra">
                    <div className="description">
                        {todo.description}
                    </div>
                    <div className="buttons">
                        <button onClick={this.handleEditClick}>Edit</button>
                        <button onClick={this.handleDeleteClick}>Delete</button>
                    </div>
                </div>
            </li>
        );
    }

    renderEditor() {
        let { draft } = this.state;
        return (
            <li className="todo-view expanded edit">
                <div className="title">
                    <input type="text" value={draft.title || ''} onChange={this.handleTitleChange} />
                </div>
                <div className="extra">
                    <div className="description">
                        <textarea value={draft.description || ''} onChange={this.handleDescriptionChange} />
                    </div>
                    <div className="buttons">
                        <button onClick={this.handleSaveClick}>Save</button>
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
        let draft = Object.assign({}, todo);
        this.setState({ editing: true, draft });
    }

    handleDeleteClick = (evt) => {
        let { todo, django } = this.props;
        django.deleteOne('/', todo);
    }

    handleSaveClick = (evt) => {
        let { django } = this.props;
        let { draft } = this.state;
        django.saveOne('/', draft).then(() => {
            this.setState({ editing: false });
        });
    }

    handleAddClick = (evt) => {
        let draft = {};
        this.setState({ editing: true, draft });
    }

    handleCancelClick = (evt) => {
        this.setState({ editing: false });
    }

    handleTitleChange = (evt) => {
        let { draft } = this.state;
        draft = Object.assign({}, draft, { title: evt.target.value });
        this.setState({ draft });
    }

    handleDescriptionChange = (evt) => {
        let { draft } = this.state;
        draft = Object.assign({}, draft, { description: evt.target.value });
        this.setState({ draft });
    }
}

export {
    TodoView as default,
    TodoView,
};
