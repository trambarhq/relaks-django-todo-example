import React, { PureComponent } from 'react';
import { AsyncComponent } from 'relaks';
import TodoView from 'todo-view';

class TodoList extends AsyncComponent {
    static displayName = 'TodoList';

    async renderAsync(meanwhile) {
        let { django } = this.props;
        let props = {
            todos: null,
            django
        };
        meanwhile.show(<TodoListSync {...props} />);
        let options = {
            afterInsert: 'push',
            afterUpdate: 'replace',
            afterDelete: 'remove',
        };
        props.todos = await django.fetchList('/', options);
        props.todos.more();
        return <TodoListSync {...props} />;
    }
}

class TodoListSync extends PureComponent {
    static displayName = 'TodoListSync';

    render() {
        let { todos, django } = this.props;
        if (!todos) {
            return <div>Loading...</div>;
        }
        return (
            <ul className="todo-list">
            {
                todos.map((todo) => {
                    let viewProps = {
                        todo,
                        django,
                    };
                    return <TodoView key={todo.id} {...viewProps} />;
                })
            }
            <TodoView key={0} django={django} />
            </ul>
        );
    }
}

export {
    TodoList as default,
    TodoList,
    TodoListSync
};
