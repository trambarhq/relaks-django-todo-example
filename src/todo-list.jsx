import React, { PureComponent } from 'react';
import { AsyncComponent } from 'relaks';
import TodoView from 'todo-view';

class TodoList extends AsyncComponent {
    static displayName = 'TodoList';

    /**
     * Retrieve remote data and render the synchronize half of this component
     *
     * @param  {Meanwhile}  meanwhile
     *
     * @return {VNode}
     */
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

    /**
     * Render the component, making best effort using what props are given
     *
     * @return {VNode}
     */
    render() {
        let { todos, django } = this.props;
        if (!todos) {
            return <h2>Loading...</h2>;
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
