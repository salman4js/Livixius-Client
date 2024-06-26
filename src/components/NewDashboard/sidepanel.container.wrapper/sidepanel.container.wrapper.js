import React, {useEffect, useState} from 'react';
import _ from "lodash";
import sidepanelConstants from "./sidepanel.container.constants";
import PropertyContainerConstants from "../property.container/property.container.constants";
import SidepanelContainerSearchView from "./sidepanel.container.search.view";
import SidepanelContainerVoucherTrackerView from "./sidepanel.container.voucher.tracker.view";
import SidepanelContainerInsightsSearchView
  from "./sidepanel.container.insights.search.view/sidepanel.container.insights.search.view";
import SidepanelContainerRoomsListView from "./sidepanel.container.roomslist.view";
import SidepanelContainerBusinessToolkit from "./sidepanel.container.business.toolkit/sidepanel.container.business.toolkit";
import SidepanelContainerReportGeneration from "./sidepanel.container.report.generation/sidepanel.container.report.generation";
import {getAvailableRoomTypes, getUserModel} from '../../utils/sidepanel.container.utils';
import {getRoomList} from "../../utils/user.preference.utils";
import {formatDate, getStatusCodeColor} from '../../common.functions/common.functions';
import {
  createMetadataFieldsWithBaseObj,
  filterKeysInObj,
  nodeConvertor,
  updateMetadataFields
} from '../../common.functions/node.convertor';
import {activityLoader} from '../../common.functions/common.functions.view';
import CustomModal from "../../fields/customModalField/custom.modal.view";
import MetadataTableView from '../../metadata.table.view/metadata.table.view';
import MetadataFields from '../../fields/metadata.fields.view';
import PanelView from '../../SidePanelView/panel.view';
import PanelItemView from '../../SidePanelView/panel.item/panel.item.view';
import CollectionView from '../../SidePanelView/collection.view/collection.view';
import MetadataFieldTemplateState from "../../fields/metadata.field.templatestate";
import CollectionInstance from "../../../global.collection/widgettile.collection/widgettile.collection";

