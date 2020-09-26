# Fabric Property Network

> **Note** - The development was done on macOS. So, all the bin files for fabric network is for macOS. These bin files need to be replaced in case if the network is tested on other OS.

#### Network Bootstrap -
1. Download the project folder.
2. cd to /network path
    ```sh
    $ cd network
    ```
3. Tear down running network and containers for safer side
    ```sh
    $ sh ./fabricNetwork.sh down
    ```
4. Bootstrap the network
    ```sh
    $ sh ./fabricNetwork.sh up
    ```
5. Open 2 new tabs in terminal and bash into 2 chaincode container. For making development and testing seamless, 2 chaincode containers are configured one for registrar org and other for user org. 
    ```sh
    $ docker exec -it registrar.chaincode /bin/bash
    $ docker exec -it user.chaincode /bin/bash
    ```
6. Start the nodejs service in the respective chaincode container.
    a) In registrar chaincode tab -
    ```sh
    $ npm install
    $ npm run start-dev-registrar
    ```
    b) In user chaincode tab -
    ```sh
    $ npm install
    $ npm run start-dev-user
    ```
7. Install and intantiate the chaincode from the /network directory
    ```sh
    $ sh ./fabricNetwork.sh install
    ```
8. Network set up completed.


#### Property Registration test flow -

> Note - Two cli will be used, one for registrar and other for user to support initiator validation. Registrar cli will connect to peer0 of registrar and user cli will connect to peer0 of the user. That way the request will have the respective initiator MSP id. So, user can not invoke the registrar functionality and vice versa. 

1. Bash into registrar and user cli.
    a) Registrar tab -
    ```sh
    $ docker exec -it cli /bin/bash
    ```
    b) User tab -
     ```sh
    $ docker exec -it user.cli /bin/bash
    ```
2. Two users Ashlesh and Harshit requests for registration. 
    From user cli tab -
    ```sh
    $ peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.regnet.user:requestNewUser","Ashlesh", "sorteeashlesh@gmail.com", "9994293900", "12345"]}'
    
    $ peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.regnet.user:requestNewUser","Harshit", "harshit@gmail.com", "8894293900", "54321"]}'
    ```
3. Registrar accepts both the user’s registration request. 
    From registrar cli tab -
    ```sh
    $ peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.regnet.registrar:approveNewUser","Ashlesh", "12345"]}'
    
    $ peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.regnet.registrar:approveNewUser","Harshit", "54321"]}'
    ```
4. User Ashlesh raise the request for property registration. 
    From user cli tab -
    ```sh
    $ peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.regnet.user:propertyRegistrationRequest","Ashlesh", "12345", "001", "100"]}'
    ```
5. Registrar view and verify the property registration request by Ashlesh. 
    From registrar cli tab -
    ```sh
    $ peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.regnet.registrar:viewPropertyRequest","Ashlesh", "12345", "001"]}'
    ```
6. Registrar accepts property registration request by Ashlesh. 
    From registrar cli tab -
    ```sh
    $ peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.regnet.registrar:approvePropertyRegistration","001"]}'
    ```
7. Ashlesh lists his property for sale. 
    From user cli tab -
    ```sh
    $ peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.regnet.user:updatePropertyStatus","Ashlesh","12345","001","onSale"]}'
    ```
8. Harshit recharges his account with 500 propCoins. 
    From user cli tab -
    ```sh
    $ peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.regnet.user:rechargeAccount","Harshit", "54321", "txn500"]}'
    ```
9. Harshit wish to buy the property of Ashlesh and initiate the purchase. 
    From user cli tab -
    ```sh
    $ peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.regnet.user:purchaseProperty","001","Harshit","54321"]}'
    ```
10. Harshit view his purchase property. 
    From user cli tab-
    ```sh
    $ peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.regnet.user:viewProperty","Harshit","54321","001"]}'
    ```
11. Now there is no property under Ashlesh’s name. So, when Ashlesh tries to view the property, he gets the error. 
    From the user cli tab -
    ```sh
    $ peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.regnet.user:viewProperty","Ashlesh","12345","001"]}'
    ```
12. Ashlesh and Harshit both verify their propCoins after transaction. Ashlesh has 100 propCoins now and Harshit has 400 propCoins now. 
    From user cli tab -
    ```sh
    $ peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.regnet.user:viewUser","Ashlesh", "12345"]}'
    
    $ peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.regnet.user:viewUser","Harshit", "54321"]}'
    ```
    