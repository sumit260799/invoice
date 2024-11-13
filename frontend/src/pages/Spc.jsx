import React from 'react';
import { useSelector } from 'react-redux';
const Spc = () => {
  const { user } = useSelector(state => state.auth);
  console.log('🚀 ~ Spc ~ user:', user);
  return <div>Spc</div>;
};

export default Spc;