const SidepanelWrapper = (props, ref) => {

  // Sidepanel state handler!
  const [sidepanel, setSidepanel] = useState({
    height: undefined,
    header: "Rooms List",
    isLoading: true,
    parentData: undefined,
    childData: undefined,
    selectedId: [],
    listFilter: undefined
  });

  // Sidepanel view state handler!
  const [sidepanelView, setSidepanelView] = useState({
    roomListTreePanel: true, // By default, roomListTreePanel is true!
    filterRoomPanel: false,
    voucherListPanel: false,
    insightsSearchForm: false,
    roomTypeListPanel: false,
    businessToolKit: false
  });

  // Filter input metadata fields!
  const [filterState, setFilterState] = useState([{
    value: undefined,
    width: '300px',
    label: 'Filter By Type',
    padding: '10px 5px 5px 5px',
    placeholder: "Filter by type",
    name: 'suiteType',
    attribute: 'listField',
    noneValue: "None",
    options: undefined,
    style: {
      color: "black",
      fontSize: "15px",
      paddingRight: "10px",
      paddingLeft: "10px",
      cursor: "pointer",
    },
    callBackAfterUpdate: _applyFilter
  }, {
    value: new Date(),
    label: 'Date of Checkout',
    placeholder: "Date of Checkout",
    name: 'checkOutDate',
    attribute: 'dateField',
    isRequired: true,
    style: {
      color: "black",
      fontSize: "15px",
      paddingRight: "10px",
      paddingLeft: "10px",
      cursor: "pointer",
    },
    callBackAfterUpdate: _applyFilter
  }]);

  // Custom modal state handler!
  const [customModal, setCustomModal] = useState({
    show: false,
    onHide: _toggleCustomModal,
    customData: undefined,
    header: 'Room details',
    centered: true,
    modalSize: 'medium'
  });

  // Update filter string from the sidepanel search view!
  function _updateFilterData(filterData){
    setSidepanel(prevState => ({...prevState, listFilter: filterData}))
  };

  // Is filter applied!
  function isFilterApplied(){
    return sidepanel.listFilter && sidepanel.listFilter.length > 0;
  };

  // Update sidepanel height!
  function updateSidePanelHeight(value){
    setSidepanel(prevState => ({...prevState, height: value}))
  };

  // toggle side panel loader!
  function _toggleLoader(value){
    setSidepanel(prevState => ({...prevState, isLoading: value}));
  };

  // Sidepanel child view!
  function sidepanelChildView(){
    if(sidepanel.isLoading){
      return activityLoader(getLoaderOpts());
    } else {
      return childViewMainContent();
    }
  };

  // Sidepanel child view main content!
  function childViewMainContent(){
    if(sidepanelView.roomListTreePanel){
      return roomListTreeView();
    }
    if(sidepanelView.filterRoomPanel){
      return filterPanelView();
    }
    if(sidepanelView.voucherListPanel){
      return voucherListPanelView();
    }
    if(sidepanelView.insightsSearchForm){
      return insightsSearchFormPanel();
    }
    if(sidepanelView.roomTypeListPanel){
      return roomTypeListPanel();
    }
    if(sidepanelView.businessToolKit){
      return businessToolKitView();
    }
    if(sidepanelView.customReport){
      return reportGenerationView();
    }
  };

  // Sidepanel filter state view!
  function filterPanelView(){
    return(
        <div className = 'sidepanel-filter-panel'>
          <MetadataFields data = {filterState} updateData = {setFilterState}/>
        </div>
    )
  };

  // Voucher list panel view.
  function voucherListPanelView(){
    var options = {roomTreeView: () => roomListTreeView(),
      dashboardController: (opts) => props.dashboardController(opts),
      params: props.params,
      height: sidepanel.height,
      lastSelectedVoucherId: props.selectedModelData.vouchersModelId
    };
    return <SidepanelContainerVoucherTrackerView options = {options} />
  };

  // Insights search form panel view!
  function insightsSearchFormPanel(){
    var options = {
      dashboardController: (opts) => props.dashboardController(opts),
      height: sidepanel.height,
      insightsData: props.selectedModelData.insightsData
    }
    return <SidepanelContainerInsightsSearchView options = {options} />
  };
  
  // Enable Create Room Action panel!
  function roomTypeListPanel(){
    var options = {
      dashboardController: (opts) => props.dashboardController(opts),
      height: sidepanel.height,
      params: props.params,
      adminAction: props.selectedModelData.adminAction
    }
    return <SidepanelContainerRoomsListView options = {options}/>
  };

  // Business Tool Kit View!
  function businessToolKitView(){
    var options = {
      dashboardController: (opts) => props.dashboardController(opts),
      height: sidepanel.height,
      params: props.params,
    }
    return <SidepanelContainerBusinessToolkit options = {options}/>
  };

  // Report generation view!
  function reportGenerationView(){
    var options = {
      dashboardController: (opts) => props.dashboardController(opts),
      height: sidepanel.height,
      params: props.params,
    }
    return <SidepanelContainerReportGeneration options = {options} />
  };

  // Side-panel search bar view!
  function _renderSearchBarView(){
    return <SidepanelContainerSearchView updateFilterData = {(filterData) => _updateFilterData(filterData)} />
  }

  // Sidepanel room list tree view!
  function roomListTreeView(){
    return (
        <>
          {!sidepanelView.voucherListPanel && _renderSearchBarView()}
          {!sidepanel.listFilter && _getRoomTypes().map((suiteType) => {
            return <CollectionView data = {suiteType} showCollectionChildView = {() => _renderPanelItemViewCollection(suiteType)}/>
          })}
          {sidepanel.listFilter && (sidepanel.listFilter.length !== 0) && sidepanel.listFilter.map((options) => {
            options['allowSubData'] = true;
            return (
                <div className = 'collection-sub-child-view'>
                  {_renderPanelItemView(options)}
                </div>
            )
          })}
        </>
    )
  };

  // Render custom inline menu for item panel collection!
  function _renderCustomInlineMenu(data){
    return(
        <span style = {{marginBottom: '2px'}} onClick = {(e) => _toggleCustomModal(data, e, true)}>
        <span className = 'inline-menu' style = {{border: '2px solid black',
          backgroundColor: "lightblue", color: 'black', padding: '0px 2px 0px 2px'}}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle-fill" viewBox="0 0 16 16">
            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
          </svg>
        </span>
      </span>
    )
  };

  // Get form mode based on room status constant!
  function getFormMode(model) {
    const status = model.roomStatusConstant;
    if (status === sidepanelConstants.formModeConstants.READ_MODE) {
      return sidepanelConstants.formMode.READ_MODE;
    } else if (status === sidepanelConstants.formModeConstants.EDIT_MODE) {
      return sidepanelConstants.formMode.EDIT_MODE;
    } else {
      return sidepanelConstants.formMode.ROOM_STATUS_MODE;
    }
  };

  // Set or change sidepanel view state.
  function _setSidePanelMode(mode){
    switch(mode){
      case sidepanelConstants.SIDE_PANEL_MODES.roomList:
        _setTreePanel(true);
        break;
      case sidepanelConstants.SIDE_PANEL_MODES.filterList:
        _setFilterPanel(true);
        break;
      case sidepanelConstants.SIDE_PANEL_MODES.voucherList:
        _setVoucherListPanel(true);
        break;
      case sidepanelConstants.SIDE_PANEL_MODES.insightsSearchForm:
        _setInsightsSearchFormPanel(true);
        break;
      case sidepanelConstants.SIDE_PANEL_MODES.roomTypeListPanel:
        _setRoomTypeListPanel(true);
        break;
      case sidepanelConstants.SIDE_PANEL_MODES.businessToolKit:
        _setBusinessToolKit(true);
        break;
      case sidepanelConstants.SIDE_PANEL_MODES.customReport:
        _setReportGeneration(true);
        break;
      default:
        _setTreePanel(true);
        break;
    }
  };

  // Enabled filter panel!
  function _setFilterPanel(value){
    // Generate options and update filter panel data.
    var filterPanelDropdownOptions = prepareFilterPanelOptions(sidepanel.parentData);
    updateMetadataFields('suiteType', {options: filterPanelDropdownOptions}, filterState, setFilterState);
    _toggleSidepanelView({filterPanel: value});
  };

  // Enable voucher list panel.
  function _setVoucherListPanel(value){
    _toggleSidepanelView({voucherListPanel: value});
  };

  // Enable insights search form panel!
  function _setInsightsSearchFormPanel(value){
    _toggleSidepanelView({insightsSearchForm: value});
  };

  // Enable create room action panel!
  function _setRoomTypeListPanel(value){
    _toggleSidepanelView(({roomTypeListPanel: value}));
  };
  
  // Enable business tool kit panel!
  function _setBusinessToolKit(value){
    _toggleSidepanelView({businessToolKit: value});
  }

  // Enable report generation panel!
  function _setReportGeneration(value){
    _toggleSidepanelView({customReport: value});
  }

  // Enable tree panel!
  function _setTreePanel(value){
    _toggleSidepanelView({roomListTree: value});
  };

  // Apply filter for the user filtered data!
  function _applyFilter(){
    var filterData = nodeConvertor(filterState);
    filterData.checkOutDate = formatDate(filterData.checkOutDate);
    props.updateFilterData(filterData);
  };

  // Toggle between sidepanel view!
  function _toggleSidepanelView(options){
    // Choose header and change panel state!
    var panelHeader;
    if(options.roomListTree) panelHeader = sidepanelConstants.panelHeader.ROOM_LISTS;
    if(options.filterPanel) panelHeader = sidepanelConstants.panelHeader.FILTER_PANEL;
    if(options.voucherListPanel) panelHeader = sidepanelConstants.panelHeader.VOUCHER_LISTS;
    if(options.insightsSearchForm) panelHeader = sidepanelConstants.panelHeader.INSIGHTS_SEARCH_FORM;
    if(options.roomTypeListPanel) panelHeader = sidepanelConstants.panelHeader.roomTypeListPanel;
    if(options.businessToolKit) panelHeader = sidepanelConstants.panelHeader.businessToolKit;
    if(options.customReport) panelHeader = sidepanelConstants.panelHeader.customReport;
    setSidepanel(prevState => ({...prevState, header: panelHeader}));
    setSidepanelView(prevState => ({roomListTreePanel: options.roomListTree,
      filterRoomPanel: options.filterPanel, voucherListPanel: options.voucherListPanel,
      insightsSearchForm: options.insightsSearchForm, roomTypeListPanel: options.roomTypeListPanel,
      businessToolKit: options.businessToolKit, customReport: options.customReport}));
  };

  // Item panel collection onClick!
  function panelItemOnClick(uId, model){
    var dashboardMode = getFormMode(model);
    _updateSelectedIdList(uId);
    // Get userStatusMap from the collection instance.
    var userStatusMap = CollectionInstance.getCollections('userStatusMap').data;
    props.selectedModel({roomModel: model, dashboardMode: dashboardMode, userStatusMap: userStatusMap});
  };

  // Highlight selected ID!
  function _updateSelectedIdList(id){
    setSidepanel(prevState => ({...prevState, selectedId: [...prevState.selectedId, id]}));
  };

  // Render panel item view collection!
  function _renderPanelItemViewCollection(selectedType){
    return sidepanel.childData.map((options) => {
      if(options.suiteName === selectedType){
        return _renderPanelItemView(options);
      }
    })
  };

  // Render panel item view for filter and non-filter data's.
  function _renderPanelItemView(options){
    // Determine the status color code!
    var statusColorCode = getStatusCodeColor(options.roomStatusConstant);
    return <PanelItemView data = {options.roomno} _id = {options._id} showIndentationArrow = {true} subData = {options.customerName}
                          allowSubData = {options.allowSubData} onMouseOverInlineAction = {true} showInlineMenu = {true} customInlineMenu = {true} colorCode = {statusColorCode}
                          onClick = {(uId) => panelItemOnClick(uId, options)} selectedItem = {sidepanel.selectedId}
                          _renderCustomInlineMenu = {() => _renderCustomInlineMenu(options)} />
  };

  // Get side panel loader options!
  function getLoaderOpts(){
    return{
      color: "black",
      marginTop: (sidepanel.height) / 2.2 + "px",
      textCenter: true
    }
  };

  // Side panel custom modal body item view!
  function customModalBodyItemView(){
    var data = customModal.customData,
        headerValue = sidepanelConstants.tableHeader.MORE_DETAILS_HEADER,
        cellValues = [{_id: 'dummyInstance', floorNo: data.floorNo, bedCount: data.bedCount, extraBedPrice: data.extraBedPrice, roomPrice: data.price}],
        tableData = {headerValue, cellValues, tableCellWidth: "180px"};
    return <MetadataTableView data = {tableData} />
  };

  // Trigger custom modal!
  function _toggleCustomModal(data, e, value){
    e && e.stopPropagation();
    var requiredKeys, propertyData, metadataFieldState, propertyConstants;
    metadataFieldState = _.clone(MetadataFieldTemplateState.textField);
    propertyConstants = _.clone(sidepanelConstants.TEMPLATE_LABEL);
    propertyConstants.suiteName.options = _getRoomTypes();
    requiredKeys = Object.keys(propertyConstants);
    propertyData = createMetadataFieldsWithBaseObj(filterKeysInObj(_.clone(data), requiredKeys), sidepanelConstants.TEMPLATE_LABEL, metadataFieldState);
    // setCustomModal(prevState => ({...prevState, show: value, customData: data}));
    props.dashboardController({dashboardMode: PropertyContainerConstants.DASHBOARD_MODE.propertyReadView,
      queryParams: [{key: 'selectedModel', value: data._id}, {key: 'isEditable', value: data.isOccupied !== "true"}, {key: 'method', value: 'edit-room-model'},
        {key: 'uniqueId', value: 'roomId'}, {key: 'clientModelKey', value: 'updatedModel'}, {key: 'serverModelKey', value: 'updatedData'}],
      selectedRoomConstant: PropertyContainerConstants.PROPERTY_VIEW.propertyRoom, roomModel: data, propertyData: propertyData, goToLocation: true});
  };

  // Render custom modal!
  function _renderCustomModal(){
    return <CustomModal modalData = {customModal} showBodyItemView = {customModalBodyItemView} />
  };

  // Prepare filter panel options!
  function prepareFilterPanelOptions(parentData){
    var result = [];
    for (var data of parentData){
      var options = {};
      options.value = data.suiteType;
      options.actualValue = data.suiteType;
      result.push(options);
    };
    return result;
  };

  // Fetch the available room types!
  async function fetchRoomsTypes(){
    _toggleLoader(true);
    const result = await getAvailableRoomTypes(props.params.accIdAndName[0]);
    if(result.data.success){
      setSidepanel(prevState => ({...prevState, parentData: result.data.message}));
      fetchRoomsLists();
    } else {
      props.params.navigateInto({path: '/rejected'});
    }
  };

  // Fetch user model!
  async function fetchUserModel(){
    var params = {lodgeId: props.params.accIdAndName[0]};
    const result = await getUserModel(params);
    if(result.data.success){
      return result.data.message;
    };
  };

  // Fetch the available rooms list!
  async function fetchRoomsLists(){
    var options = {getWidgetTileCollection: true};
    const result = await getRoomList(props.params.accIdAndName[0], options);
    if(result.data.success){
      setSidepanel(prevState => ({...prevState, childData: result.data.message}));
      var userModel = await fetchUserModel();
      props.updatePropertyDetails(result.data.message, result.data.countAvailability, result.data.roomStatus, userModel); // Send the property details to the dashboard container!
      _toggleLoader(false);
    } else {
      props.params.rejectPerspective();
    }
  };

  // Returns only the room types in the form of array!
  function _getRoomTypes(){
    var roomTypeArr = [];
    sidepanel.parentData.map((data) => {
      roomTypeArr.push(data.suiteType);
    });
    return roomTypeArr;
  };

  // Reset client side data to its original data value!
  function _resetClientData(){
    setSidepanel(prevState => ({...prevState, height: undefined, selectedId: []}));
  };

  // Get current view template!
  function _getCurrentViewTemplate(){
    return _.omitBy(sidepanelView, _.isNil);
  }

  // Update the child model on every silent true state update!
  function updateModel(options){
    if(props.selectedModelData.roomModel !== undefined){ // this condition is added here because when we click on cancel on the property container
      // The opts which gets send to the dashboardController function is reloadSidepanel silent: true to avoid making an api call for cancel operation!
      // That time the props.selectedModelData.roomModel will be undefined.
      var isListFilterApplied = isFilterApplied(),
          currentModelData = sidepanel.childData,
          currentListFilterData = sidepanel.listFilter,
          updatedModelId = props.selectedModelData.roomModel._id,
          updatableIndex,
          updatableFilterIndex;
      // Find the changed data index through the changed model roomId for side panel's child data
      currentModelData.map((key, index) => {
        if(key._id === updatedModelId){
          updatableIndex = index;
        };
      });
      // Find the changed data index through the changed model roomId for side panel's list filter data
      isListFilterApplied && currentListFilterData.map((key, index) => {
        if(key._id === updatedModelId){
          updatableFilterIndex = index;
        }
      });
      // Update the data at the calculated index!
      currentModelData[updatableIndex] = props.selectedModelData.roomModel;
      setSidepanel(prevState => ({...prevState, childData: currentModelData})); // Update the child data!
      if(isListFilterApplied){
        currentListFilterData[updatableFilterIndex] = props.selectedModelData.roomModel;
        setSidepanel(prevState => ({...prevState, listFilter: currentListFilterData})); // Update the list filter data!
      }
    }
    if(options?.action === 'REMOVE'){
      const currentCollectionData = sidepanel.childData;
      _.remove(currentCollectionData, (model) => {
        return options.modelIds.includes(model._id)
      });
      setSidepanel(prevState => ({...prevState, childData: currentCollectionData}));
    }
  };

  // Expose child function to the parent component!
  React.useImperativeHandle(ref, () => ({
    _setSidePanelMode
  }));

  // Update the sidepanel height when props.data.height changes!
  useEffect(() => {
    if(!props.controller.reloadSidepanel.silent){
      fetchRoomsTypes();
    } else {
      updateModel(props.controller.reloadSidepanel);
    }
    _resetClientData();
    updateSidePanelHeight(props.data.height);
  }, [props.data.height, props.controller.reloadSidepanel]);

  // Panel View!
  function _renderPanelView(){
    return(
        <>
          {customModal.show && _renderCustomModal()}
          <PanelView data = {sidepanel} childView = {() => sidepanelChildView()} />
        </>
    )
  }

  return _renderPanelView();
}

export default React.forwardRef(SidepanelWrapper);