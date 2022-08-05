const Pool = require('pg').Pool
require('dotenv').config()

const url = require('url')


const params = url.parse(process.env.DATABASE_URL);
const auth = params.auth.split(':');

const config = {
  user: auth[0],
  password: auth[1],
  host: params.hostname,
  port: params.port,
  database: params.pathname.split('/')[1],
  ssl: {rejectUnauthorized: false}
};

const pool = new Pool(config);
module.exports = pool




/*
const devConfig = {
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    database: process.env.PG_DATABASE,

}

const pool = new Pool(devConfig)
module.exports = pool
*/
