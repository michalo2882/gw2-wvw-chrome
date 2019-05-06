new Vue({
    el: "#app",
    data: {
      matches: []
    },
    async created() {
        await this.download();
    },
    methods: {
      test() {
        this.matches.push({
          worlds: {
            red: "test",
            green: "test",
            blue: "test"
          }
        });
      },
      async download() {
        let vm = this;
  
        let resp = await axios.get(`https://api.guildwars2.com/v2/wvw/matches`);
        let matchIds = resp.data.filter((x) => x[0] == '2');
        let proms = [];
        for (let matchId of matchIds) {
          proms.push(axios.get(`https://api.guildwars2.com/v2/wvw/matches/${matchId}`));
        }
        let matches = {};
        let worldsIds = [];
        for (let matchResp of await axios.all(proms)) {
          let matchData = matchResp.data;
          matches[matchData.id] = matchData;
          for (let ws in matchData.all_worlds) {
            worldsIds.push.apply(worldsIds, matchData.all_worlds[ws]);
          }
        }
        proms = [];
        for (let world of worldsIds) {
          proms.push(axios.get(`https://api.guildwars2.com/v2/worlds/${world}`));
        }
        let worlds = {};
        for (let worldResp of await axios.all(proms)) {
          let worldData = worldResp.data;
          worlds[worldData.id] = worldData;
        }
        
        vm.matches = [];
        for (let matchId of matchIds) {
            const data = matches[matchId];
          let plusWorlds = {
                red: data.all_worlds.red,
              green: data.all_worlds.green,
              blue: data.all_worlds.blue
          };
          plusWorlds.red.splice(plusWorlds.red.indexOf(data.worlds.red), 1);
          plusWorlds.green.splice(plusWorlds.green.indexOf(data.worlds.green), 1);
          plusWorlds.blue.splice(plusWorlds.blue.indexOf(data.worlds.blue), 1);
          plusWorlds.red = plusWorlds.red.map((x) => worlds[x].name);
          plusWorlds.green = plusWorlds.green.map((x) => worlds[x].name);
          plusWorlds.blue = plusWorlds.blue.map((x) => worlds[x].name);
          
          let match = {
              id: data.id,
            scores: data.scores,
            victoryPoints: data.victory_points,
            worlds: {
              red: worlds[data.worlds.red].name,
              green: worlds[data.worlds.green].name,
              blue: worlds[data.worlds.blue].name
            },
            plusWorlds : plusWorlds
          };
          vm.matches.push(match);
        }
        
        console.log({
            matches: matches,
          worlds: worlds
        });
      }
    }
  })
  