// ===============================
// CRYPTOLINK - IMPROVED METAMASK DEMO
// ===============================

// Variables globales
let currentAccount = null;
let currentChainId = null;
let selectedChainId = null;
let networkBalances = {};
let cryptoPrices = {};
let transactionHistory = [];

// Elementos del DOM
const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const statusText = document.getElementById('statusText');
const statusProgress = document.getElementById('statusProgress');
const connectionIndicator = document.getElementById('connectionIndicator');
const statusDot = document.getElementById('statusDot');
const accountAddress = document.getElementById('accountAddress');
const networkName = document.getElementById('networkName');
const connectionPanel = document.getElementById('connectionPanel');
const mainDashboard = document.getElementById('mainDashboard');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const copyBtn = document.getElementById('copyBtn');
const refreshBalances = document.getElementById('refreshBalances');
const priceTicker = document.getElementById('priceTicker');
const ethPrice = document.getElementById('ethPrice');
const mainBalance = document.getElementById('mainBalance');
const mainBalanceUSD = document.getElementById('mainBalanceUSD');

// Elementos del dropdown
const dropdownBtn = document.getElementById('dropdownBtn');
const dropdownMenu = document.getElementById('dropdownMenu');
const selectedNetwork = document.getElementById('selectedNetwork');
const selectedNetworkBalance = document.getElementById('selectedNetworkBalance');

// Configuración de redes
const NETWORKS = {
    // Ethereum Networks
    '0x1': {
        name: 'Ethereum Mainnet',
        rpcUrl: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
        symbol: 'ETH',
        blockExplorer: 'https://etherscan.io'
    },
    '0x4268': {
        name: 'Holesky Testnet',
        rpcUrl: 'https://ethereum-holesky.publicnode.com',
        symbol: 'ETH',
        blockExplorer: 'https://holesky.etherscan.io'
    },
    '0xaa36a7': {
        name: 'Sepolia Testnet',
        rpcUrl: 'https://ethereum-sepolia.publicnode.com',
        symbol: 'ETH',
        blockExplorer: 'https://sepolia.etherscan.io'
    },
    
    // Layer 2 Networks
    '0x89': {
        name: 'Polygon Mainnet',
        rpcUrl: 'https://polygon-rpc.com',
        symbol: 'MATIC',
        blockExplorer: 'https://polygonscan.com'
    },
    '0x13881': {
        name: 'Polygon Mumbai',
        rpcUrl: 'https://rpc-mumbai.maticvigil.com',
        symbol: 'MATIC',
        blockExplorer: 'https://mumbai.polygonscan.com'
    },
    '0xa4b1': {
        name: 'Arbitrum One',
        rpcUrl: 'https://arb1.arbitrum.io/rpc',
        symbol: 'ETH',
        blockExplorer: 'https://arbiscan.io'
    },
    '0xa': {
        name: 'Optimism',
        rpcUrl: 'https://mainnet.optimism.io',
        symbol: 'ETH',
        blockExplorer: 'https://optimistic.etherscan.io'
    },
    '0x2105': {
        name: 'Base Mainnet',
        rpcUrl: 'https://mainnet.base.org',
        symbol: 'ETH',
        blockExplorer: 'https://basescan.org'
    },
    
    // Other Popular Networks
    '0x38': {
        name: 'Binance Smart Chain',
        rpcUrl: 'https://bsc-dataseed.binance.org',
        symbol: 'BNB',
        blockExplorer: 'https://bscscan.com'
    },
    '0x61': {
        name: 'BSC Testnet',
        rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
        symbol: 'BNB',
        blockExplorer: 'https://testnet.bscscan.com'
    },
    '0xa86a': {
        name: 'Avalanche C-Chain',
        rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
        symbol: 'AVAX',
        blockExplorer: 'https://snowtrace.io'
    },
    '0xe708': {
        name: 'Linea Mainnet',
        rpcUrl: 'https://rpc.linea.build',
        symbol: 'ETH',
        blockExplorer: 'https://lineascan.build'
    },
    '0x144': {
        name: 'zkSync Era',
        rpcUrl: 'https://mainnet.era.zksync.io',
        symbol: 'ETH',
        blockExplorer: 'https://explorer.zksync.io'
    }
};

const PRICE_SYMBOLS = {
    'ETH': 'ethereum',
    'MATIC': 'matic-network'
};

// ===============================
// SISTEMA DE NOTIFICACIONES
// ===============================

