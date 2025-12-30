/**
 * App Component
 * 
 * Root component of the application.
 * Sets up providers and routing.
 */

import { AuthProvider } from './context';
import { ToastProvider } from './components/ui';
import { AppRouter } from './routes';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;