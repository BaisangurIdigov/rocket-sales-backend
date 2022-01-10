const axios = require("axios");
const { URI, SecretKey, Client } = process.env;
const store = require('store-js');

const fs = require("fs");
const os = require("os");

const setEnvValue = (key, value, Bearer)=> {
  const ENV_VARS = fs.readFileSync("./.env", "utf8").split(os.EOL);
  const target = ENV_VARS.indexOf(
    ENV_VARS.find((line) => {
      return line.match(new RegExp(key));
    })
  );
  if (Bearer) {
    ENV_VARS.splice(target, 1, `${key}=Bearer ${value}`);
  } else {
    ENV_VARS.splice(target, 1, `${key}=${value}`);
  }
  fs.writeFileSync("./.env", ENV_VARS.join(os.EOL));
}

module.exports.controller = {
  dataOutput: async (req, res) => {
    try {
      const Auth = store.get('variable')
      axios.defaults.headers.common["Authorization"] = Auth ? Auth : process.env.Authorization;
      const search = req.query.search;

      const trade = await axios
        .get(
          `${URI}/api/v4/leads?query=${
            search ? encodeURIComponent(search) : ""
          }&with=contacts`
        )
        .catch(async (error) => {
          let refresh;
          if (error.response.status === 401) {
            refresh = await axios.post(`${URI}/oauth2/access_token`, {
              client_id: Client,
              client_secret: SecretKey,
              grant_type: "refresh_token",
              refresh_token: process.env.Refresh,
              redirect_uri: URI,
            });
            setEnvValue("Refresh", refresh.data.refresh_token);
            setEnvValue("Authorization", refresh.data.access_token, "Bearer");
            const variable = `Bearer ${refresh.data.access_token}`
            store.set('variable', variable)
          }

        });
      const contacts = await axios.get(`${URI}/api/v4/contacts`);

      const pipelines = await axios.get(`${URI}/api/v4/leads/pipelines`);

      const users = await axios.get(`${URI}/api/v4/users`);

      const response = {
        trades: trade.data._embedded.leads,
        users: users.data._embedded.users,
        pipelines: pipelines.data._embedded.pipelines,
        contacts: contacts.data._embedded.contacts,
      };
      return res.json(response);
    } catch (e) {
      return res.status(401).json(`Контроллер ${e}`);
    }
  },
};
