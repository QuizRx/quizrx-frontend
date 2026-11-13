import { cn } from "@/core/lib/utils";

type ModeHeroProps = {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
  className?: string;
};

// Welcome view shared by the three modes. The illustration lives only here;
// it is never shown behind questions or conversations.
export function ModeHero({ title, subtitle, children, className }: ModeHeroProps) {
  return (
    <section className={cn("mx-auto w-full max-w-3xl px-4 sm:px-6", className)}>
      <div className="flex items-center justify-between gap-4 sm:gap-8">
        <div className="min-w-0 flex-1">
          <h1 className="text-balance text-[1.75rem] font-semibold leading-tight tracking-tight text-[var(--primary)] sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-zinc-600 sm:text-lg">
            {subtitle}
          </p>
        </div>
        <img
          src="/chatBG.png"
          alt=""
          aria-hidden
          className="pointer-events-none hidden h-36 w-[160px] shrink-0 select-none object-cover object-left min-[480px]:block sm:h-44 sm:w-[198px] lg:h-52 lg:w-[234px]"
        />
      </div>
      {children && <div className="mt-6 sm:mt-8">{children}</div>}
    </section>
  );
}
