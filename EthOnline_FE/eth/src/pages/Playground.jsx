import Navbar from '../components/LandingComponents/Navbar';
import Footer from '../components/LandingComponents/Footer';
import MainPlayGround from '../components/PlaygroundComponents/MainPlayGround';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';

const Playground = () => {
  const { isConnected } = useAccount();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isConnected) {
      navigate('/');
    }
  }, [isConnected, navigate]);

  if (!isConnected) return null;

  return (
    <div>
      <Navbar />
      <MainPlayGround />
      <Footer />

    </div>
  )
};

export default Playground;
