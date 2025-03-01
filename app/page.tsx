import SigpassKit from '@/components/sigpasskit';
import SendTransaction from '@/components/send-transaction';
export default function Home() {
  return (
    <div className="flex flex-col w-full h-full">
      <header className="flex items-center justify-between p-4">
        <h1 className="text-2xl font-bold">SigpassKit</h1>
        <SigpassKit />
      </header>
      <div className="flex flex-col gap-8 items-center justify-center p-4">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-bold">Demo</h1>
          <p className="text-sm text-muted-foreground">Send a transaction to test the wallet connection</p>
        </div>
        <SendTransaction />
      </div>
    </div>
  );
}
