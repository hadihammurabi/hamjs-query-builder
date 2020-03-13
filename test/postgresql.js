const test = require('ava');
const Database = require('../src');

const db = new Database({
  dialect: 'pg',
  username: 'hammurabi',
  password: 'hammurabi',
});

db.connection.query('CREATE TABLE IF NOT EXISTS users (id serial primary key, fullname varchar(255), email varchar(255), password varchar(255))');

test('should return `pg`', (t) => {
  t.is(
    db.getDialect(),
    'pg'
  );
});

test('should result.query is `SELECT * FROM users`', async (t) => {
    const result = await db.table('users').all();
    t.is(
      result.query,
      'SELECT * FROM users'
    );
  });

test('should result.query is `SELECT email, password, fullname FROM users`', async (t) => {
  const result = await db.table('users').get('email', 'password', 'fullname');
  t.is(
    result.query,
    'SELECT email, password, fullname FROM users'
  );
});

test('should result.query is `SELECT * FROM users WHERE id=1`', async (t) => {
  const result = await db.table('users').where({ id: 1 }).get();
  t.is(
    result.query,
    'SELECT * FROM users WHERE id=1'
  );
});
