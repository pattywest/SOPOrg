import mysql from 'mysql';
import config from '../config/db.config.js';

const connection = mysql.createConnection({
  host: config.HOST,
  user: config.USER,
  password: config.PASSWORD,
  database: config.DB,
  port: config.PORT,
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Successfully connected to the database.');
});

export default connection;