function showNotification(message, type = 'info', duration = 5000) {
    // Crear contenedor si no existe
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
        `;
        document.body.appendChild(container);
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const colors = {
        success: '#39ff14',
        error: '#ff6600',
        warning: '#ffbd2e',
        info: '#00ffff'
    };

    notification.style.cssText = `
        background: rgba(20, 30, 40, 0.95);
        border: 1px solid ${colors[type]};
        border-radius: 12px;
        padding: 16px 20px;
        color: ${colors[type]};
        font-family: 'Space Mono', monospace;
        font-size: 0.9rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(20px);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        cursor: pointer;
        position: relative;
        overflow: hidden;
    `;

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 1.2rem;">${icons[type]}</span>
            <span>${message}</span>
        </div>
    `;

    // Barra de progreso
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        height: 2px;
        background: ${colors[type]};
        width: 100%;
        transform-origin: left;
        animation: notificationProgress ${duration}ms linear;
    `;
    notification.appendChild(progressBar);

    // Agregar CSS para animación si no existe
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes notificationProgress {
                from { transform: scaleX(1); }
                to { transform: scaleX(0); }
            }
        `;
        document.head.appendChild(style);
    }

    container.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);

    // Auto-remover
    const timeout = setTimeout(() => {
        removeNotification(notification);
    }, duration);

    // Remover al hacer click
    notification.addEventListener('click', () => {
        clearTimeout(timeout);
        removeNotification(notification);
    });
}

function removeNotification(notification) {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// ===============================
// UTILIDADES
// ===============================

function isMetaMaskInstalled() {
    return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
}

function formatAddress(address) {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

function getNetworkName(chainId) {
    return NETWORKS[chainId]?.name || `Unknown Network (${chainId})`;
}

function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// ===============================
// GESTIÓN DE PRECIOS
// ===============================

async function getCryptoPrices() {
    try {
        const symbols = Object.values(PRICE_SYMBOLS).join(',');
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbols}&vs_currencies=usd`);
        const data = await response.json();
        
        cryptoPrices = {};
        Object.entries(PRICE_SYMBOLS).forEach(([symbol, id]) => {
            if (data[id] && data[id].usd) {
                cryptoPrices[symbol] = data[id].usd;
            }
        });
        
        updatePriceTicker();
        return cryptoPrices;
    } catch (error) {
        console.error('Error fetching crypto prices:', error);
        return {};
    }
}

function updatePriceTicker() {
    if (cryptoPrices['ETH']) {
        ethPrice.textContent = formatUSDPrice(cryptoPrices['ETH']);
        priceTicker.style.display = 'flex';
    }
}

function calculateUSDValue(balance, symbol) {
    const price = cryptoPrices[symbol];
    if (!price || isNaN(balance)) return null;
    return (parseFloat(balance) * price).toFixed(2);
}

function formatUSDPrice(usdValue) {
    if (usdValue === null || usdValue === undefined) return '$0.00';
    return `$${parseFloat(usdValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ===============================
// FUNCIONES DE RED
// ===============================



// ===============================
// FUNCIONES DE CAMBIO DE RED
// ===============================

async function switchToHolesky() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x4268' }],
        });
        showNotification('Switched to Holesky Test Network', 'success');
    } catch (switchError) {
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: '0x4268',
                        chainName: 'Holesky Test Network',
                        nativeCurrency: {
                            name: 'Ethereum',
                            symbol: 'ETH',
                            decimals: 18
                        },
                        rpcUrls: ['https://ethereum-holesky.publicnode.com'],
                        blockExplorerUrls: ['https://holesky.etherscan.io']
                    }]
                });
                showNotification('Holesky Test Network added and activated', 'success');
            } catch (addError) {
                showNotification('Error adding Holesky Test Network', 'error');
            }
        } else {
            showNotification('Error switching to Holesky Test Network', 'error');
        }
    }
}

async function switchToSepolia() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }],
        });
        showNotification('Switched to Sepolia Testnet', 'success');
    } catch (switchError) {
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: '0xaa36a7',
                        chainName: 'Sepolia Testnet',
                        nativeCurrency: {
                            name: 'Ethereum',
                            symbol: 'ETH',
                            decimals: 18
                        },
                        rpcUrls: ['https://ethereum-sepolia.publicnode.com'],
                        blockExplorerUrls: ['https://sepolia.etherscan.io']
                    }]
                });
                showNotification('Sepolia Testnet added and activated', 'success');
            } catch (addError) {
                showNotification('Error adding Sepolia Testnet', 'error');
            }
        } else {
            showNotification('Error switching to Sepolia Testnet', 'error');
        }
    }
}

