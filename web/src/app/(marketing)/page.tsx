import Container from "@/components/container";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Home = () => {
  return (
    <>
      {/* Navbar */}
      <Container>
        <h1>
          Welcome to our web{" "}
          <span className="relative inline-block before:absolute before:-inset-1 before:block before:-skew-y-3 before:bg-blue-500">
            <span className="relative">annoyed</span>
          </span>
        </h1>
        <Button className="mt-4" asChild>
          <Link href={"/login"}>Login</Link>
        </Button>
      </Container>
      {/* Footer */}
    </>
  );
};

export default Home;
