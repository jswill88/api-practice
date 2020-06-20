'use strict';

const express = require('express');
const superagent = require('superagent');
const app = express();
require('dotenv').config();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console
  .log(`listening on ${PORT}`));

app.get('/', (req,res) => res
  .status(200)
  .send('I\'m on the home page'));


// use this to get the ids, and an overview
app.get('/tmdb', (req,res) => {
  const url = 'https://api.themoviedb.org/3/search/tv';
  const queryParams = {
    api_key: process.env.TMDB_URL,
    query: 'the office'
  }
  superagent.get(url, queryParams)
    .then(results => {
    // console.log(results.body.results);
    // Use this to get info about each season - capture the id of the TV show on the click? then use the following
    const url = `https://api.themoviedb.org/3/tv/${results.body.results[0].id}`;
    const query = {
      api_key: process.env.TMDB_URL
    }
    superagent.get(url, query)
      .then(results => {
        console.log(results.body.number_of_seasons); // tells you how many seasons in a show - use as a loop for next step
        results.body.seasons
          .forEach(season => console.log(season.episode_count));
        // put both in a variable
        const url = `https://api.themoviedb.org/3/tv/${results.body.id}/season/01/episode/01`
        const query = {
          api_key: process.env.TMDB_URL
        }
        superagent.get(url, query)
          .then(results => {
            console.log(results.body.vote_average); // gives you vote average for the episode
          }).catch(err => console.log(err));
      }).catch(err => console.log(err));
  }).catch(err => console.log(err))
})