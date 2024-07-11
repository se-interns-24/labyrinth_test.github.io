const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.use(bodyParser.json());

const dbConfig = {
  host: 'labyrinth-database.cjukaogw2e90.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: 'HashicorpInterns2024!',
  database: 'labyrinth-database'
};

const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the RDS instance.');

  // Check if 'counter' column exists and add it if it doesn't
  const checkColumnQuery = `
    SELECT COUNT(*) AS count 
    FROM information_schema.columns 
    WHERE table_schema = 'labyrinth-database' 
      AND table_name = 'users' 
      AND column_name = 'counter';
  `;

  connection.query(checkColumnQuery, (err, result) => {
    if (err) {
      console.error('Failed to check columns:', err);
      return;
    }
    if (result[0].count === 0) {
      const alterTableQuery = `
        ALTER TABLE users
        ADD COLUMN counter INT DEFAULT 1;
      `;
      connection.query(alterTableQuery, (err, result) => {
        if (err) {
          console.error('Failed to alter table:', err);
          return;
        }
        console.log('Table altered to add counter column.');
      });
    } else {
      console.log('Counter column already exists.');
    }
  });

  // Ensure the 'email' column is unique
  const checkUniqueConstraintQuery = `
    SELECT COUNT(*) AS count
    FROM information_schema.table_constraints
    WHERE table_schema = 'labyrinth-database' 
      AND table_name = 'users' 
      AND constraint_type = 'UNIQUE'
      AND constraint_name = 'email';
  `;

  connection.query(checkUniqueConstraintQuery, (err, result) => {
    if (err) {
      console.error('Failed to check for unique constraint:', err);
      return;
    }
    if (result[0].count === 0) {
      const addUniqueConstraintQuery = `
        ALTER TABLE users
        ADD UNIQUE (email);
      `;
      connection.query(addUniqueConstraintQuery, (err, result) => {
        if (err) {
          console.error('Failed to add unique constraint:', err);
          return;
        }
        console.log('Unique constraint on email column added.');
      });
    } else {
      console.log('Unique constraint on email column already exists.');
    }
  });
});

// Serve static files from the "public" directory
app.use(express.static('public'));

// Endpoint to handle email submission
app.post('/add-email', (req, res) => {
  const email = req.body.email;
  if (!email) {
    return res.status(400).send('Email is required');
  }

  const sql = `
    INSERT INTO users (email, counter)
    VALUES (?, 1)
    ON DUPLICATE KEY UPDATE counter = counter + 1;
  `;
  connection.query(sql, [email], (err, result) => {
    if (err) {
      console.error('Failed to insert or update email:', err);
      return res.status(500).send('Failed to process email');
    }

    // Retrieve the updated counter value
    const selectSql = `SELECT counter FROM users WHERE email = ?`;
    connection.query(selectSql, [email], (err, results) => {
      if (err) {
        console.error('Failed to retrieve counter:', err);
        return res.status(500).send('Failed to retrieve counter');
      }

      const counter = results[0].counter;
      console.log('Email processed successfully with counter:', counter);
      res.send(`You are playing your ${counter} game!`);
    });
  });
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Trying another port...`);
    setTimeout(() => {
      server.close();
      server.listen(0); // Let the system pick an available port
    }, 1000);
  } else {
    console.error('Server error:', err);
  }
});
