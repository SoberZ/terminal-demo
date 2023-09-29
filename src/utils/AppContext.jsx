
import AuthProvider from "./useAuth";

const AppContext = ({ children }) => {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    )
}

export default AppContext;
