"use strict";

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  if (!currentUser) {
    console.error("No user is connected");
    return;
  }
  $("#nav-submit").css('display', 'inline');
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

function createSubmitButton() {
  const $submitButton = $('<a>', {
    id: 'nav-submit',
    href: '#',
    text: '| Submit |',
    class: 'nav-link'
  }).css('display', 'none');

  $('.navbar-brand').append($submitButton);
  const form = createFormToSubmit();
  $('#form').hide();

  $submitButton.on('click', function(evt){
    console.log("Submit button clicked :", evt);
    hidePageComponents();
    $('#form').show();
  });
}