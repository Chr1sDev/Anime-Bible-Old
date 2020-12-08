const Discord3 = require('discord.js');

module.exports = {
    name: 'anime',
    description: '',
    execute(msg) {

        const SQLite = require('better-sqlite3');
        const sql = new SQLite('./databases/stats.sqlite');
        var stats = sql.prepare("SELECT * FROM stats WHERE stay = 1").get();
        stats.anime++;
        stats.total++;
        sql.prepare("INSERT OR REPLACE INTO stats (total, anime, manga, character, help, about, invite, quote, stay) VALUES (@total, @anime, @manga, @character, @help, @about, @invite, @quote, @stay);").run(stats);

        const sanitizeHtml = require('sanitize-html');

        const fetch = require('node-fetch');



        // Define our query variables and values that will be used in the query request
        var vars = {
            search: `${msg.content.substr(9)}`,
        };

        // Here we define our query as a multi-line string
        var query = `
        {
            Media(search: "${vars.search}", type: ANIME) {
              coverImage {
                extraLarge
                large
                medium
                color
              }
              title {
                romaji
                english
                native
                userPreferred
              }
              description(asHtml: false)
              episodes
              averageScore
            }
          }
        `;

        // Define the config we'll need for our Api request
        var url = 'https://graphql.anilist.co',
            options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    query: query,
                    variables: vars
                })
            };

        // Make the HTTP Api request
        fetch(url, options).then(handleResponse)
        .then(handleData)
        .catch(handleError);

        function handleResponse(response) {
            return response.json().then(function (json) {
                return response.ok ? json : Promise.reject(json);
            });
        }

        function handleData(results) {

            //var desc = results.data.Media.description.substring(0,100);

            var dirty = results.data.Media.description.substring(0,250);
            const desc = sanitizeHtml(dirty, { allowedTags: [], allowedAttributes: {} });
            //var desc = results.data.Media.description.substring(0,250).replace(/&mdash;/gi, "-").replace(/&ndash;/gi, "-").replace( /(<([^>]+)>)/ig, '');



            const aboutEmbed = new Discord3.MessageEmbed()
            //.setTitle(`About Anime List`)
            //.setURL(`https://chr1s.dev`)
            .setAuthor(`${results.data.Media.title.romaji} (${results.data.Media.title.native})`, `https://anilist.co/img/icons/favicon-32x32.png`,`https://anilist.co`)
            .setColor('#55128E')
            .setDescription(`${desc}...`)
            .setFooter(`Total Episodes: ${results.data.Media.episodes}   |   Average Score: ${results.data.Media.averageScore}/100`, `https://chr1s.dev/assets/animelist.png`)
            .setThumbnail(`${results.data.Media.coverImage.extraLarge}`)
            msg.channel.send(aboutEmbed)

        }

        function handleError(error) {
            msg.channel.send(`\**Error:\** Invalid anime name!`);
            //console.error(error);
        }
    ///////
    console.log(`#`);
    },
}