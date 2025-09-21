export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <h1>Navbar</h1>
      {children}
      <h1>Footer</h1>
    </>
  );
}
