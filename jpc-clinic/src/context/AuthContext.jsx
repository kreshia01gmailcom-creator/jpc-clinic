import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { auth, googleProvider, db } from '../firebase.js';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext(null);

function loadStoredUser() {
    try {
        return JSON.parse(localStorage.getItem('jpc_user'));
    } catch {
        return null;
    }
}

export function AuthProvider({ children, value }) {
    const [user, setUser] = useState(loadStoredUser);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (value) return; // If value is supplied from parent, skip internal listener

        let snapshotUnsub = null;

        const authUnsub = onAuthStateChanged(auth, async (currentUser) => {
            if (snapshotUnsub) {
                snapshotUnsub();
                snapshotUnsub = null;
            }

            if (currentUser) {
                const userRef = doc(db, 'users', currentUser.uid);

                // Listen to Firestore document in real-time so edits in Firebase Console reflect immediately
                snapshotUnsub = onSnapshot(userRef, async (userSnap) => {
                    let fetchedRole = 'student';
                    if (userSnap.exists()) {
                        fetchedRole = (userSnap.data().role || 'student').toLowerCase();
                    } else {
                        // If user doesn't exist yet in Firestore, create default document
                        await setDoc(userRef, {
                            displayName: currentUser.displayName,
                            email: currentUser.email,
                            photoURL: currentUser.photoURL,
                            role: 'student',
                            createdAt: serverTimestamp()
                        });
                    }

                    const u = {
                        uid: currentUser.uid,
                        name: currentUser.displayName || currentUser.email,
                        email: currentUser.email,
                        photoURL: currentUser.photoURL,
                        role: fetchedRole,
                    };
                    localStorage.setItem('jpc_user', JSON.stringify(u));
                    setUser(u);
                    setLoading(false);
                }, (err) => {
                    console.error('Firestore user snapshot error:', err);
                    setLoading(false);
                });
            } else {
                localStorage.removeItem('jpc_user');
                setUser(null);
                setLoading(false);
            }
        });

        return () => {
            if (snapshotUnsub) snapshotUnsub();
            authUnsub();
        };
    }, [value]);

    const googleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const currentUser = result.user;
            const userRef = doc(db, 'users', currentUser.uid);
            const userSnap = await getDoc(userRef);

            let role = 'student';
            if (userSnap.exists()) {
                role = (userSnap.data().role || 'student').toLowerCase();
            } else {
                role = 'student';
                await setDoc(userRef, {
                    displayName: currentUser.displayName,
                    email: currentUser.email,
                    photoURL: currentUser.photoURL,
                    role: role,
                    createdAt: serverTimestamp()
                });
            }

            const u = {
                uid: currentUser.uid,
                name: currentUser.displayName || currentUser.email,
                email: currentUser.email,
                photoURL: currentUser.photoURL,
                role: role,
            };
            localStorage.setItem('jpc_user', JSON.stringify(u));
            setUser(u);
            return { success: true, role, user: u };
        } catch (err) {
            console.error('Google login error:', err.code, err.message);
            return { success: false, error: err.message || err.code };
        }
    };

    const login = (username, level) => {
        const typed = username.trim().toLowerCase();
        const resolvedRole = typed === 'admin' ? 'admin' : 'student';
        const u = { name: username, level, role: resolvedRole, manual: true };
        localStorage.setItem('jpc_user', JSON.stringify(u));
        setUser(u);
        return { success: true, role: resolvedRole };
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (err) {
            console.error('Sign out error:', err);
        }
        localStorage.removeItem('jpc_user');
        setUser(null);
    };

    const contextValue = value || {
        user,
        role: user?.role,
        loading,
        googleLogin,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);