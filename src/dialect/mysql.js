const wrapper = (dialect) => {
  const mysql = require(dialect);

  let connect = () => {};
  let exec = () => {};

  if (dialect === 'mariadb') {
    const mariadb = require('./mariadb');
    connect = mariadb.connect;
    exec = mariadb.exec;
  } else {
    connect = (options) => mysql.createPool({
      host: options.host || 'localhost',
      user: options.username || 'root',
      database: options.database || 'test',
      password: options.password || '',
      waitForConnections: options.waitForConnections || true,
      connectionLimit: options.connectionLimit || 100,
      queueLimit: options.queueLimit || 0,
    });

    exec = (connection, query) => new Promise((resolve, reject) => {
      connection.query(query, (err, res) => {
        if (!!err) return reject(err);
        if (!!res.map) return resolve(res.map(r => ({...r})));

        const tmp = {};
        Object.keys(res).forEach(k => { tmp[k] = res[k] });
        resolve(tmp);
      });
    });
  }

  const select = (cols, table, where) => {
    let wheres = '';

    if (!!where) {
      wheres = `WHERE ${where}`;
    }

    return `SELECT ${cols} FROM ${table} ${wheres}`.trim();
  };

  const insert = (table, value) => {
    let query = '';
    if (value.length > 0) {
      query = `INSERT INTO ${table}`;
      value = value.map(v => {
        if (v === null) {
          return "NULL";
        }
        return `"${v}"`;
      });
      query += ` VALUES (${value.join(', ')})`;
    } else if(Object.keys(value).length > 0) {
      query += mysql.format(`INSERT INTO ${table} SET ?`, value);
    }
    return query;
  };

  const update = (table, value, conditions) => {
    let query = `UPDATE ${table} SET `;
    query += Object.keys(value).map(v => {
      let tmp = `${v}=`;
      if (typeof value[v] === 'string') {
        tmp += `"${value[v]}"`;
      } else {
        tmp += `${value[v]}`;
      }
      return tmp;
    })
    .join(', ');

    if (conditions !== null && conditions.length > 0) {
      query += ' WHERE ';
      query += conditions.join(' AND ');
    }

    return query;
  };

  const rm = (table, conditions) => {
    let query = `DELETE FROM ${table}`;
    if (conditions !== null && conditions.length > 0) {
      query += ' WHERE ';
      query += conditions.join(' AND ');
    }

    return query;
  };

  return {
    connect,
    exec,
    select,
    insert,
    update,
    rm,
  };
};

module.exports = wrapper;