// ===============================
// CONEXIÓN CON METAMASK
// ===============================

async function connectMetaMask() {
    if (!isMetaMaskInstalled()) {
        showNotification('MetaMask not installed. Install from https://metamask.io/', 'error');
        return;
    }

    try {
        statusText.textContent = 'Connecting to MetaMask...';
        statusProgress.style.width = '30%';

        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });

        statusProgress.style.width = '70%';

        if (accounts.length > 0) {
            await updateAccountInfo(accounts[0]);
            showNotification('Wallet connected successfully', 'success');
            
            // Verificar si está en Holesky
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (chainId !== '0x4268') {
                setTimeout(() => {
                    if (confirm('Switch to Holesky Test Network for better experience?')) {
                        switchToHolesky();
                    }
                }, 1000);
            }
        } else {
            throw new Error('No accounts found in MetaMask');
        }
    } catch (error) {
        console.error('Error connecting to MetaMask:', error);
        statusProgress.style.width = '0%';
        statusText.textContent = 'Connection failed';
        
        if (error.code === 4001) {
            showNotification('Connection rejected by user', 'warning');
        } else {
            showNotification(`Connection error: ${error.message}`, 'error');
        }
    }
}

async function updateAccountInfo(account) {
    try {
        currentAccount = account;
        
        // Mostrar dirección
        accountAddress.textContent = formatAddress(account);
        accountAddress.title = account;
        
        // Obtener información de red
        const chainId = await window.ethereum.request({
            method: 'eth_chainId'
        });
        currentChainId = chainId;
        networkName.textContent = getNetworkName(chainId);
        
        // Actualizar estado visual
        statusText.textContent = 'Connected successfully';
        connectionIndicator.textContent = 'ONLINE';
        statusDot.classList.add('connected');
        statusProgress.style.width = '100%';
        
        // Cambiar a dashboard
        setTimeout(() => {
            connectionPanel.style.display = 'none';
            mainDashboard.style.display = 'grid';
        }, 1000);
        
        // Actualizar botones de red
        updateNetworkButtons();
        
        // Cargar datos
        await getCryptoPrices();
        await updateMainBalance();
        
        // Inicializar dropdown de redes
        populateNetworkDropdown();
        updateNetworkButtons();
        
    } catch (error) {
        console.error('Error updating account info:', error);
        showNotification('Error getting account information', 'error');
    }
}

function disconnectWallet() {
    currentAccount = null;
    currentChainId = null;
    selectedChainId = null;
    networkBalances = {};
    
    // Actualizar estado visual
    connectionIndicator.textContent = 'OFFLINE';
    statusDot.classList.remove('connected');
    priceTicker.style.display = 'none';
    
    // Volver al panel de conexión
    mainDashboard.style.display = 'none';
    connectionPanel.style.display = 'flex';
    
    // Resetear estado
    statusText.textContent = 'Ready to connect';
    statusProgress.style.width = '0%';
    
    showNotification('Wallet disconnected', 'info');
}

// ===============================
// GESTIÓN DE DROPDOWN DE REDES
// ===============================

function populateNetworkDropdown() {
    dropdownMenu.innerHTML = '';
    
    Object.entries(NETWORKS).forEach(([chainId, networkData]) => {
        const item = createDropdownItem(chainId, networkData, chainId === currentChainId);
        dropdownMenu.appendChild(item);
    });
}

function createDropdownItem(chainId, networkData, isCurrent = false) {
    const item = document.createElement('div');
    item.className = `dropdown-item ${isCurrent ? 'current' : ''}`;
    item.dataset.chainId = chainId;
    
    const statusText = isCurrent ? '<span class="network-item-status">CURRENT</span>' : '';
    
    item.innerHTML = `
        <div class="network-item-info">
            <div class="network-item-name">${networkData.name} ${statusText}</div>
            <div class="network-item-id">Chain ID: ${chainId}</div>
        </div>
    `;
    
    item.addEventListener('click', () => selectNetworkFromDropdown(chainId));
    
    return item;
}

