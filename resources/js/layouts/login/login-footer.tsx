export default function LoginFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-4 text-center text-sm text-muted-foreground bg-white">
      <div className="container mx-auto px-4">
        © {currentYear} SIBULAN.
      </div>
    </footer>
  );
}
