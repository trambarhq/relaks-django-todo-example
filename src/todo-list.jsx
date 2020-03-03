import React from 'react';
import { useProgress } from 'relaks';
import { TodoView } from './todo-view.jsx';

export async function TodoList(props) {
  const { django } = props;
  const [ show ] = useProgress();

  render();
  const options = {
    afterInsert: 'push',
    afterUpdate: 'replace',
    afterDelete: 'remove',
  };
  const todos = await django.fetchList('/', options);
  render();

  todos.more();

  function render() {
    if (!todos) {
      show(<div>Loading...</div>);
    } else {
      show(
        <ul className="todo-list">
          {todos.map(renderTodo)}
          <TodoView key={0} django={django} />
        </ul>
      );
    }
  }

  function renderTodo(todo) {
    return <TodoView key={todo.id} django={django} todo={todo} />;
  }
}