function toggleDropdown() {
    const isOpen = dropdownMenu.classList.contains('show');
    
    if (isOpen) {
        dropdownMenu.classList.remove('show');
        dropdownBtn.classList.remove('active');
    } else {
        dropdownMenu.classList.add('show');
        dropdownBtn.classList.add('active');
    }
}

async function selectNetworkFromDropdown(chainId) {
    selectedChainId = chainId;
    const networkData = NETWORKS[chainId];
    
    selectedNetwork.textContent = networkData.name;
    
    dropdownMenu.classList.remove('show');
    dropdownBtn.classList.remove('active');
    
    // Actualizar elementos current en dropdown
    dropdownMenu.querySelectorAll('.dropdown-item').forEach(item => {
        item.classList.remove('current');
        if (item.dataset.chainId === chainId) {
            item.classList.add('current');
        }
    });
    
    // Mostrar saldo de la red seleccionada
    await displaySelectedNetworkBalance(chainId);
}

async function displaySelectedNetworkBalance(chainId) {
    if (!currentAccount) return;
    
    const networkData = NETWORKS[chainId];
    const balanceContainer = selectedNetworkBalance;
    
    try {
        balanceContainer.innerHTML = `
            <div class="balance-loading">
                <div class="loading-spinner"></div>
                <span>Loading ${networkData.name} balance...</span>
            </div>
        `;
        
        const balanceData = await getBalanceForNetwork(currentAccount, chainId);
        
        if (balanceData.error) {
            balanceContainer.innerHTML = `
                <div class="balance-error">
                    <div class="error-icon">⚠️</div>
                    <div class="error-text">
                        <div class="network-name">${networkData.name}</div>
                        <div class="error-message">Error: ${balanceData.error}</div>
                    </div>
                </div>
            `;
        } else {
            const isCurrent = chainId === currentChainId;
            const usdDisplay = balanceData.usdValue 
                ? `<div class="balance-usd-value">$${formatUSDPrice(balanceData.usdValue)} USD</div>`
                : `<div class="balance-usd-error">Price unavailable</div>`;
            
            balanceContainer.innerHTML = `
                <div class="balance-display ${isCurrent ? 'current-network' : ''}">
                    <div class="balance-header">
                        <div class="network-name">${networkData.name}</div>
                        ${isCurrent ? '<div class="current-badge">ACTIVE</div>' : ''}
                    </div>
                    <div class="balance-amount">
                        ${balanceData.balance} <span class="balance-symbol">${balanceData.symbol}</span>
                    </div>
                    ${usdDisplay}
                    <div class="balance-info">Chain ID: ${chainId}</div>
                </div>
            `;
        }
    } catch (error) {
        balanceContainer.innerHTML = `
            <div class="balance-error">
                <div class="error-icon">⚠️</div>
                <div class="error-text">
                    <div class="network-name">${networkData.name}</div>
                    <div class="error-message">Connection error</div>
                </div>
            </div>
        `;
    }
}

async function getBalanceForNetwork(address, chainId) {
    try {
        const network = NETWORKS[chainId];
        if (!network) {
            throw new Error('Unsupported network');
        }

        let balanceInEth;

        // Si es la red actual, usar MetaMask directamente
        if (chainId === currentChainId) {
            const balance = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [address, 'latest']
            });
            balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);
        } else {
            // Para otras redes, hacer llamada RPC directa
            try {
                const response = await fetch(network.rpcUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        method: 'eth_getBalance',
                        params: [address, 'latest'],
                        id: 1
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const text = await response.text();
                let data;
                
                try {
                    data = JSON.parse(text);
                } catch (parseError) {
                    console.error('Error parsing JSON:', text);
                    throw new Error('Invalid JSON response from RPC');
                }
                
                if (data.error) {
                    throw new Error(data.error.message);
                }

                if (!data.result) {
                    throw new Error('No result in RPC response');
                }

                balanceInEth = parseInt(data.result, 16) / Math.pow(10, 18);
            } catch (rpcError) {
                console.error('RPC Error:', rpcError);
                throw new Error(`RPC call failed: ${rpcError.message}`);
            }
        }

        const balance = balanceInEth.toFixed(4);
        const usdValue = calculateUSDValue(balance, network.symbol);

        return {
            balance: balance,
            symbol: network.symbol,
            usdValue: usdValue,
            error: null
        };
    } catch (error) {
        console.error(`Error getting balance for ${chainId}:`, error);
        return {
            balance: '0.0000',
            symbol: NETWORKS[chainId]?.symbol || 'ETH',
            usdValue: null,
            error: error.message
        };
    }
}

