import React from 'react';
import { useListener } from 'relaks';

export function LogoutButton(props) {
  const { django } = props;

  const handleClick = useListener(async (evt) => {
    await django.logOut();
  });

  if (!django.loggedIn()) {
    return null;
  }
  return (
    <button className="logout" onClick={handleClick}>
      Log out
    </button>
  );
}
