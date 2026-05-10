export function updateUserInfo(user, { userInfo, userName, userRole, userAvatar }) {
  if (!user || !userInfo || !userName || !userRole || !userAvatar) return;
  userInfo.hidden = false;
  userName.textContent = user.name;
  const roleText = user.role === "client" ? "Cliente" : "Operador";
  userRole.textContent = roleText;
  userAvatar.textContent = user.name ? user.name.charAt(0).toUpperCase() : "?";
  if (user.role === "operator") {
    userInfo.className = "user-info operator";
    userInfo.title = `${user.name} (${roleText})\n${user.certification || "Certificação não informada"}`;
  } else {
    userInfo.className = "user-info client";
    userInfo.title = `${user.name} (${roleText})\n${user.company || "Empresa não informada"}`;
  }
}

export function hideUserInfo({ userInfo, userName, userRole, userAvatar }) {
  if (!userInfo) return;
  userInfo.hidden = true;
  if (userName) userName.textContent = "";
  if (userRole) userRole.textContent = "";
  if (userAvatar) userAvatar.textContent = "";
  userInfo.className = "user-info";
  userInfo.title = "";
}
