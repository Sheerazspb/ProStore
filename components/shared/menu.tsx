import { Button } from "@/components/ui/button";
import { EllipsisVertical, ShoppingCart, UserIcon } from "lucide-react";
import Link from "next/link";
import ModeToggle from "./header/mode-toggle";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../ui/sheet";

const Menu = () => {
  return (
    <div className="flex justify-end gap-3">
      <nav className="hidden md:flex w-full max-w-xs gap-1">
        <ModeToggle />
        <Button asChild variant="ghost">
          <Link href="/cart" className="flex items-center gap-2">
            <ShoppingCart aria-hidden="true" />
            <span>Cart</span>
          </Link>
        </Button>
        <Button asChild>
          <Link href="/sign-in" className="flex items-center gap-2">
            <UserIcon aria-hidden="true" />
            <span>Sign In</span>
          </Link>
        </Button>
      </nav>
      <nav className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <EllipsisVertical />
            </Button>
          </SheetTrigger>
          <SheetContent className="flex flex-col items-center gap-4">
            <SheetTitle>Menu</SheetTitle>
            <ModeToggle />
            <Button asChild variant="ghost" className="w-full">
              <Link href="/cart" className="flex items-center gap-2">
                <ShoppingCart aria-hidden="true" />
                <span>Cart</span>
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/sign-in" className="flex items-center gap-2">
                <UserIcon aria-hidden="true" />
                <span>Sign In</span>
              </Link>
            </Button>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
};

export default Menu;
