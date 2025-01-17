import SigpassKit from '@/components/sigpasskit';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          src="/sigpasskitlogo.svg"
          alt="SigpassKit logo"
          width={180}
          height={38}
          priority
          className="self-center"
        />
        <p className="text-center self-center">Get started by checking out the demo</p>
        <div className="flex flex-col items-center justify-center h-[150px] w-full border border-solid border-black/[.08] dark:border-white/[.145] rounded-lg shadow-lg">
          <SigpassKit />
        </div>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="https://github.com/buildstationorg/sigpasskit"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="https://nextjs.org/icons/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="https://github.com/buildstationorg/sigpasskit/tree/main/docs/introduction.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </div>
      <footer className="row-start-3 flex flex-col gap-4">
        <div className="flex gap-6 flex-wrap items-center justify-center">
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://github.com/buildstationorg/sigpasskit/tree/main/components"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="https://nextjs.org/icons/window.svg"
              alt="Window icon"
              width={16}
              height={16}
            />
            Components
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://buildstation.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="https://nextjs.org/icons/globe.svg"
              alt="Globe icon"
              width={16}
              height={16}
            />
            Go to buildstation.org →
          </a>
        </div>
        <div className="self-center text-sm text-muted-foreground">
          Maintained by <a className="underline underline-offset-4" href="https://buildstation.org" target="_blank" rel="noopener noreferrer">buildstation.org</a>
        </div>
      </footer>
    </div>
  );
}
