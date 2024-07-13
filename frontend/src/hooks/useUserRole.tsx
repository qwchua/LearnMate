import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { fetchAuthSession } from "aws-amplify/auth";

// Define the user role type
type UserRole = "teacher" | "none" | "error" | null;

// Create the context with a default value of null
export const UserRoleContext = createContext<UserRole>(null);

// Define the provider props type
interface UserRoleProviderProps {
  children: ReactNode;
}

// Provider component
export const UserRoleProvider: React.FC<UserRoleProviderProps> = ({
  children,
}) => {
  const [userRole, setUserRole] = useState<UserRole>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const session = await fetchAuthSession();
        const groups: string[] =
          (session?.tokens?.idToken?.payload["cognito:groups"] as string[]) ||
          [];
        if (groups.includes("teachers")) {
          setUserRole("teacher");
        } else {
          setUserRole("none");
        }
      } catch (error) {
        console.error("Error fetching user groups:", error);
        setUserRole("error");
      }
    };

    fetchUserRole();
  }, []);

  return (
    <UserRoleContext.Provider value={userRole}>
      {children}
    </UserRoleContext.Provider>
  );
};

// Custom hook to use the UserRoleContext
export const useUserRole = () => useContext(UserRoleContext);
