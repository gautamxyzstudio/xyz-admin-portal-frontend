/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";

interface LoginValues {
  identifier: string;
  password: string;
}

interface AuthContextProps {
  identifier: string;
  password: string;
}

interface Props {
  children: React.ReactNode;
}

export const AuthContext = createContext<AuthContextProps>({
  identifier: "",
  password: "",
});

const AuthProvider = ({ children }: Props) => {
  const initialValues: LoginValues = {
    identifier: "",
    password: "",
  };

  return (
    <AuthContext.Provider value={initialValues}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};
