import Link from "next/link";
import VoidLogo from "@/components/ui/VoidLogo";

export default function NotFound() {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-void-black p-6 text-center text-white grain">
      <div className="flex flex-col items-center">
        <VoidLogo size={90} />
        <div className="mt-8 font-display text-5xl font-bold tracking-[0.2em] text-white sm:text-7xl">
          404
        </div>
        <p className="mt-3 font-mono text-[11px] tracking-[0.35em] text-void-red">
          SIGNAL LOST IN THE VOID
        </p>
        <p className="mt-2 max-w-xs font-mono text-[10px] leading-relaxed tracking-widest text-void-ash">
          THE PAGE YOU&apos;RE LOOKING FOR WAS NEVER BROADCAST — OR IT RETURNED
          TO THE VOID.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link href="/" className="void-btn">
            ENTER THE ROOM
          </Link>
          <Link
            href="/frames"
            className="font-mono text-[11px] tracking-[0.3em] text-void-ash underline-offset-4 transition hover:text-white hover:underline"
          >
            BROWSE THE COLLECTION ›
          </Link>
        </div>
      </div>
    </main>
  );
}
