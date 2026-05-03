import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import ProductPage from './pages/ProductPage';
import AdminPanel from './pages/admin/AdminPanel';
import LoginPage from './pages/admin/LoginPage';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <CartProvider>
            <BrowserRouter>
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/product/:id" element={<ProductPage />} />
                  <Route path="/admin/login" element={<LoginPage />} />
                  <Route path="/admin" element={<AdminPanel />} />
                </Routes>
              </ErrorBoundary>
            </BrowserRouter>
          </CartProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
