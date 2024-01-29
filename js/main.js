"use strict";

// So we don't have to keep re-finding things on page, find DOM elements once:

const $body = $("body");

const $storiesLoadingMsg = $("#stories-loading-msg");
const $allStoriesList = $("#all-stories-list");

const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");

const $navLogin = $("#nav-login");
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout");
const $submitButton = $("#nav-submit");

function hidePageComponents() {
  const components = [
    $allStoriesList,
    $loginForm,
    $signupForm,
    $('#favorites'),
    $('#my-stories')
  ];
  components.forEach(c => c.hide());
}


async function start() {
  console.debug("start");

  await checkForRememberedUser();
  await getAndShowStoriesOnStart().then(function() {
    console.log("Stories loaded on start");
    addStarToStories();
  });
  createSubmitButton();
  createFavoritesButton();
  createMyStoriesButton();
  $('.stories-container.container .submit-story').hide();

  if (currentUser) updateUIOnUserLogin();
}

$(start);
