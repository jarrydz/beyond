import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { StoreProvider } from './store/StoreProvider';
import { ServicesProvider } from './services/ServicesProvider';
import { PhoneFrame, ToastProvider } from './components';
import { Welcome } from './routes/Welcome';
import { SignIn } from './routes/SignIn';
import { Onboarding } from './routes/Onboarding';
import { Paywall } from './routes/Paywall';
import { MemberHome } from './routes/MemberHome';
import { CoachHome } from './routes/CoachHome';
import { Guard, PublicOnly } from './routes/Guard';

export default function App() {
  return (
    <StoreProvider>
      <ServicesProvider>
        <BrowserRouter>
          <PhoneFrame>
            <ToastProvider>
              <Routes>
                <Route path="/" element={<Navigate to="/welcome" replace />} />
                <Route
                  path="/welcome"
                  element={
                    <PublicOnly>
                      <Welcome />
                    </PublicOnly>
                  }
                />
                <Route
                  path="/signin"
                  element={
                    <PublicOnly>
                      <SignIn />
                    </PublicOnly>
                  }
                />
                <Route
                  path="/onboarding"
                  element={
                    <Guard need="member">
                      <Onboarding />
                    </Guard>
                  }
                />
                <Route
                  path="/paywall"
                  element={
                    <Guard need="member">
                      <Paywall />
                    </Guard>
                  }
                />
                <Route
                  path="/m"
                  element={
                    <Guard need="member">
                      <MemberHome />
                    </Guard>
                  }
                />
                <Route
                  path="/c"
                  element={
                    <Guard need="coach">
                      <CoachHome />
                    </Guard>
                  }
                />
                <Route path="*" element={<Navigate to="/welcome" replace />} />
              </Routes>
            </ToastProvider>
          </PhoneFrame>
        </BrowserRouter>
      </ServicesProvider>
    </StoreProvider>
  );
}
