// filter table wrapper override table templates!
import MetadataFieldsView from "../../../fields/metadata.fields.view";
import CheckinForm from "../checkin.view/checkin.form.view";

// Filter table action cell view!
export function filterTableActionCellView(events, index){
  var transfer = 'Transfer';
  return(
    <div className = 'metadata-button-field filter-tablecell-field brew-cursor' onClick = {() => events.transferEvent(index)}>
      {transfer}
    </div>
  )
}

export function filterTableCheckInActionCellView(events, index){
  var transfer = 'Check-In';
  return(
      <div className = 'metadata-button-field filter-tablecell-field brew-cursor' onClick = {() => events.checkInEvent(index)}>
        {transfer}
      </div>
  )
}

// Edit properties custom modal body item view!
export function editPropertiesBodyView(data, updateData){
  return <MetadataFieldsView data = {data} updateData = {updateData}/>
}

// Favorites checkin form sub child view!
export function favoritesCheckInFormView(roomModel){
  return <CheckinForm data = {roomModel} afterFormSave = {(opts) => roomModel.afterFormSave(opts)} params = {roomModel.params}/>
}