# requestNewUser
peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.regnet.user:requestNewUser","Ashlesh", "sorteeashlesh@gmail.com", "9994293900", "12345"]}'

# approveNewUser
peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.regnet.registrar:approveNewUser","Ashlesh", "12345"]}'

# rechargeAccount
peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.regnet.user:rechargeAccount","Ashlesh", "12345", "txn100"]}'

# viewUser
peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.regnet.user:viewUser","Ashlesh", "12345"]}'

# propertyRegistrationRequest
peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.regnet.user:propertyRegistrationRequest","Ashlesh", "12345", "001", "100"]}'

# viewPropertyReq
peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.regnet.registrar:viewPropertyRequest","Ashlesh", "12345", "001"]}'

# approvePropertyRegistration
 peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.regnet.registrar:approvePropertyRegistration","001"]}'

 # viewProperty
 peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.regnet.registrar:viewProperty","Ashlesh","12345","001"]}'

 # updatePropertyStatus
 peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.regnet.user:updatePropertyStatus","Ashlesh","12345","001","onSale"]}'

# purchaseProperty
peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.regnet.user:purchaseProperty","001","Harshit","123456"]}'
