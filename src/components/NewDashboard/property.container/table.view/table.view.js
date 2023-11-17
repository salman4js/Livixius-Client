import React from 'react';
import _ from 'lodash';
import TableViewTemplateHelpers from './table.view.template';
import { filterKeysInObj, arrangeObj } from '../../../common.functions/node.convertor';
import  tableViewConstants  from './table.view.constants';
import MetadataTable from '../../../metadata.table.view/metadata.table.view';
import MetadataFields from '../../../fields/metadata.fields.view';

class TableView extends React.Component {
  
  constructor(props){
    super(props);
    this.widgetTileModel = {
      data: props.data,
      userCollection: props.userCollection,
      height: props.height,
      propertyDetails: props.propertyDetails
    };
    this.templateHelpersData = {};
    this.panelFieldState = [
      {
        value: 'selectedValues',
        attribute: "dataListField",
        customPanelField: true,
        renderCustomPanelField: this.renderLeftSideController.bind(this),
        height: 27,
        width: '200px',
        selectedValue: 'selectedValues',
        style: {
          width: "200",
          color: "black",
          fontSize: "15px",
          paddingRight: "10px",
          paddingLeft: "10px",
          paddingTop: "10px",
          paddingBottom: "10px",
          cursor: "pointer",
        }
      }
    ];
    this.state = {
      metadataTableState: {
        cellValues: undefined,
        headerValue: undefined,
        infoMessage: tableViewConstants.tableInfoMessage.ZERO_STATE_MESSAGE,
        tableLoader: false,
        selectedRoomId: undefined,
        isCheckboxSelected: false,
        enableCheckbox: false,
        tableCellWidth : "590px",
        showPanelField: false,
      },
      customModal: {
        show: false,
        onHide: this.onCloseCustomModal.bind(this),
        header: undefined,
        centered: true,
        restrictBody: true,
        showBodyItemView: undefined,
        modalSize: "medium",
        footerEnabled: false,
        footerButtons: undefined
      }
    };
    this.propertyStatusTableHeader = tableViewConstants.PropertyStatusTableHeader;
    this.propertyStatusRequiredKey = tableViewConstants.PropertyStatusRequiredKey;
    this.tableViewTemplate = new TableViewTemplateHelpers();
  };
  
  templateHelpers(){
    this.setupEvents();
    this.prepareTemplateHelpersData();
    this.prepareTableData(); // When the table data is ready, Call the metadata table view!
    return this.tableViewTemplate.tableViewTemplateHelper(this.state.metadataTableState, this.widgetTileModel);
  };
  
  // Render custom modal!
  _renderCustomModal(){
    return this.tableViewTemplate._renderCustomModal(this.state.customModal);
  };
  
  // Set up events for any actions!
  setupEvents(){
    this.templateHelpersData.onBack = this.onBackClick.bind(this);
  };
  
  // Handle back action triggered on left side controller!
  onBackClick(){
    this.props.dashboardController({reloadSidepanel: {silent: true}, navigateToPropertyContainer:true});
  };
  
  // Organize and prepare the required table data!
  prepareTableData(){
    if(this.widgetTileModel.data !== undefined){
      this.getWidgetTileTableCollectionData(); // Get the widget tile collection data for the table cell values!
    };
  };
  
  // Update metadata table state!
  _updateMetadataTableState(){
    this.setState({metadataTableState: this.state.metadataTableState});
  };
  
  _toggleTableLoader(value){
    this.state.metadataTableState.tableLoader = value;
    this._updateMetadataTableState();
  };
  
  // Template helpers data!
  prepareTemplateHelpersData(){
    this.templateHelpersData.selectedRoomConstant = this.widgetTileModel.data.selectedRoomConstant;
  };
  
  // Get room constant collection!
  async getRoomConstantCollection(){
    if(this.roomConstant !== 'afterCheckin'){
      return this.widgetTileModel.data.widgetTileModel?.[this.widgetTileModel.data.selectedRoomConstant] || await this.setExpandedTableView();
    } else {
      return this.widgetTileModel.propertyDetails.userCollection;
    }
  };
  
  // Get the widget tile model data for the table!
  async getWidgetTileTableCollectionData(){
    this.filterEnabled = false;
    var convertedCollection = [],
      rawRoomModel = await this.getRoomConstantCollection();
    this.getTableHeaders(); // Get the table headers!
    if(rawRoomModel){
      rawRoomModel.map((data) => {
        // Clone the data before filtering the keys as it would change the original data which would cause some trouble in the roomCollection!
        var clonedData = _.clone(data);
        var convertedModel = filterKeysInObj(clonedData, this.propertyStatusRequiredKey[this.roomConstant]);
        var arrangedObj = arrangeObj(convertedModel, this.propertyStatusRequiredKey[this.roomConstant]);
        convertedCollection.push(arrangedObj);
      });  
    };
    this.state.metadataTableState.cellValues = convertedCollection;
    this.filterEnabled && this._setFilterTableState();
  };
  
  // Get the table headers for the selected widget tile!
  getTableHeaders(){
    this.state.metadataTableState.headerValue = undefined; // Set the initial value
    if(this.widgetTileModel.data.userStatusMap !== undefined){
      this.roomConstant = _.findKey(this.widgetTileModel.data.userStatusMap, function(value) { // Using lodash function here to get the key by its value!
          return value === this.widgetTileModel.data.selectedRoomConstant;
      }.bind(this));
      this.state.metadataTableState.headerValue = this.propertyStatusTableHeader[this.roomConstant];
    } else {
      this.state.metadataTableState.headerValue = this.propertyStatusTableHeader[this.roomConstant];
    };
  };
  
  // Prepare custom modal state data!
  _prepareCustomModal(options){
    this.state.customModal.show = true;
    this.state.customModal.centered = options.centered !== undefined ? options.centered : true;
    this.state.customModal.onHide = options.onHide !== undefined ? options.onHide : this.state.customModal.onHide;
    this.state.customModal.restrictBody = (options.restrictBody === false) ? options.restrictBody : true; // By default, restrictBody is set to true.
    this.state.customModal.showBodyItemView = () => options.showBodyItemView && options.showBodyItemView();
    this.state.customModal.header = options.header;
    this.state.customModal.footerEnabled = options.footerEnabled;
    this.state.customModal.footerButtons = options.footerButtons;
    this._toggleCustomModal();
  };
  
  // trigger custom modal!
  _toggleCustomModal(){
    this.setState({customModal: this.state.customModal});
  };
  
  // On close custom modal dialog!
  onCloseCustomModal(){
    this.state.customModal.show = false;
    this.state.customModal.header = undefined;
    this.state.customModal.footerEnabled = false;
    this.state.customModal.footerButtons = undefined;
    this._toggleCustomModal();
  };
  
  // Left side controller and header!
  renderLeftSideController(){
    var leftSideController = new TableViewTemplateHelpers(this.templateHelpersData);
    return leftSideController.renderLeftSideController();
  };
  
  // On render function!
  render(){
    return(
      <>
        <MetadataFields data = {this.panelFieldState} />
        {this.templateHelpers()}
        {this.state.customModal?.show && this._renderCustomModal()}
      </>
    )
  };
};

export default TableView;