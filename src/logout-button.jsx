import React, { PureComponent } from 'react';

class LogoutButton extends PureComponent {
    static displayName = 'LogoutButton';

    constructor(props) {
        super(props);
    }

    render() {
        let { django } = this.props;
        if (!django.loggedIn()) {
            return null;
        }
        return (
            <button className="logout" onClick={this.handleClick}>
                Log out
            </button>
        );
    }

    handleClick = (evt) => {
        let { django } = this.props;
        django.logOut();
    }
}

export {
    LogoutButton as default,
    LogoutButton,
};