function updateNetworkButtons() {
    const holeskyBtn = document.getElementById('switchToHolesky');
    const sepoliaBtn = document.getElementById('switchToSepolia');
    
    if (holeskyBtn && sepoliaBtn) {
        // Remover clase active
        holeskyBtn.classList.remove('active');
        sepoliaBtn.classList.remove('active');
        
        // Agregar clase active al botón de la red actual
        if (currentChainId === '0x4268') {
            holeskyBtn.classList.add('active');
        } else if (currentChainId === '0xaa36a7') {
            sepoliaBtn.classList.add('active');
        }
    }
}

// ===============================
// GESTIÓN DE SALDOS
// ===============================

async function updateMainBalance() {
    if (!currentAccount || !currentChainId) return;
    
    try {
        const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [currentAccount, 'latest']
        });
        
        const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);
        const formattedBalance = balanceInEth.toFixed(4);
        
        mainBalance.textContent = `${formattedBalance} ${NETWORKS[currentChainId]?.symbol || 'ETH'}`;
        
        // Calcular valor en USD
        const symbol = NETWORKS[currentChainId]?.symbol || 'ETH';
        const usdValue = calculateUSDValue(formattedBalance, symbol);
        if (usdValue) {
            mainBalanceUSD.textContent = `${formatUSDPrice(usdValue)} USD`;
        } else {
            mainBalanceUSD.textContent = 'Price unavailable';
        }
        
    } catch (error) {
        console.error('Error updating main balance:', error);
        mainBalance.textContent = '0.0000 ETH';
        mainBalanceUSD.textContent = '$0.00 USD';
    }
}



// ===============================
// SISTEMA DE PESTAÑAS
// ===============================

function initializeOperationTabs() {
    const tabButtons = document.querySelectorAll('.op-nav-btn');
    const tabContents = document.querySelectorAll('.op-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remover clase active
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Agregar clase active
            button.classList.add('active');
            document.getElementById(targetTab + 'Tab').classList.add('active');
        });
    });
}

// ===============================
// FUNCIONES DE TRANSACCIONES
// ===============================

async function sendEthTransaction() {
    const recipientAddress = document.getElementById('recipientAddress').value.trim();
    const sendAmount = document.getElementById('sendAmount').value.trim();
    const gasPrice = document.getElementById('gasPrice').value.trim();

    if (!recipientAddress || !sendAmount || parseFloat(sendAmount) <= 0) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
        showNotification('Invalid Ethereum address', 'error');
        return;
    }

    try {
        showTransactionStatus('Preparing transaction...', 'loading');

        const amountInWei = '0x' + (parseFloat(sendAmount) * Math.pow(10, 18)).toString(16);
        
        const transactionParams = {
            from: currentAccount,
            to: recipientAddress,
            value: amountInWei,
        };

        if (gasPrice) {
            transactionParams.gasPrice = '0x' + (parseFloat(gasPrice) * Math.pow(10, 9)).toString(16);
        }

        showTransactionStatus('Waiting for confirmation...', 'loading');

        const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [transactionParams],
        });

        showTransactionStatus(`Transaction sent! Hash: ${formatAddress(txHash)}`, 'success');
        
        addTransactionToHistory({
            hash: txHash,
            to: recipientAddress,
            value: sendAmount,
            status: 'pending',
            timestamp: Date.now(),
            type: 'send'
        });

        // Limpiar formulario
        document.getElementById('recipientAddress').value = '';
        document.getElementById('sendAmount').value = '';
        document.getElementById('gasPrice').value = '';

        // Actualizar balance
        setTimeout(() => {
            updateMainBalance();
        }, 2000);

    } catch (error) {
        console.error('Error sending transaction:', error);
        
        if (error.code === 4001) {
            showTransactionStatus('Transaction rejected by user', 'error');
        } else if (error.code === -32603) {
            showTransactionStatus('Insufficient funds', 'error');
        } else {
            showTransactionStatus(`Transaction failed: ${error.message}`, 'error');
        }
    }
}

