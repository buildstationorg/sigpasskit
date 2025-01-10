// telegram
import {
  backButton,
  themeParams,
  miniApp,
  initData,
  init as initTelegram,
} from '@telegram-apps/sdk-react';

function initTelegramMiniApp(): boolean {
  initTelegram();
  backButton.isSupported() && backButton.mount();
  miniApp.mount();
  themeParams.mount();
  initData.restore();
  return true;
}

function checkSigpassTelegramWallet(): boolean {
    /**
   * Retrieve the handle to the private key from some unauthenticated storage
   */
    const status: string | null = localStorage.getItem("WALLET_STATUS");

    if (status) {
      return true;
    } else {
      return false;
    }
}

export { initTelegramMiniApp, checkSigpassTelegramWallet };