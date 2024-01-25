"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

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
  const $form = $("<form id='form'>");
  $form.append('<input type="text" id="title" placeholder="title">');
  $form.append('<input type="text" id="author" placeholder="author">');
  $form.append('<input type="text" id="url" placeholder="url">');
  $form.append("<button type='submit'>Submit</button>");
  
  $body.append($form);

  $form.on("submit", async function(event){
    event.preventDefault();
    hidePageComponents();
    $("#form").show();
    const titleVal = $("#title").val();
    const authorVal = $("#author").val();
    let urlVal = $("#url").val();
    
    const validateStory = validateStoryInput(titleVal, authorVal, urlVal);
    if (!validateStory.isValid) {
      alert(validateStory.message);
      $('#title').val('');
      $('#author').val('');
      $('#url').val('');
      return;
    }

    if (storyList) {
      try {
        await storyList.addStory(currentUser, {title: titleVal, author: authorVal, url: urlVal});
        alert("Story successfully added.");
        $('#title').val('');
        $('#author').val('');
        $('#url').val('');
    } catch(err){
        console.error("Issues adding story from the form", err);
      }
    } else {
      console.error("Story list is not initialized.");
    }
  });
  $body.append($form);
}


function generateStoryMarkup(story) {
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
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