async function estimateGasPrice() {
    try {
        const gasPrice = await window.ethereum.request({
            method: 'eth_gasPrice',
        });
        
        const gasPriceInGwei = parseInt(gasPrice, 16) / Math.pow(10, 9);
        document.getElementById('gasPrice').value = Math.ceil(gasPriceInGwei);
        
        showNotification(`Gas price estimated: ${Math.ceil(gasPriceInGwei)} Gwei`, 'success');
    } catch (error) {
        console.error('Error estimating gas price:', error);
        showNotification('Error estimating gas price', 'error');
    }
}

function showTransactionStatus(message, type) {
    const statusDiv = document.getElementById('transactionStatus');
    statusDiv.className = `operation-status ${type}`;
    statusDiv.innerHTML = type === 'loading' ? 
        `<div style="display: flex; align-items: center; gap: 8px;"><div class="loading-spinner"></div>${message}</div>` : 
        message;
}

// ===============================
// FUNCIONES DE SMART CONTRACTS
// ===============================

async function callContract() {
    const contractAddress = document.getElementById('contractAddress').value.trim();
    const functionName = document.getElementById('functionName').value.trim();

    if (!contractAddress || !functionName) {
        showNotification('Please enter contract address and function name', 'error');
        return;
    }

    try {
        showContractResult('Calling contract function...', 'loading');

        // Simulación básica de llamada de contrato
        const data = '0x' + functionName.substring(0, 8).padEnd(8, '0');
        
        const result = await window.ethereum.request({
            method: 'eth_call',
            params: [{
                to: contractAddress,
                data: data
            }, 'latest']
        });

        showContractResult(`Result: ${result}`, 'success');

    } catch (error) {
        console.error('Error calling contract:', error);
        showContractResult(`Error: ${error.message}`, 'error');
    }
}

async function sendContractTransaction() {
    const contractAddress = document.getElementById('contractAddress').value.trim();
    const functionName = document.getElementById('functionName').value.trim();
    const contractValue = document.getElementById('contractValue').value.trim();

    if (!contractAddress || !functionName) {
        showNotification('Please enter contract address and function name', 'error');
        return;
    }

    try {
        showContractResult('Preparing contract transaction...', 'loading');

        const data = '0x' + functionName.substring(0, 8).padEnd(8, '0');
        
        const transactionParams = {
            from: currentAccount,
            to: contractAddress,
            data: data
        };

        if (contractValue && parseFloat(contractValue) > 0) {
            transactionParams.value = '0x' + (parseFloat(contractValue) * Math.pow(10, 18)).toString(16);
        }

        const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [transactionParams],
        });

        showContractResult(`Transaction sent! Hash: ${formatAddress(txHash)}`, 'success');
        
        addTransactionToHistory({
            hash: txHash,
            to: contractAddress,
            value: contractValue || '0',
            status: 'pending',
            timestamp: Date.now(),
            type: 'contract',
            function: functionName
        });

    } catch (error) {
        console.error('Error sending contract transaction:', error);
        
        if (error.code === 4001) {
            showContractResult('Transaction rejected by user', 'error');
        } else {
            showContractResult(`Transaction failed: ${error.message}`, 'error');
        }
    }
}

function showContractResult(message, type) {
    const resultDiv = document.getElementById('contractResult');
    resultDiv.className = `operation-status ${type}`;
    resultDiv.innerHTML = type === 'loading' ? 
        `<div style="display: flex; align-items: center; gap: 8px;"><div class="loading-spinner"></div>${message}</div>` : 
        message;
}

// ===============================
// FUNCIONES DE FIRMA DE MENSAJES
// ===============================

async function signMessage() {
    const message = document.getElementById('messageToSign').value.trim();

    if (!message) {
        showNotification('Please enter a message to sign', 'error');
        return;
    }

    try {
        showSignatureResult('Waiting for signature...', 'loading');

        const signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [message, currentAccount],
        });

        const result = `
            <div style="margin-bottom: 12px;"><strong>Message:</strong><br>${message}</div>
            <div style="margin-bottom: 12px;"><strong>Signature:</strong><br><div style="word-break: break-all; font-family: monospace; font-size: 0.8rem;">${signature}</div></div>
            <div><strong>Signer:</strong><br>${currentAccount}</div>
        `;

        showSignatureResult(result, 'success');

        addTransactionToHistory({
            hash: signature.substring(0, 42) + '...',
            message: message,
            status: 'confirmed',
            timestamp: Date.now(),
            type: 'signature'
        });

    } catch (error) {
        console.error('Error signing message:', error);
        
        if (error.code === 4001) {
            showSignatureResult('Signature rejected by user', 'error');
        } else {
            showSignatureResult(`Signature failed: ${error.message}`, 'error');
        }
    }
}

