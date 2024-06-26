import CollectionInstance from "../../global.collection/widgettile.collection/widgettile.collection";
import connector from "../utils/connector";;
const Variables = require('../Variables');

// Get available room types!
export async function getAvailableRoomTypes(lodgeId){
  const result = await connector.post(`${Variables.Variables.hostId}/${lodgeId}/allroomtype`);
  if(result.data.success){
    CollectionInstance.setCollections('roomTypes', result.data.message);
  };
  return result;
};

// Get the userModel!
export async function getUserModel(params){
  const result = await connector.get(`${Variables.Variables.hostId}/${params.lodgeId}/allusers`);
  // Whenever we fetch user model from the server, add it in the global collections!
  if(result.data.success){
    CollectionInstance.setCollections('userCollections', result.data.message)
  };
  return result;
};
export default class sidepanelContainerUtils {
}