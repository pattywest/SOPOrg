import jwt from 'jsonwebtoken';
import config from '../config/auth.config.js';
import connection from '../models/db.js';

const verifyToken = (req, res, next) => {
  let token = req.headers['token'];

  if (!token) {
    return res.status(403).send({
      message: 'No token provided!',
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: 'Token provided is not valid!',
      });
    }
    req.requesterID = decoded.id;
    next();
  });
};

const isAdmin = async (req, res, next) => {
  let ID = req.requesterID;
  try {
    connection.query(
      `SELECT privilege FROM users WHERE id = '${ID}'`,
      function (err, result) {
        if (err) throw err;
        req.requester = result[0].privilege;
        if (req.requester == '<Buffer 01>') {
          return next();
        } else {
          return res.status(403).send({
            message: 'Require Admin Role!',
          });
        }
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: 'Unable to validate User role!',
    });
  }
};

const authJwt = {
  verifyToken,
  isAdmin,
};
export default authJwt;
