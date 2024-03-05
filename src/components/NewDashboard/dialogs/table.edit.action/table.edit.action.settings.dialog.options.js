import dialogCreateOptions from "../table.create.action/table.create.action.settings.dialog.options";
import {editVoucherModelList} from "../../../vouchers/vouchers.utils";

function voucherTrackerEditOptions(options){
    return dialogCreateOptions['voucherTracker'](options);
};

var dialogEditOptions = {
    'voucherTracker': (options) => voucherTrackerEditOptions(options)
};

export default dialogEditOptions;