"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

class Story {

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  getHostName() {
    return new URL(this.url).hostname;
  }
}

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  static async getStories() {
    try {
      const response = await axios.get(`${BASE_URL}/stories`);
      const stories = response.data.stories.map(story => new Story(story));
      console.log("Stories retrived successfully!");

      return new StoryList(stories);
    } catch(err) {
      console.error("Error retrieving stories!", err);
      return null;
    }
  }

  async addStory(user, {title, author, url}) {
    try {
      const token = user.loginToken;
      const response = await axios.post(`${BASE_URL}/stories`, {
        token: token,
        story: {title, author, url}
      });
  
      const story = new Story(response.data.story);
      this.stories.unshift(story);
      user.ownStories.unshift(story);
      
      return story;
    } catch(err) {
      console.error("Error adding story : ", err);
      console.log("Error response = ", err.response);
    }
  }

  async getStoriesById(storyId) {
    try {
      const response = await axios.get(`${BASE_URL}/stories/${storyId}`);
      const story = new Story(response.data.story);
      console.log("Story ID retrieved successfully!");
      return story;
    } catch(err) {
      console.error("Error retrieving story by ID : ", err);
    }
  }

  async removeStory(currentUser, storyId) {
    try {
      await axios.delete(`${BASE_URL}/stories/${storyId}`, {
        data: {
          token: currentUser.loginToken
        }
      });
      currentUser.ownStories = currentUser.ownStories.filter(s => s.storyId !== storyId);
      currentUser.favorites = currentUser.favorites.filter(s => s.storyId !== storyId);
      storyList.stories = storyList.stories.filter(s => s.storyId !== storyId);
    } catch(err) {
      console.error("Error removing story!", err);
    }
  }
}

class User {
  constructor({
                username,
                name,
                createdAt,
                favorites = [],
                ownStories = []
              },
              token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));
    this.loginToken = token;
  }


  static async signup(username, password, name) {
    try {
      const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });
    let { user } = response.data

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
    } catch(err){
      if (err.response && err.response.status === 409) {
        console.error("Username already taken!");
        return null;
      } else {
        console.error("Error signing up!", err);
      }
    }
  }


  static async login(username, password) {
    try {
      const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });
    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
    } catch (err) {
      console.error("Error logging in !", err);
    }
    
  }

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  async addFavorite(storyId) {
    if (this.favorites.some(story => story.storyId === storyId)) {
      console.log("Story already in favorites!");
      return;
    }
    try {
      await axios.post(`${BASE_URL}/users/${this.username}/favorites/${storyId}`, {
        token: this.loginToken
      });
      this.favorites.push(storyId);
    } catch (err) {
      console.error("Error Adding Favorite : ", err);
    }
  }

  async removeFavorite(storyId) {
    try {
      await axios.delete(`${BASE_URL}/users/${this.username}/favorites/${storyId}`, {
        data: { 
          token: this.loginToken
         }
      });
      this.favorites = this.favorites.filter(story => story.storyId !== storyId);
    } catch(err){
      console.error("Error removing story from favorite.", err);
    }
  }

  async showFavorites() {
    try {
      const response = await axios.get(`${BASE_URL}/users/${this.username}`, {
        params: {
          token: this.loginToken
         }
      });
      this.favorites = response.data.user.favorites.map(s => new Story(s));
      return this.favorites;
    } catch(err) {
      console.error("Error showing favorites!", err);
    }
  }
}
