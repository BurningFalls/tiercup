import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center px-4">
        <Link href="/" className="font-semibold">
          TierCup
        </Link>
      </div>
    </header>
  );
}
