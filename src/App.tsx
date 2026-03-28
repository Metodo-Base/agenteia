import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { db, auth } from './firebase';
import { Nicho } from './types';
import { seedNichos } from './utils/seedNichos';
import LandingPage from './pages/LandingPage';
import AssistantPage from './pages/AssistantPage';
import AdminNichos from './components/AdminNichos';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [nichos, setNichos] = useState<Nicho[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);
  const [view, setView] = useState<'landing' | 'admin'>('landing');

  const isAdmin = user?.email === 'natanvileladesouza@gmail.com' || user?.email === 'ieqmur@gmail.com';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const allowedEmails = ['natanvileladesouza@gmail.com', 'ieqmur@gmail.com'];
        if (user.email && !allowedEmails.includes(user.email)) {
          await signOut(auth);
          setUser(null);
          return;
        }
      }
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'nichos'), orderBy('nome_nicho'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const nichosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Nicho[];
      setNichos(nichosData);
    }, (error) => {
      console.error('Error fetching nichos:', error);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const allowedEmails = ['natanvileladesouza@gmail.com', 'ieqmur@gmail.com'];
      
      if (user.email && !allowedEmails.includes(user.email)) {
        await signOut(auth);
        alert('Acesso negado. Somente administradores autorizados podem fazer login.');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = () => {
    signOut(auth).catch(console.error);
  };

  const handleAdminToggle = () => {
    if (!isAdmin) return;
    setView(prev => prev === 'admin' ? 'landing' : 'admin');
  };

  const handleSeed = async () => {
    if (!isAdmin || isSeeding) return;
    setIsSeeding(true);
    try {
      await seedNichos();
      alert('Nichos seeded successfully!');
    } catch (error) {
      console.error('Seed error:', error);
      alert('Error seeding nichos.');
    } finally {
      setIsSeeding(false);
    }
  };

  if (view === 'admin' && isAdmin) {
    return <AdminNichos onBack={() => setView('landing')} />;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <LandingPage 
              nichos={nichos}
              user={user}
              isAdmin={isAdmin}
              handleLogin={handleLogin}
              handleLogout={handleLogout}
              handleAdminToggle={handleAdminToggle}
              handleSeed={handleSeed}
              isSeeding={isSeeding}
              view={view}
            />
          } 
        />
        <Route path="/assistente" element={<AssistantPage />} />
      </Routes>
    </Router>
  );
}