function showSignatureResult(message, type) {
    const resultDiv = document.getElementById('signatureResult');
    resultDiv.className = `operation-status ${type}`;
    resultDiv.innerHTML = type === 'loading' ? 
        `<div style="display: flex; align-items: center; gap: 8px;"><div class="loading-spinner"></div>${message}</div>` : 
        message;
}

// ===============================
// GESTIÓN DE HISTORIAL
// ===============================

function addTransactionToHistory(transaction) {
    transactionHistory.unshift(transaction);
    
    if (transactionHistory.length > 50) {
        transactionHistory = transactionHistory.slice(0, 50);
    }

    try {
        localStorage.setItem('cryptolink_tx_history', JSON.stringify(transactionHistory));
    } catch (error) {
        console.warn('Error saving transaction history:', error);
    }

    updateTransactionHistoryView();
}

function loadTransactionHistory() {
    try {
        const saved = localStorage.getItem('cryptolink_tx_history');
        if (saved) {
            transactionHistory = JSON.parse(saved);
            updateTransactionHistoryView();
        }
    } catch (error) {
        console.warn('Error loading transaction history:', error);
        transactionHistory = [];
    }
}

function updateTransactionHistoryView() {
    const historyContainer = document.getElementById('transactionHistory');
    
    if (transactionHistory.length === 0) {
        historyContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <p>No transactions yet</p>
                <small>Your transaction history will appear here</small>
            </div>
        `;
        return;
    }

    const historyHTML = transactionHistory.map(tx => createTransactionItem(tx)).join('');
    historyContainer.innerHTML = historyHTML;
}

function createTransactionItem(tx) {
    const date = new Date(tx.timestamp).toLocaleString();
    const typeIcon = {
        'send': '💸',
        'contract': '📋',
        'signature': '✍️'
    };

    return `
        <div class="transaction-item" style="padding: 16px; border-bottom: 1px solid rgba(0, 255, 255, 0.1); transition: all 0.3s ease;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-family: 'Space Mono', monospace; font-weight: 700; color: var(--primary-cyan); cursor: pointer;" onclick="openBlockExplorer('${tx.hash}')">
                    ${typeIcon[tx.type] || '📄'} ${formatAddress(tx.hash)}
                </span>
                <span style="font-size: 0.7rem; padding: 4px 8px; border-radius: 12px; text-transform: uppercase; background: rgba(57, 255, 20, 0.2); color: var(--primary-green);">
                    ${tx.status}
                </span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; font-size: 0.8rem; font-family: 'Space Mono', monospace;">
                <div><span style="color: var(--text-muted);">TYPE:</span> ${tx.type.toUpperCase()}</div>
                ${tx.to ? `<div><span style="color: var(--text-muted);">TO:</span> ${formatAddress(tx.to)}</div>` : ''}
                ${tx.value ? `<div><span style="color: var(--text-muted);">VALUE:</span> ${tx.value} ETH</div>` : ''}
                <div><span style="color: var(--text-muted);">DATE:</span> ${date}</div>
            </div>
        </div>
    `;
}

function openBlockExplorer(txHash) {
    const network = NETWORKS[currentChainId];
    if (network && network.blockExplorer) {
        const url = `${network.blockExplorer}/tx/${txHash}`;
        window.open(url, '_blank');
    } else {
        showNotification('Block explorer not available for this network', 'warning');
    }
}

function clearTransactionHistory() {
    if (confirm('Are you sure you want to clear all transaction history?')) {
        transactionHistory = [];
        localStorage.removeItem('cryptolink_tx_history');
        updateTransactionHistoryView();
        showNotification('Transaction history cleared', 'success');
    }
}

// ===============================
// UTILIDADES ADICIONALES
// ===============================

async function copyAddress() {
    if (currentAccount) {
        try {
            await navigator.clipboard.writeText(currentAccount);
            copyBtn.innerHTML = '<span class="copy-icon">✓</span>';
            showNotification('Address copied to clipboard', 'success');
            setTimeout(() => {
                copyBtn.innerHTML = '<span class="copy-icon">📋</span>';
            }, 2000);
        } catch (error) {
            console.error('Error copying address:', error);
            showNotification('Error copying address', 'error');
        }
    }
}

function createParticles() {
    const container = document.getElementById('particles');
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(0, 255, 255, 0.6);
            border-radius: 50%;
            animation: float ${8 + Math.random() * 12}s linear infinite;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 8}s;
        `;
        container.appendChild(particle);
    }
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0% { transform: translateY(100vh) translateX(0) scale(0); opacity: 0; }
            10% { opacity: 1; transform: scale(1); }
            90% { opacity: 1; }
            100% { transform: translateY(-100vh) translateX(${Math.random() * 200 - 100}px) scale(0); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// ===============================
// EVENT LISTENERS Y INICIALIZACIÓN
// ===============================

function setupEventListeners() {
    if (!isMetaMaskInstalled()) return;

    window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length > 0) {
            await updateAccountInfo(accounts[0]);
            showNotification('Account changed', 'info');
        } else {
            disconnectWallet();
        }
    });

    window.ethereum.on('chainChanged', async (chainId) => {
        if (currentAccount) {
            currentChainId = chainId;
            networkName.textContent = getNetworkName(chainId);
            await updateMainBalance();
            
            // Actualizar dropdown y botones
            populateNetworkDropdown();
            updateNetworkButtons();
            
            // Si hay una red seleccionada, actualizar su balance
            if (selectedChainId) {
                await displaySelectedNetworkBalance(selectedChainId);
            }
            
            showNotification(`Network changed to ${getNetworkName(chainId)}`, 'info');
        }
    });

    window.ethereum.on('disconnect', () => {
        disconnectWallet();
    });
}

