import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";

export const Navbar = () => {
  return (
    <nav className="shadow-md p-4 sticky w-full">
      <MobileNavbar />
      <DesktopNavbar />
    </nav>
  );
};

const MobileNavbar = () => {
  return (
    <div className="md:hidden flex flex-row items-center gap-5">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu size={24} />
          </Button>
        </SheetTrigger>
        <Brand />
        <SheetContent side="left" className="p-10">
          <div className="flex flex-col gap-5">
            <Links />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

const DesktopNavbar = () => {
  return (
    <div className="hidden md:flex flex-row gap-5 items-center">
      <Brand />
      <div className="flex flex-row gap-5">
        <Links />
      </div>
    </div>
  );
};

const Links = () => {
  return (
    <>
      <Link to="/" className="text-sm font-medium">
        Home
      </Link>
      <Link to="/about" className="text-sm font-medium">
        About
      </Link>
      <Link to="/contact" className="text-sm font-medium">
        Contact
      </Link>
    </>
  );
};

const Brand = () => {
  return (
    <Link to="/" className="text-xl font-bold text-center">
      Sahkonhintanyt.fi
    </Link>
  );
};
