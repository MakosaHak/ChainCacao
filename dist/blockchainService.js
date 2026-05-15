/**
 * Service pour l'interaction avec la Blockchain Polygon (Amoy Testnet)
 * Nécessite ethers.js chargé globalement
 */
class BlockchainService {
    constructor() {
        this.contractAddress = "0xc663Ebb25C0924302Bf060238Ca4c5767628b8E7";
        this.contractABI = [
            {
                "anonymous": false,
                "inputs": [
                    { "indexed": true, "internalType": "string", "name": "lotID", "type": "string" },
                    { "indexed": false, "internalType": "string", "name": "dataHash", "type": "string" },
                    { "indexed": true, "internalType": "address", "name": "registeredBy", "type": "address" }
                ],
                "name": "LotRegistered",
                "type": "event"
            },
            {
                "inputs": [
                    { "internalType": "string", "name": "_lotID", "type": "string" }
                ],
                "name": "getLotRecord",
                "outputs": [
                    { "internalType": "string", "name": "", "type": "string" },
                    { "internalType": "string", "name": "", "type": "string" },
                    { "internalType": "uint256", "name": "", "type": "uint256" },
                    { "internalType": "address", "name": "", "type": "address" }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    { "internalType": "string", "name": "_lotID", "type": "string" },
                    { "internalType": "string", "name": "_dataHash", "type": "string" }
                ],
                "name": "registerLot",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ];
        this.rpcUrl = "https://rpc-amoy.polygon.technology";
    }

    /**
     * Initialise la connexion avec MetaMask
     */
    async connect() {
        if (!window.ethereum) throw new Error("MetaMask non installé");
        // ethers est supposé être disponible globalement
        this.provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await this.provider.getSigner();
        this.contract = new ethers.Contract(this.contractAddress, this.contractABI, signer);
        return await signer.getAddress();
    }

    /**
     * Génère un hash des données critiques
     */
    generateLotHash(lotID, gpsLat, gpsLong, poids) {
        const dataString = `${lotID}-${gpsLat}-${gpsLong}-${poids}`;
        return ethers.id(dataString);
    }

    /**
     * Enregistre le hash sur Polygon
     */
    async registerLotOnChain(lotID, dataHash) {
        if (!this.contract) await this.connect();
        const tx = await this.contract.registerLot(lotID, dataHash);
        const receipt = await tx.wait();
        return receipt.hash;
    }
}

// Rendre disponible globalement
window.BlockchainService = BlockchainService;
