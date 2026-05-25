import { StoreProvider } from './store/StoreProvider';
import { ServicesProvider } from './services/ServicesProvider';
import { ToastProvider, PhoneFrame, ScreenWrap } from './components';
import { ScaffoldPlaceholder } from './ScaffoldPlaceholder';

export default function App() {
  return (
    <StoreProvider>
      <ServicesProvider>
        <PhoneFrame>
          <ToastProvider>
            <ScreenWrap>
              <ScaffoldPlaceholder />
            </ScreenWrap>
          </ToastProvider>
        </PhoneFrame>
      </ServicesProvider>
    </StoreProvider>
  );
}
