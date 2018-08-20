import { h, Component } from 'preact';
import { AsyncComponent } from 'relaks/preact';
import TodoView from 'todo-view';

/** @jsx h */

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
        props.todos = await django.fetchList('/');
        return <TodoListSync {...props} />;
    }
}

class TodoListSync extends Component {
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
