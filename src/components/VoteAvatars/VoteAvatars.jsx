import React from "react";
import UserAvatar from "../UserAvatar/UserAvatar"; // Importando o componente UserAvatar

const VoteAvatars = ({ userIds }) => {
  return (
    <div className="d-flex align-items-center gap-1 mb-0">
      {userIds.map((userId) => (
        <UserAvatar key={userId} userId={userId} /> // Passando userId para UserAvatar
      ))}
    </div>
  );
};

export default VoteAvatars;
