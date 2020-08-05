#!/bin/bash

echo
echo " ____    _____      _      ____    _____ "
echo "/ ___|  |_   _|    / \    |  _ \  |_   _|"
echo "\___ \    | |     / _ \   | |_) |   | |  "
echo " ___) |   | |    / ___ \  |  _ <    | |  "
echo "|____/    |_|   /_/   \_\ |_| \_\   |_|  "
echo
echo "Deploying Chaincode REGNET On Certification Network"
echo
CHANNEL_NAME="$1"
DELAY="$2"
LANGUAGE="$3"
VERSION="$4"
TYPE="$5"
: ${CHANNEL_NAME:="registrationchannel"}
: ${DELAY:="5"}
: ${LANGUAGE:="node"}
: ${VERSION:=1.1}
: ${TYPE="basic"}

LANGUAGE=`echo "$LANGUAGE" | tr [:upper:] [:lower:]`
ORGS="registrar users upgrad"
TIMEOUT=15

if [ "$TYPE" = "basic" ]; then
  CC_SRC_PATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode/"
else
  CC_SRC_PATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode-advanced/"
fi

echo "Channel name : "$CHANNEL_NAME

# import utils
. scripts/utils.sh

## Install new version of chaincode on peer0 of all 3 orgs making them endorsers
echo "Installing chaincode on peer0.registrar.property-registration-network.com.com ..."
installChaincode 0 'registrar' $VERSION
echo "Installing chaincode on peer1.registrar.property-registration-network.com.com ..."
installChaincode 1 'registrar' $VERSION
echo "Installing chaincode on peer0.users.property-registration-network.com.com ..."
installChaincode 0 'users' $VERSION

# Instantiate chaincode on the channel using peer0.registrar
echo "Instantiating chaincode on channel using peer0.registrar.property-registration-network.com.com ..."
instantiateChaincode 0 'registrar' $VERSION
echo "Instantiating chaincode on channel using peer0.user.property-registration-network.com.com ..."
instantiateChaincode 0 'user' $VERSION

echo
echo "========= All GOOD, Chaincode REGNET Is Now Installed & Instantiated On Registration Network =========== "
echo

echo
echo " _____   _   _   ____   "
echo "| ____| | \ | | |  _ \  "
echo "|  _|   |  \| | | | | | "
echo "| |___  | |\  | | |_| | "
echo "|_____| |_| \_| |____/  "
echo

exit 0
