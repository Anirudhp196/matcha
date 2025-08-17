import React from 'react';

const RoleProtectedRoute = ({ children }) => {
  // No role restrictions needed - everyone accesses the performative side
  return children;
};

export default RoleProtectedRoute;