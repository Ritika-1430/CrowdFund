import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Explore from './pages/Explore';
import CreateFund from './pages/CreateFund';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import FundDetail from './pages/FundDetail';
import Donate from './pages/Donate';
import Verify from './pages/Verify';
import AdminDashboard from './pages/AdminDashboard';

const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/explore" element={<PageWrapper><Explore /></PageWrapper>} />
        <Route path="/funds/:id" element={<PageWrapper><FundDetail /></PageWrapper>} />
        <Route path="/funds/:id/donate" element={<PageWrapper><Donate /></PageWrapper>} />
        <Route path="/create" element={<PageWrapper><CreateFund /></PageWrapper>} />
        <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
        <Route path="/auth" element={<PageWrapper><Auth /></PageWrapper>} />
        <Route path="/verify" element={<PageWrapper><Verify /></PageWrapper>} />
        <Route path="/admin" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit">
    {children}
  </motion.div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-ivory font-sans text-charcoal flex flex-col grain-overlay">
          <Navbar />
          <main className="flex-1">
            <AnimatedRoutes />
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
