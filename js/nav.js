"use strict";


function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", async function(){ 
  hidePageComponents();
  $('#favorites-container').empty();
  $allStoriesList.show();
  $('#submit-form').hide();
  $('#my-stories-container').hide();
});

$body.on("click", "#nav-submit", function(){
  hidePageComponents();
  $('#favorites-container').hide();
  $('#submit-form').show();
});

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $('.account-forms-container.container').show();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);


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
  $('.submit-story').hide();
  $('.account-forms-container.container').hide();
}

function createSubmitButton() {
  const $submitButton = $('<a>', {
    id: 'nav-submit',
    href: '#',
    text: ' | Submit | ',
    class: 'nav-link'
  }).css('display', 'none');

  $('.navbar-brand').append($submitButton);
  createFormToSubmit();
  $('#form').hide();

  $submitButton.on('click', function(evt){
    evt.preventDefault();
    hidePageComponents();
    $('#favorites-container').hide();
    $('#my-stories-container').hide();
    $('.submit-story').show();
  });
}

function createFavoritesButton() {
  const $favoritesButton = $('<a>', {
    id: 'nav-favorites',
    href: '#',
    text: ' Favorites | ',
    class: 'nav-link'
  }).css('display', 'none');

  $('.navbar-brand').append($favoritesButton);

  const $favoritesContainer = $('<div>', {id: 'favorites-container'}).hide();
  $('.stories-container').append($favoritesContainer);

  $favoritesButton.on('click', async function(evt){
    evt.preventDefault();
    hidePageComponents();
    $('.submit-story').hide();
    $('#my-stories-container').hide();
    const favorites = await currentUser.showFavorites();
    const $favoritesList = $('<ol>', {id: 'favorites-list', class: 'stories-list'});
    for (let favorite of favorites) {
      const $favoriteLink = $('<a>', {
        text: favorite.title, 
        href: favorite.url,
        target: '_blank'
      });
      const $favorite = $('<li>').append($favoriteLink);
      $favoritesList.append($favorite);
    }
    $favoritesContainer.empty();
    $favoritesContainer.append($favoritesList).show();
    $('#favorites-container').show();
  });
}

function createMyStoriesButton() {
  const $myStoriesButton = $('<a>', {
    id: 'nav-my-stories',
    href: '#',
    text: ' My Stories |',
    class: 'nav-link'
  }).css('display', 'none');

  $('.navbar-brand').append($myStoriesButton);
  const $myStoriesContainer = $('<div>', {id: 'my-stories-container'}).hide();
  $('.stories-container').append($myStoriesContainer);

  $myStoriesButton.on('click', async function(evt){
    evt.preventDefault();
    hidePageComponents();
    $('.submit-story').hide();
    $('#favorites-container').hide();

    $myStoriesContainer.empty();
    let storiesIds = JSON.parse(localStorage.getItem(currentUser.username)) || [];
    console.log('Story Ids retrieved from local storage: ', storiesIds)
    for (let storyId of storiesIds) {
      const story = await storyList.getStoriesById(storyId);
      console.log('Story retrieved from database: ', story);
      const $story = generateStoryMarkup(story);
      console.log('Story markup: ', $story);
      $myStoriesContainer.append($story);
    }
    $myStoriesContainer.show();
    });
}