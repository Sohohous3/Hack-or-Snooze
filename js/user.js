"use strict";

let currentUser;

async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  const username = $("#login-username").val();
  const password = $("#login-password").val();

 
  currentUser = await User.login(username, password);

  $loginForm.trigger("reset");

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
}

$loginForm.on("submit", login);


async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  currentUser = await User.signup(username, password, name);

  if (currentUser) {
    saveUserCredentialsInLocalStorage();
    updateUIOnUserLogin();
  } else {
    alert("Error signing Up !");
    $signupForm.trigger("reset");
  }
}

$signupForm.on("submit", signup);


function logout(evt) {
  console.debug("logout", evt);
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  location.reload();
}

$navLogOut.on("click", logout);

async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  currentUser = await User.loginViaStoredCredentials(token, username);
}


function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");

  $allStoriesList.show();

  updateNavOnLogin();
  $('#nav-favorites').css('display', 'block');
  $('#nav-my-stories').css('display', 'block');
}
