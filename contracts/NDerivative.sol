//SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./core/NPassCore.sol";
import "./interfaces/IN.sol";

/**
 * @title NDerivative
 * @author Inspired by @KnavETH
 */
contract NDerivative is NPassCore {
    using Strings for uint256;

    constructor(address _nContractAddress) NPassCore("NDerivative", "ND", IN(_nContractAddress), false, 100, 0, 0, 0) {}

    string constant SVG_FRAGMENT_1 =
        '<svg width="500" height="500" xmlns="http://www.w3.org/2000/svg"><g><text transform="matrix(26.3381 0 0 18.9334 -5262 -3434.04)" stroke="#000" xml-space="preserve" text-anchor="start" font-family="Noto Sans JP" font-size="24" y="202.72185" x="203.6762" strokeWidth="0" fill="';
    string constant SVG_FRAGMENT_2 = '">';
    string constant SVG_FRAGMENT_3 = "</text></g></svg>";

    function getTierInformation(uint256 tokenId) public view virtual returns (uint256, string memory) {
        string memory color;

        uint256 total = n.getFirst(tokenId) + n.getSecond(tokenId);
        total = total + n.getThird(tokenId);
        total = total + n.getFourth(tokenId);
        total = total + n.getFifth(tokenId);
        total = total + n.getSixth(tokenId);
        total = total + n.getSeventh(tokenId);
        total = total + n.getEight(tokenId);

        if (total >= 40 && total <= 50) {
            color = "#9E9E9E";
        } else if (total >= 35 && total <= 55) {
            color = "#BDBDBD";
        } else if (total >= 29 && total <= 61) {
            color = "#EEEEEE";
        } else if (total >= 24 && total <= 66) {
            color = "#FAFAFA";
        } else {
            color = "#F5F5F5";
        }

        return (total / 10, color);
    }

    function tokenSVG(uint256 tokenId) public view virtual returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        (uint256 total, string memory color) = getTierInformation(tokenId);

        string[14] memory parts;
        parts[0] = SVG_FRAGMENT_1;
        parts[1] = color;
        parts[2] = SVG_FRAGMENT_2;
        parts[3] = total.toString();
        parts[4] = SVG_FRAGMENT_3;

        string memory output = string(abi.encodePacked(parts[0], parts[1], parts[2], parts[3], parts[4]));
        return output;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory output = tokenSVG(tokenId);
        (uint256 total, ) = getTierInformation(tokenId);

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "n-pass #',
                        toString(tokenId),
                        '", "description": "n-pass is just code.", "image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(output)),
                        '", "attributes": [{"trait_type": "number", "value": "',
                        total.toString(),
                        '"}]}'
                    )
                )
            )
        );
        output = string(abi.encodePacked("data:application/json;base64,", json));

        return output;
    }

    function toString(uint256 value) internal pure returns (string memory) {
        // Inspired by OraclizeAPI's implementation - MIT license
        // https://github.com/oraclize/ethereum-api/blob/b42146b063c7d6ee1358846c198246239e9360e8/oraclizeAPI_0.4.25.sol

        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}

/// [MIT License]
/// @title Base64
/// @notice Provides a function for encoding some bytes in base64
/// @author Brecht Devos <brecht@loopring.org>
library Base64 {
    bytes internal constant TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    /// @notice Encodes some bytes to the base64 representation
    function encode(bytes memory data) internal pure returns (string memory) {
        uint256 len = data.length;
        if (len == 0) return "";

        // multiply by 4/3 rounded up
        uint256 encodedLen = 4 * ((len + 2) / 3);

        // Add some extra buffer at the end
        bytes memory result = new bytes(encodedLen + 32);

        bytes memory table = TABLE;

        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)

            for {
                let i := 0
            } lt(i, len) {

            } {
                i := add(i, 3)
                let input := and(mload(add(data, i)), 0xffffff)

                let out := mload(add(tablePtr, and(shr(18, input), 0x3F)))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(12, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(6, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(input, 0x3F))), 0xFF))
                out := shl(224, out)

                mstore(resultPtr, out)

                resultPtr := add(resultPtr, 4)
            }

            switch mod(len, 3)
            case 1 {
                mstore(sub(resultPtr, 2), shl(240, 0x3d3d))
            }
            case 2 {
                mstore(sub(resultPtr, 1), shl(248, 0x3d))
            }

            mstore(result, encodedLen)
        }

        return string(result);
    }
}
