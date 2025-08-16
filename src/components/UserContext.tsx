import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserData } from '../types/user';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface UserContextType {
  userData: UserData | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({ userData: null, loading: true });

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, userLoading] = useAuthState(auth);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      // Don't try to fetch data if auth is still loading or user is not authenticated
      if (userLoading) {
        return;
      }

      if (user && user.uid) {
        try {
          console.log('Fetching user data for:', user.uid);
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserData({ uid: user.uid, ...userSnap.data() } as UserData);
            console.log('User data fetched successfully');
          } else {
            console.log('User document does not exist');
            setUserData(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserData(null);
        }
      } else {
        console.log('No authenticated user');
        setUserData(null);
      }
      setLoading(false);
    };

    fetchUserData();
  }, [user, userLoading]);

  // Show loading while auth is being determined
  if (userLoading) {
    return (
      <UserContext.Provider value={{ userData: null, loading: true }}>
        {children}
      </UserContext.Provider>
    );
  }

  return (
    <UserContext.Provider value={{ userData, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext); 