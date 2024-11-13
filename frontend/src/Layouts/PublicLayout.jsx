import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';

const PublicLayout = () => {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'manager') {
        navigate('/manager');
      } else if (user.role === 'spc') {
        navigate('/spc');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  return <Outlet />;
};

export default PublicLayout;
