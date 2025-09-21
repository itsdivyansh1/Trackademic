const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="container mx-auto max-w-screen-xl px-4">{children}</div>
  );
};

export default Container;
