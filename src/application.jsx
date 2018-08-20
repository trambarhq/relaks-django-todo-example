import { h, Component } from 'preact';
import DjangoDataSource from 'relaks-django-data-source/preact';
import Django from 'django';
import TodoList from 'todo-list';

import 'style.scss';

/** @jsx h */

class Application extends Component {
    static displayName = 'Application';

    constructor() {
        super();
        this.state = {
            django: null,
        };
    }

    /**
     * Render the application
     *
     * @return {VNode}
     */
    render() {
        return (
            <div>
                {this.renderUserInterface()}
                {this.renderConfiguration()}
            </div>
        );
    }

    /**
     * Render the user interface
     *
     * @return {VNode|null}
     */
    renderUserInterface() {
        let { django } = this.state;
        if (!django) {
            return null;
        }
        let props = { django };
        return <TodoList {...props} />;
    }

    /**
     * Render non-visual components
     *
     * @return {VNode}
     */
    renderConfiguration() {
        let props = { onChange: this.handleDataSourceChange };
        return (
            <div>
                <DjangoDataSource {...props} />
            </div>
        );
    }

    /**
     * Called when the data source changes
     *
     * @param  {Object} evt
     */
    handleDataSourceChange = (evt) => {
        this.setState({ django: new Django(evt.target) });
    }
}

export {
    Application as default,
    Application
};
