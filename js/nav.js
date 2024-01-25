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

function createFormToSubmit() {
  const $form = $("<form id='form'>");
  $form.append('<input type="text" id="title" placeholder="title">');
  $form.append('<input type="text" id="author" placeholder="author">');
  $form.append('<input type="text" id="url" placeholder="url">');
  $form.append("<button type='submit'>Submit</button>");
  
  $body.append($form);

  $form.on("submit", function(event){
    event.preventDefault();
    hidePageComponents();
    $("#form").show();
    const titleVal = $("#title").val();
    const authorVal = $("#author").val();
    const urlVal = $("#url").val();

    try {
      Story.addStory(currentUser, {title: titleVal, author: authorVal, url: urlVal});
      console.log("successfully added a new story from the form!");
    } catch(err){
      console.error("Issues adding story from the form", err);
    }
  });
}

function createSubmitButton() {
  const $submitButton = $('<a>', {
    id: 'nav-submit',
    href: '#',
    text: 'Submit',
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