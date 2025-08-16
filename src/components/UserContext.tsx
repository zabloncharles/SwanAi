import React, { createContext, useContext, useEffect, useState } from "react";
import { UserData } from "../types/user";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface UserContextType {
  userData: UserData | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  userData: null,
  loading: true,
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, userLoading] = useAuthState(auth);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      // Don't try to fetch data if auth is still loading or user is not authenticated
      if (userLoading) {
        console.log("Auth still loading, skipping user data fetch");
        return;
      }

      if (user && user.uid) {
        try {
          console.log("Fetching user data for:", user.uid);
          console.log("User object:", {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
          });

          const userRef = doc(db, "users", user.uid);
          console.log("User ref created:", userRef.path);

          const userSnap = await getDoc(userRef);
          console.log("User snapshot exists:", userSnap.exists());

          if (userSnap.exists()) {
            const userData = userSnap.data();
            console.log("User data retrieved:", userData);
            setUserData({ uid: user.uid, ...userData } as UserData);
            console.log("User data fetched successfully");
          } else {
            console.log(
              "User document does not exist, creating basic user data"
            );
            // Create a basic user document if it doesn't exist
            try {
              await setDoc(userRef, {
                email: user.email || "",
                firstName: "",
                lastName: "",
                phoneNumber: "",
                personality: "",
                aiRelationship: "",
                notificationsEnabled: false,
                tokensUsed: 0,
                createdAt: new Date(),
                lastLogin: new Date(),
              });
              console.log("Basic user document created");
              setUserData({
                uid: user.uid,
                email: user.email || "",
                firstName: "",
                lastName: "",
                phoneNumber: "",
                personality: "",
                aiRelationship: "",
                notificationsEnabled: false,
                tokensUsed: 0,
                createdAt: new Date(),
                lastLogin: new Date(),
              } as UserData);
            } catch (createError) {
              console.error("Error creating user document:", createError);
              setUserData(null);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          console.error("Error details:", {
            code: (error as any).code,
            message: (error as any).message,
            stack: (error as any).stack,
          });
          setUserData(null);
        }
      } else {
        console.log("No authenticated user");
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
