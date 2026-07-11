import { BrowserRouter } from 'react-router-dom';
import AppRoutes from '../routes/AppRoutes';
import { LanguageProvider } from '../utils/LanguageContext';
import '../styles/global.css';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
