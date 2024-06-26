import lang from "../commands.constants";
import CommandsConnector from "../commands.connector";
import {downloadContent, prepareCSV} from "../../../common.functions/node.convertor";

class CommandsExportToExcel {
    constructor(signatureOptions) {
        this.status = signatureOptions;
        this.isDisabled = this.enabled();
        this.defaults = {
            value: lang.EXPORT_TO_EXCEL.exportToExcelLabel,
            disabled: !this.isDisabled,
            onClick: () => this.execute(),
            signature: 'Command-Export'
        };
        this.exportDialogFieldOptions = [{
            value: undefined,
            placeholder: lang.EXPORT_TO_EXCEL.dialogPlaceholder,
            name: 'excelFileName',
            attribute: 'textField',
            isRequired: true,
            inlineToast: {
                isShow: false,
                inlineMessage: 'File name must be valid'
            }
        }];
        this.exportFileName = undefined;
    };

    enabled(){
        return lang.isCommandsEnabled.exportToExcel.includes(this.status.roomConstantKey);
    };

    execute(){
      this.getColumnConfiguration();
      this._promptConfirmationDialog();
    };

    // Prompt confirmation dialog to get the name of the file to be downloaded.
    _promptConfirmationDialog(){
        this.getExportDialogOptions();
        this.status.eventHelpers.triggerCustomModel(this.dialogOptions);
    };

    // Get the export dialog options.
    getExportDialogOptions(){
        this.dialogOptions = {
                centered: true,
                restrictBody: false,
                renderCustomBodyView: true,
                customBodyViewOptions: this.exportDialogFieldOptions,
                header: lang.EXPORT_TO_EXCEL.exportToExcelLabel,
                modalSize: 'md',
                footerEnabled: true,
                footerButtons: [{
                    btnId: lang.EXPORT_TO_EXCEL.footerButtons.primaryBtn,
                    variant: 'secondary',
                    onClick: () => this.onExport()
                }]
        };
    };

    // On click on export, validate the filename and initiate the export process.
    onExport(){
        this.status.eventHelpers.triggerTableLoader(true, true);
        this.status.eventHelpers.validateStateFields().then((result) => {
            this.exportFileName = result.excelFileName + '.csv';
            this.initiateClientExport();
        });
    };

    _prepareCSVAndDownload(options){
        var csvData = prepareCSV({header: this.clientSideCSVHeader,
            rows: this.status.eventHelpers.refineTableCollection(options.rows),
            headerRefKeys: this.clientSideCSVHeaderRefKeys});
        var blob = new Blob([csvData], {type: 'text/csv'});
        downloadContent({content: blob, fileName: this.exportFileName});
    };

    // Initiate the export to excel process on client side
    initiateClientExport(){
        this._prepareClientSideExportCSVHeader();
        if(!this.status.eventHelpers._isFetchableWidget()){
            // If it's a fetchable widget and status.nodes.length is zero which mean that the command was executed from table header.
            // If the status.node.length is zero, Get the all the table collection and proceed with export.
            // else do the export part only the selected nodes.
            this._prepareCSVAndDownload({rows: this.status.eventHelpers.getTableCollection(this.status.nodes.length === 0 ? {} : {nodes: this.status.nodes})});
        } else {
            var options = {
                accId: this.status.params.accIdAndName[0],
                selectedNodes: this.status.nodes // When this commands executed from table header, there would be no selection of nodes.
            }
            // As of now, there is only one fetchable widget, Abstract this part of the code when there are multiple fetchable widget.
            // To initiate the export to excel data on client side, We need to fetch the history nodes data from the server.
            CommandsConnector.fetchSelectedHistoryNode(options).then((result) => {
                if(result.data.success){
                    this._prepareCSVAndDownload({rows: result.data.message});
                }
            });
        }
        this._resetTable();
    };

    _resetTable(){
        this.status.eventHelpers.collapseCustomModal();
        this.status.eventHelpers.updateCheckboxSelection(false);
        this.status.eventHelpers.triggerTableLoader(false);
    };

    _prepareClientSideExportCSVHeader(){
      this.clientSideCSVHeader = []; this.clientSideCSVHeaderRefKeys = [];
      this.configuredColumns.map((col) => {
          this.clientSideCSVHeader.push(col.title);
          this.clientSideCSVHeaderRefKeys.push(col.id);
      });
    };

    // Get the configured customization.
    // TODO: Change this to backend dependency.
    getColumnConfiguration(){
      this.configuredColumns = lang.configuredTableHeaderAndKey[this.status.roomConstantKey];
    };

}

export default  CommandsExportToExcel;