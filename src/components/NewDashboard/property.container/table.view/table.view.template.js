import MetadataTable from '../../../metadata.table.view/metadata.table.view';

class TableViewTemplateHelpers {
  
  constructor(state){
    this.data = state;
  };
  
  // Table property container left side controller!
  renderLeftSideController(){
    return(
      <div onClick = {() => this.data.onBack()}>
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
        </svg>
        <span className = 'brew-statustableview-lefttoolbar-header'>
          {this.data.selectedRoomConstant}
        </span>
      </div>
    );
  };
  
  // Table view template helpers!
  tableViewTemplateHelper(tableData, widgetData){
    return(
      <div className = 'metadata-table-view-dashboard-container' style = {{height: widgetData.height}}>
        <MetadataTable data = {tableData} height = {widgetData.height} />
      </div>
    )
  };
  
};

export default TableViewTemplateHelpers;