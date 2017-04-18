# GitHunt Angular2

[![Greenkeeper badge](https://badges.greenkeeper.io/apollographql/GitHunt-Angular.svg)](https://greenkeeper.io/)

An example of a client-side app built with Angular2 and Apollo Client.

[![Get on Slack](https://img.shields.io/badge/slack-join-orange.svg)](http://www.apollostack.com/#slack)
[![Build Status](https://travis-ci.org/apollostack/GitHunt-angular2.svg?branch=master)](https://travis-ci.org/apollostack/GitHunt-angular2)

Please submit a pull request if you see anything that can be improved!

## Running the app

### 0. This repository is only the Angular frontend.

Run the [GitHunt API](https://github.com/apollostack/GitHunt-API) first.
(This is temporary, until we have a permanently hosted demo server.)

### 1. Install Node/npm

Make sure you have Node.js installed (the app has been tested with Node `4.4.5` and `5.3.0`)

### 2. Clone and install dependencies

```
git clone https://github.com/apollostack/GitHunt-angular2.git
cd GitHunt-angular2
npm install
```

### 3. Run the app

```
npm start
```

- Open the client at http://localhost:3000
- Click "Log in with GitHub" in the upper right corner
- You'll be presented with the seed items in the app

![GitHunt App](screenshots/GitHunt-app.png)

#### Submit a Repo
Click the green Submit button and add repo with the username/repo-name pattern.

![GitHunt App](screenshots/GitHunt-add.png)

#### New Item
Review the new item, up vote it and visit the repo via the link.   
![GitHunt App](screenshots/GitHunt-new.png)
