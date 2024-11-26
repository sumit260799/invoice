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
      } else if (user.role === 'billingManager') {
        navigate('/billingManager');
      } else if (user.role === 'billingAgent') {
        navigate('/billingAgent');
      } else if (user.role === 'C&LManager') {
        navigate('/C&LManager');
      } else if (user.role === 'inspector') {
        navigate('/inspector');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  return <Outlet />;
};

export default PublicLayout;