async function checkExistingConnection() {
    if (!isMetaMaskInstalled()) return;

    try {
        const accounts = await window.ethereum.request({
            method: 'eth_accounts'
        });

        if (accounts.length > 0) {
            await updateAccountInfo(accounts[0]);
        }
    } catch (error) {
        console.error('Error checking existing connection:', error);
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    createParticles();
    initializeOperationTabs();
    loadTransactionHistory();
    
    if (!isMetaMaskInstalled()) {
        statusText.textContent = 'MetaMask not detected';
        connectionIndicator.textContent = 'ERROR';
        connectBtn.innerHTML = `
            <span class="btn-icon">⚠️</span>
            <span class="btn-text">Install MetaMask</span>
            <div class="btn-glow"></div>
        `;
        connectBtn.addEventListener('click', () => {
            window.open('https://metamask.io/', '_blank');
        });
        return;
    }

    setupEventListeners();
    
    // Event listeners principales
    connectBtn.addEventListener('click', connectMetaMask);
    disconnectBtn.addEventListener('click', disconnectWallet);
    copyBtn.addEventListener('click', copyAddress);
    refreshBalances.addEventListener('click', updateMainBalance);

    // Event listeners de red
    document.getElementById('switchToHolesky').addEventListener('click', switchToHolesky);
    document.getElementById('switchToSepolia').addEventListener('click', switchToSepolia);

    // Event listeners de red
    document.getElementById('switchToHolesky').addEventListener('click', switchToHolesky);
    document.getElementById('switchToSepolia').addEventListener('click', switchToSepolia);
    
    // Event listeners para dropdown
    dropdownBtn.addEventListener('click', toggleDropdown);

    // Cerrar dropdown al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove('show');
            dropdownBtn.classList.remove('active');
        }
    });

    // Cerrar dropdown con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && dropdownMenu.classList.contains('show')) {
            dropdownMenu.classList.remove('show');
            dropdownBtn.classList.remove('active');
        }
    });

    // Event listeners de operaciones
    document.getElementById('sendTransaction').addEventListener('click', sendEthTransaction);
    document.getElementById('estimateGas').addEventListener('click', estimateGasPrice);
    document.getElementById('callContract').addEventListener('click', callContract);
    document.getElementById('sendContract').addEventListener('click', sendContractTransaction);
    document.getElementById('signMessage').addEventListener('click', signMessage);
    document.getElementById('refreshHistory').addEventListener('click', () => {
        updateTransactionHistoryView();
        showNotification('History refreshed', 'success');
    });
    document.getElementById('clearHistory').addEventListener('click', clearTransactionHistory);
    
    await checkExistingConnection();
});

// Funciones globales para debugging
window.cryptoLinkImproved = {
    getCurrentAccount: () => currentAccount,
    getTransactionHistory: () => transactionHistory,
    reconnect: connectMetaMask,
    disconnect: disconnectWallet,
    showNotification: showNotification
};