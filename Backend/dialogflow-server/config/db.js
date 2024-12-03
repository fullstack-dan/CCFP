const { Pool } = require("pg");
const env = require("dotenv").config();

const pool = new Pool({
    user: process.env.POSTGRE_DB_USER,
    host: process.env.POSTGRE_DB_HOST,
    database: "cscoursecatalog",
    password: process.env.POSTGRE_DB_PASSWORD,
    port: 5432,
});

module.exports = pool;
