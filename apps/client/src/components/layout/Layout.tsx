type LayoutProps = {
  children: React.ReactNode;
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <main className="flex flex-col items-center justify-center w-full">
      {children}
    </main>
  );
};
