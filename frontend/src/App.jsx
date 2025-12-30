/**
 * App Component
 * 
 * Root component of the application.
 * Sets up providers and routing.
 */

import { AuthProvider } from './context';
import { AppRouter } from './routes';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;