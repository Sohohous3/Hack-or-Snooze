"use strict";

let storyList;
let storiesIds = [];


async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();
  $('.account-forms-container.container').hide();
  putStoriesOnPage();
}

function validateStoryInput(title, author, url) {
  if (!title.trim()) {
    return { isValid: false, message: "Title is required." };
  }
  if (!author.trim()) {
    return { isValid: false, message: "Author is required." };
  }
  if (!url.trim()) {
    return { isValid: false, message: "URL is required." };
  }
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return { isValid: false, message: "URL must start with http:// or https://." };
  }
  return { isValid: true };
}


function createFormToSubmit() {
  const $form = $("<form id='submit-form'>");
  $form.append('<input type="text" id="title" placeholder="title">');
  $form.append('<input type="text" id="author" placeholder="author">');
  $form.append('<input type="text" id="url" placeholder="url">');
  $form.append("<button type='submit'>Submit</button>");
  
  $form.on("submit", async function(event){
    event.preventDefault();
    hidePageComponents();
    $("#form").show();
    const titleVal = $("#title").val();
    const authorVal = $("#author").val();
    let urlVal = $("#url").val();
    
    const validateStory = validateStoryInput(titleVal, authorVal, urlVal);
    if (!validateStory.isValid) { // error handling
      alert(validateStory.message);
      $('#title').val('');
      $('#author').val('');
      $('#url').val('');
      return;
    }
    if (storyList) {
      try {
        const story = await storyList.addStory(currentUser, {title: titleVal, author: authorVal, url: urlVal});
        alert("Story successfully added.");
        $('#title').val('');
        $('#author').val('');
        $('#url').val('');

        storyList.stories.unshift(story);
        const $newStory = generateStoryMarkup(story);
        $allStoriesList.prepend($newStory);
        let storiesIds = JSON.parse(localStorage.getItem(currentUser.username)) || [];
        storiesIds.push(story.storyId);
        localStorage.setItem(currentUser.username, JSON.stringify(storiesIds));
    } catch(err){
        console.error("Issues adding story from the form", err);
      }
    } else {
      console.error("Story list is not initialized.");
    }
  })
  $('<section class="submit-story">').append($form).appendTo('.stories-container');
}

function generateStoryMarkup(story) {
  const hostName = story.getHostName();
  const $storyMarkup = $(`
    <li id="${story.storyId}" data-story-id="${story.storyId}">
      <a href="${story.url}" target="a_blank" class="story-link">
        ${story.title}
      </a>
      <small class="story-hostname">(${hostName})</small>
      <small class="story-author">by ${story.author}</small>
      <small class="story-user">posted by ${story.username}</small>
    </li>
  `);

  if (currentUser) {
    const $star = $('<i>', { class: 'far fa-star' });
    if (currentUser.favorites.find(s => s.storyId === story.storyId)) {
      $star.addClass('favorited');
    }
    $star.on('click', async function() {
      const storyId = $(this).parent().attr('data-story-id');
      if ($star.hasClass('favorited')) {
        await currentUser.removeFavorite(storyId);
        $star.removeClass('favorited');
      } else {
        await currentUser.addFavorite(storyId);
        $star.addClass('favorited');
      }
    });
    $storyMarkup.append($star);
  }

  if (currentUser && story.username === currentUser.username) {
    const $deleteIcon = $('<i>', { class: 'fas fa-times-circle' });
    $deleteIcon.on('click', async function() {
      const storyId = $(this).parent().attr('data-story-id');
      await storyList.removeStory(currentUser, storyId);
      $(this).parent().remove();
      let storiesIds = JSON.parse(localStorage.getItem(currentUser.username)) || [];
      const index = storiesIds.indexOf(storyId);
      if (index !== -1) {
        storiesIds.splice(index, 1);
        localStorage.setItem(currentUser.username, JSON.stringify(storiesIds));
      }

});
$storyMarkup.append($deleteIcon);
}
return $storyMarkup;
}

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
  $allStoriesList.show();
}


function addStarToStories() {
  if (!currentUser) {
    return;
  }
  const $stories = $('.stories-list').children();
  for (let story of $stories) {
    if ($(story).find('i.far.fa-star').length > 0) {
      continue;
    }
    const $star = $('<i>', {
      class: 'far fa-star'
    });
    const storyId = $(story).attr('id');
    if (currentUser.favorites.find(s => s.storyId === storyId)) {
      $star.addClass('favorited');
    }
    $star.on('click', async function(){
      const storyId = $(story).attr('id');
      if ($star.hasClass('favorited')) {
        await currentUser.removeFavorite(storyId);
        $star.removeClass('favorited');
      } else {
        await currentUser.addFavorite(storyId);
        $star.addClass('favorited');
      }
    });
    $(story).append($star);
  }
}

function addDeleteIconToStories() {
  if (!currentUser) {
    return;
  }
  const $stories = $('.stories-list').children();
  for (let story of $stories) { 
    const $deleteIcon = $('<i>', {
      class: 'fas fa-times-circle'
    });
    $(story).append($deleteIcon);
  }

  $('.stories-list').on('click', '.fa-times-circle', async function(){
    console.log('Delete icon clicked!');
    const storyId = $(this).parent().attr('id');
    await storyList.removeStory(currentUser, storyId);
    $(this).parent().remove();
    let storiesIds = JSON.parse(localStorage.getItem(currentUser.username)) || [];
    const index = storiesIds.indexOf(storyId);
    if (index !== -1) {
      storiesIds.splice(index, 1);
      localStorage.setItem(currentUser.username, JSON.stringify(storiesIds));
    }
  });
}