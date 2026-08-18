function authenticateAdmin(req, res, next) {
  // Public mode: auto-attach default system admin user
  req.user = {
    userId: 'system-admin',
    username: 'admin@graduation.edu',
    role: 'ADMIN',
    name: 'Graduation System',
  };
  next();
}

module.exports = { authenticateAdmin };
