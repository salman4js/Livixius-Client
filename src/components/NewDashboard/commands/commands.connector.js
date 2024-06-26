import { moveToNextState } from "../../utils/room.status.utils";
import {getParsedUrl} from "../../common.functions/node.convertor";
import lang from "./commands.constants";
import connector from "../../utils/connector";
const Variables = require('../../Variables');

class CommandsConnector {
    // All those methods here would be static methods.

    // Export to excel connector.
    static async onExportToExcel(options){
        return await connector.post(`${Variables.Variables.hostId}/${options.lodgeId}/exporttocsv`, options);
    };

    // Fetch selected history node data.
    static async fetchSelectedHistoryNode(options){
      // selectedNodes takes array of selected nodes ids.
      return await connector.get(`${Variables.Variables.hostId}/${options.accId}/${options.roomId}/${JSON.stringify(options.selectedNodes)}/historynode`)
    };

    static async _getCustomHTMLContent(options){
        var filePath = options.filepath !== undefined ? options.filepath : 'DynamicHTMLContent';
        return fetch(`${Variables.Variables.hostId}/${options.accId}/${filePath}/${options.filename}`)
            .then(response => {
                if (!response.ok) {
                    // Check for HTTP errors (status code outside the range 200-299)
                    return false;
                }
                return response.text();
            });
    };

    static async _getCustomHTMLContentFromDB(options){
      return await connector.get(`${Variables.Variables.hostId}/${options.accId}/${options.templateName}/getcustomtemplate`);
    };

    static async moveToNextState(options){
      return await moveToNextState(options);
    };

    static async fetchCustomHTMLConfiguredTemplate(options){
        if(getParsedUrl().hostname !== lang.LOCAL_SERVER){
            return CommandsConnector._getCustomHTMLContentFromDB(options).then((result) => {
                return result.data.data[0].customTemplate;
            }).catch(() => {
                console.warn('Error occurred while fetching dynamic html content');
            })
        } else {
            return CommandsConnector._getCustomHTMLContent(options).then((result) => {
                return result;
            }).catch(() => {
                console.warn('Error occurred while fetching dynamic html content')
            })
        }
    };
};

export default CommandsConnector;