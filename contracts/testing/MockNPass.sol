// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "../core/NPassCore.sol";
import "../interfaces/IN.sol";

contract MockNPass is NPassCore {
    constructor(
        string memory name,
        string memory symbol,
        IN n,
        bool onlyNHolders
    ) NPassCore(name, symbol, n, onlyNHolders) {}
}
