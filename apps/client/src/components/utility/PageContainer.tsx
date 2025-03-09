type PageContainerProps = {
  children: React.ReactNode | React.ReactNode[];
};

export const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
  return (
    <div className="w-full min-h-full h-fit flex flex-row justify-center items-start flex-wrap gap-6 p-12 pb-24 overflow-auto">
      {children}
    </div>
  );
};
