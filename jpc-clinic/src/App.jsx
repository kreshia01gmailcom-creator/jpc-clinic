import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { auth, googleProvider, db } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  doc,
  getDoc, 
  setDoc 
} from 'firebase/firestore';

import { AuthProvider } from './context/AuthContext.jsx';
import { ClinicProvider } from './context/ClinicContext.jsx';

import RequireAuth from './components/RequireAuth.jsx';
import StudentRequireAuth from './components/StudentRequireAuth.jsx';
import Layout from './components/Layout.jsx';

import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Students from './pages/Students.jsx';
import AddStudent from './pages/AddStudent.jsx';
import Visits from './pages/Visits.jsx';
import Medicines from './pages/Medicines.jsx';
import Reports from './pages/Reports.jsx';
import Profile from './pages/Profile.jsx';
import StudentPortal from './pages/StudentPortal.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // Stores 'admin', 'editor', 'student', etc.
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser); 

        
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          // Fetch existing role
          setRole(userSnap.data().role || 'student');
        } else {
         
          const defaultRole = 'student'; 
          await setDoc(userRef, {
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            role: defaultRole,
            createdAt: serverTimestamp()
          });
          setRole(defaultRole);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  
  const handleManualLogin = (username, userRole) => {
    const resolvedRole = userRole || (username.toLowerCase().includes('admin') ? 'admin' : 'student');
    setUser({
      displayName: username,
      email: username.includes('@') ? username : `${username}@jpc.edu`,
      uid: 'manual_' + username,
    });
    setRole(resolvedRole);
  };

  
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
    setUser(null);
    setRole(null);
  };

  if (loading) return <h2>Loading Application State...</h2>;

  const currentRole = (role || 'student').toLowerCase();
  const authUser = user
    ? {
        uid: user.uid,
        name: user.displayName || user.email,
        email: user.email,
        photoURL: user.photoURL,
        role: currentRole,
        level: currentRole === 'admin' ? 'Clinic Administrator' : 'Student',
      }
    : null;

  return (
    <AuthProvider
      value={{
        user: authUser,
        role: currentRole,
        loading: false,
        googleLogin: handleLogin,
        login: handleManualLogin,
        logout: handleLogout,
      }}
    >
      <ClinicProvider>
        <Routes>
         
          <Route
            path="/"
            element={
              !user ? (
                <LandingPage onLogin={handleLogin} />
              ) : currentRole === 'admin' ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/my-health" replace />
              )
            }
          />

         
          <Route
            path="/login"
            element={
              !user ? (
                <Login onLogin={handleLogin} onManualLogin={handleManualLogin} />
              ) : currentRole === 'admin' ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/my-health" replace />
              )
            }
          />

         
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Layout>
                  <Dashboard />
                </Layout>
              </RequireAuth>
            }
          />
          <Route
            path="/students"
            element={
              <RequireAuth>
                <Layout>
                  <Students />
                </Layout>
              </RequireAuth>
            }
          />
          <Route
            path="/students/new"
            element={
              <RequireAuth>
                <Layout>
                  <AddStudent />
                </Layout>
              </RequireAuth>
            }
          />
          <Route
            path="/visits"
            element={
              <RequireAuth>
                <Layout>
                  <Visits />
                </Layout>
              </RequireAuth>
            }
          />
          <Route
            path="/medicines"
            element={
              <RequireAuth>
                <Layout>
                  <Medicines />
                </Layout>
              </RequireAuth>
            }
          />
          <Route
            path="/reports"
            element={
              <RequireAuth>
                <Layout>
                  <Reports />
                </Layout>
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Layout>
                  <Profile />
                </Layout>
              </RequireAuth>
            }
          />

         
          <Route
            path="/my-health"
            element={
              <StudentRequireAuth>
                <StudentPortal />
              </StudentRequireAuth>
            }
          />

         
          <Route
            path="/admin-login"
            element={
              !user ? (
                <Navigate to="/login" replace />
              ) : currentRole === 'admin' ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/my-health" replace />
              )
            }
          />
          <Route
            path="/student-login"
            element={
              !user ? (
                <Navigate to="/login" replace />
              ) : currentRole === 'admin' ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/my-health" replace />
              )
            }
          />

          
          <Route
            path="*"
            element={
              !user ? (
                <Navigate to="/" replace />
              ) : currentRole === 'admin' ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/my-health" replace />
              )
            }
          />
        </Routes>
      </ClinicProvider>
    </AuthProvider>
  );
}