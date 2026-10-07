/* =====================================================
   0G Chain - Network details: add-to-wallet + copy
   ===================================================== */

const NETWORKS = {
    mainnet: {
        chainId: '0x4115', // 16661
        chainName: '0G Mainnet',
        nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
        rpcUrls: ['https://evmrpc.0g.ai'],
        blockExplorerUrls: ['https://chainscan.0g.ai']
    },
    testnet: {
        chainId: '0x40DA', // 16602
        chainName: '0G-Galileo-Testnet',
        nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
        rpcUrls: ['https://evmrpc-testnet.0g.ai'],
        blockExplorerUrls: ['https://chainscan-galileo.0g.ai']
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initAddNetworkButtons();
    initCopyButtons();
});

function setNote(network, text, isError) {
    const note = document.querySelector(`.network-note[data-note="${network}"]`);
    if (!note) return;
    note.textContent = text;
    note.classList.toggle('error', Boolean(isError));
}

function initAddNetworkButtons() {
    document.querySelectorAll('.add-network-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const key = button.dataset.network;
            const params = NETWORKS[key];
            if (!params) return;

            if (!window.ethereum || typeof window.ethereum.request !== 'function') {
                setNote(key, 'No browser wallet detected. Add the network manually using the details above.', true);
                return;
            }

            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [params]
                });
                setNote(key, `${params.chainName} added to your wallet.`, false);
            } catch (err) {
                // 4001 = user rejected the request
                const msg = err && err.code === 4001
                    ? 'Request cancelled in wallet.'
                    : 'Wallet declined the request. Add the network manually using the details above.';
                setNote(key, msg, true);
            }
        });
    });
}

function initCopyButtons() {
    document.querySelectorAll('.copy-btn[data-copy]').forEach(button => {
        const original = button.innerHTML;
        button.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(button.dataset.copy);
                button.innerHTML = '<i class="fa-solid fa-check"></i>';
            } catch (err) {
                console.warn('[0G Chain] Clipboard unavailable:', err);
                button.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            }
            setTimeout(() => { button.innerHTML = original; }, 1500);
        });
    });
}
