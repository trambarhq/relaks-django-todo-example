import React, { useCallback } from 'react';

function LogoutButton(props) {
    const { django } = props;

    const handleClick = useCallback(async (evt) => {
        await django.logOut();
    }, [ django ]);

    if (!django.loggedIn()) {
        return null;
    }
    return (
        <button className="logout" onClick={handleClick}>
            Log out
        </button>
    );
}

export {
    LogoutButton,
};
