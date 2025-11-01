import dynamic from 'next/dynamic';

const ThemeProvider = dynamic(
  () => import('../../components/theme-provider').then(mod => ({ default: mod.ThemeProvider })),
  {
    ssr: false,
    loading: () => <div>Loading...</div>,
  }
);

const ServiceWorkerRegister = dynamic(
  () =>
    import('../../components/service-worker-register').then(mod => ({
      default: mod.ServiceWorkerRegister,
    })),
  {
    ssr: false,
  }
);

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ServiceWorkerRegister />
      {children}
    </ThemeProvider>
  );
}
