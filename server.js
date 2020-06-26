'use strict';

const express = require('express');
const superagent = require('superagent');
const unirest = require('unirest');
const app = express();
require('dotenv').config();
const cors = require('cors');
app.use(cors());


// Trakt Set Up
const Trakt = require('trakt.tv');
let options = {
  client_id: process.env.TRAKT_ID,
  client_secret: process.env.TRAKT_SECRET,
  redirect_uri: null,
  api_url: null,
  useragent: null,
  pagination: true,
  debug: true,
  limit: 15
};
const trakt = new Trakt(options);


const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console
  .log(`listening on ${PORT}`));

app.get('/', (req, res) => res
  .status(200)
  .send('I\'m on the home page'));


// use this to get the ids, and an overview
app.get('/tmdb', (req, res) => {
  const url = 'https://api.themoviedb.org/3/tv/4278';
  const queryParams = {
    api_key: process.env.TMDB_URL,
    // tv_id: '4278'
  }
  superagent.get(url, queryParams)
    .then(results => {
      console.log(results.body);
      // url in front of image tag https://image.tmdb.org/t/p/w260_and_h390_bestv2
      // Use this to get info about each season - capture the id of the TV show on the click? then use the following
      // const url = `https://api.themoviedb.org/3/tv/${results.body.results[0].id}`;
      // const query = {
      //   api_key: process.env.TMDB_URL
      // }
      // superagent.get(url, query)
      //   .then(results => {
          // console.log(results.body.id);
          // console.log(results.body.number_of_seasons); // tells you how many seasons in a show - use as a loop for next step
          // you can get translations with this database
    //       results.body.seasons
    //         .forEach(season => console.log(season.episode_count));
    //       // put both in a variable
    //       const url = `https://api.themoviedb.org/3/tv/${results.body.id}/season/01/episode/01`
    //       const query = {
    //         api_key: process.env.TMDB_URL
    //       }
    //       superagent.get(url, query)
    //         .then(results => {
    //           console.log(results.body.vote_average); // gives you vote average for the episode
    //         }).catch(err => console.log(err));
    //     }).catch(err => console.log(err));
    }).catch(err => console.log(err))
})

app.get('/trakt', (request, response) => {
  // trakt.search.text({
  //   query: 'jennifer aniston',
  //   type: 'show,person',
  //   extended: true
  // }).then(response => {
  //   // use this to get the id, not great at searching for actors
  //   console.log(response.data);
  // }).catch(err => console.log(err))
  trakt.search.id({
    type: 'show',
    extended: 'full',
    id_type: 'tmdb',
    id: '4278'
  }).then(response => {
    let array = response.data;
    // console.log(array[array.length - 1]);
    // use this to get show overview, number of seasons, overall rating
    // response.data.forEach(show => {
    //   if(show.type === 'show'){
    //     console.log(response.data);
    //   }
    // })
  });


  trakt.seasons.summary({
    id: '2302',
    extended: 'full'
  }).then(response => {
    //number of seasons
    let k = response.data[response.data.length - 1].number;
    // map episodes for season into an array, then reduce to get sum
    for(let i = 1; i < k; i++) {
      let num = getSum(1,0,i) ;
      console.log(num);
    }
    // const totalSum = getSum(1,0,parseInt(k));
  })
  
  

    function getSum (episode, runtime, season){
        trakt.episodes.summary({
          season: season,
          episode: episode,
          id: '2302',
          extended: 'full'
        }).then(response => {
          console.log(runtime);
          runtime += response.data.runtime;
           return getSum(episode + 1, runtime, season); 
          // Contains rating, runtime !!!
        }).catch(() => {
          return runtime;
      });
    }
  
//     const allSeasons = (j, runtime) 
//     getSum(1, 0);
//     function totalRuntime(minutes) {
//       console.log(minutes / 60, 'hours');
//   }
// }
})

app.get('/tvmaze', (response, request) => {
  let req = unirest('GET', "https://tvjan-tvmaze-v1.p.rapidapi.com/search/shows");
  req.query({
    'q': 'Rick and Morty'
  })
  req.headers({
    "x-rapidapi-host": "tvjan-tvmaze-v1.p.rapidapi.com",
    "x-rapidapi-key": process.env.RAPID_API_KEY,
    "useQueryString": true
  })
  req.end((res) => {
    // gets id of show
    console.log(res.body[0].show.id);
  })
})


app.get('/utelly', (response, request) => {
  // let req = unirest("GET", "https://utelly-tv-shows-and-movies-availability-v1.p.rapidapi.com/idlookup");

  // req.query({
  //   "source": 'tmdb',
  //   "source_id": 2316
  // });
  let url = "https://utelly-tv-shows-and-movies-availability-v1.p.rapidapi.com/idlookup"
  let query = {
    "source": 'tmdb',
    "source_id": 2316
  }
  superagent.get(url, query)
    .set({"x-rapidapi-host": "utelly-tv-shows-and-movies-availability-v1.p.rapidapi.com"})
    .set({'x-rapidapi-key': process.env.RAPID_API_KEY})
    .set({'useQueryString': true})
    .then(results => console.log(results.body))

  // req.headers({
  //   "x-rapidapi-host": "utelly-tv-shows-and-movies-availability-v1.p.rapidapi.com",
  //   "x-rapidapi-key": process.env.RAPID_API_KEY,
  //   "useQueryString": true
  // });


  // req.end(function (res) {
    // tells you where you can find the tv show, eg netfilx, google play
    // console.log(res.body);
  });


// Nielson



//   trakt.episodes.summary({
//     // loop through all episodes
//     id: id,
//     id_type: 'imdb',
//     season: 1,
//     episode: 5,
//     extended: 'full'
//   }).then(response => {
//     // console.log(response.data);
//   })
// }).catch(err => console.log(err))

// function calculateLength(req, res) {
//   trakt.seasons.summary({
//     id: '2302',
//     extended: 'full'
//   }).then(response => {
//     const episodesPerSeason = response.data.reduce((acc, season) => {
//       if (parseInt(season.number) > 0) {
//         acc.push(season.episode_count);
//         return acc;
//       }
//       return acc;
//     }, []);
//     var minutesOfSeries = [];
//     episodesPerSeason
//       .map((numEpisodes, index) => {
//         minutesOfSeries.push(getSum(1, index, 0));
//         console.log(minutesOfSeries);
//       })
//   })
// }
// function getSum(episode, season, runtime) {
//   trakt.episodes.summary({
//     season: season + 1,
//     episode: episode,
//     id: '2302',
//     extended: 'full'
//   }).then(response => {
//     runtime += response.data.runtime;
//     getSum(episode + 1, season, runtime)
//   }).catch(() => {
//     return runtime;
//   })
// }

// console.log(minutesOfSeries);
// if (index + 1 === episodesPerSeason.length &&
//   i === numEpisodes) {
// let seriesLength = Math.floor(minutesOfSeries / 60) + ' hours and ' + minutesOfSeries % 60 + ' minutes';
// console.log(seriesLength);
// return minutesOfSeries;

