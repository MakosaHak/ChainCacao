// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title TraceabilityRegistry
 * @dev Simple contract to store lot IDs and their associated data hashes for immutable traceability.
 */
contract TraceabilityRegistry {
    struct LotRecord {
        string lotID;
        string dataHash;
        uint256 timestamp;
        address registeredBy;
    }

    // Mapping from lotID to its record
    mapping(string => LotRecord) public records;
    
    // Event emitted when a new lot is registered
    event LotRegistered(string indexed lotID, string dataHash, address indexed registeredBy);

    /**
     * @dev Registers a new lot with its hash.
     * @param _lotID The unique identifier for the lot (e.g., #TG-26-XXXX).
     * @param _dataHash The hash of the critical data (ID_Lot, GPS, Poids).
     */
    function registerLot(string memory _lotID, string memory _dataHash) public {
        // Ensure the lot hasn't been registered yet to maintain immutability of the first entry
        // Alternatively, we could allow updates if the business logic requires it, 
        // but for EUDR compliance, the first anchor is critical.
        require(bytes(records[_lotID].lotID).length == 0, "Lot already registered");

        records[_lotID] = LotRecord({
            lotID: _lotID,
            dataHash: _dataHash,
            timestamp: block.timestamp,
            registeredBy: msg.sender
        });

        emit LotRegistered(_lotID, _dataHash, msg.sender);
    }

    /**
     * @dev Retrieves the record for a given lotID.
     * @param _lotID The unique identifier for the lot.
     */
    function getLotRecord(string memory _lotID) public view returns (string memory, string memory, uint256, address) {
        LotRecord memory record = records[_lotID];
        require(bytes(record.lotID).length > 0, "Lot not found");
        return (record.lotID, record.dataHash, record.timestamp, record.registeredBy);
    }
}
