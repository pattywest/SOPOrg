import sql from './db.js';

const User = function (user) {
  this.name = user.name;
  this.email = user.email;
  this.password = user.password;
  this.privilege = user.privilege || 0;
};

User.create = (newUser, resultCallback) => {
  sql.query('INSERT INTO users SET ?', newUser, (err) => {
    if (err) {
      console.log(`Error: ${err.message}`);
      if (err.sqlMessage) {
        console.log(`SQL Error: ${err.sqlMessage}`);
      }

      resultCallback(err, null);
      return;
    }
    resultCallback(undefined);
  });
};

User.update = (id, updated_user, resultCallback) => {
  sql.query('UPDATE users SET ? WHERE id = ?', [updated_user, id], (err) => {
    if (err) {
      if (err.sqlMessage) {
        console.log(`SQL Error: ${err.sqlMessage}`);
      } else console.log(`Error: ${err.message}`);

      resultCallback(err, null);
      return;
    }

    resultCallback(undefined);
  });
};

User.getAll = (resultCallback) => {
  sql.query('SELECT * FROM users', (err, res) => {
    if (err) {
      console.log(`Error: ${err.message}`);
      if (err.sqlMessage) {
        console.log(`SQL Error: ${err.sqlMessage}`);
      }

      resultCallback(err, null);
      return;
    }

    resultCallback(undefined, res);
  });
};

User.getById = (id, resultCallback) => {
  sql.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id], (err, res) => {
    if (err) {
      console.log(`Error: ${err.message}`);
      if (err.sqlMessage) {
        console.log(`SQL Error: ${err.sqlMessage}`);
      }

      resultCallback(err, null);
      return;
    }

    if (!res.length) return resultCallback(new Error('User not found'), null);
    resultCallback(undefined, JSON.parse(JSON.stringify(res[0])));
  });
};

User.deleteUser = (email, resultCallback) => {
  sql.query('DELETE FROM users WHERE email = ?', [email], (err) => {
    if (err) {
      if (err.sqlMessage) {
        console.log(`SQL Error: ${err.sqlMessage}`);
      } else console.log(`Error: ${err.message}`);

      resultCallback(err, null);
      return;
    }

    resultCallback(undefined);
  });
};

export default User;
