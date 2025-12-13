const jwt = require('jsonwebtoken');
const secret = 'your-super-secret-jwt-key-change-this-in-production';

const adminToken = jwt.sign({
  userId: 'admin',
  email: 'admin@rentverse.com',
  role: 'ADMIN'
}, secret, { expiresIn: '30d' });

console.log('Admin Token:', adminToken);