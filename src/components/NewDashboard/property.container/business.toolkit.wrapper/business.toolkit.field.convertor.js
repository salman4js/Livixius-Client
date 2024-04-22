import _ from "lodash";
import MetadataFieldTemplateState from "../../../fields/metadata.field.templatestate";

let fieldModule = function () {
    const me = {};
    me.customConfigCalc = {
        _getTemplate: function(panelName){
            const template = {
                controlCenterTemplate: [{
                    name: 'configName', placeholder: 'Enter Configuration Name', label: 'Configuration Name', attribute: 'textField'
                }, {
                    name: 'isSelectedConfig', label: 'Select as a default configuration', customStyle: {
                        color: 'black',
                        border: '1px solid grey',
                        backgroundColor: '#EDEADE',
                        padding: '5px 5px 5px 5px',
                        borderRadius: '5px',
                        marginTop: '10px',
                        width: '500px',
                        marginBottom: '10px'
                    }, attribute: 'checkBoxField'
                }],
                fieldCenterTemplate: [{
                    name: 'totalAmount', placeholder: 'Enter custom formula for total amount', label: 'Total Amount Formula Customization', attribute: 'textField'
                }, {
                    name: 'extraBedPrice', placeholder: 'Enter custom formula extra bed price', label: 'Extra Bed Price Formula Customization', attribute: 'textField'
                }, {
                    name: 'discount', placeholder: 'Enter custom formula discount', label: 'Discount Formula Customization', attribute: 'textField'
                }, {
                    name: 'advance', placeholder: 'Enter custom formula advance', label: 'Advance Formula Customization', attribute: 'textField'
                }]
            };
            return template[panelName];
        },
        _getTemplateValue: function(fieldOptions){
            const fieldCenterTemplateValues = ['totalAmount', 'extraBedPrice', 'discount', 'advance'],
                fieldOptionsKey = Object.keys(fieldOptions);
            fieldOptionsKey.forEach((field) => {
                if(fieldCenterTemplateValues.includes(field)){
                    if(!fieldOptions.fields) fieldOptions.fields = [];
                    fieldOptions.fields.push({
                        fieldName: field,
                        fieldCustomFormula: fieldOptions[field]
                    });
                    delete fieldOptions[field];
                }
            });
            return fieldOptions;
        }
    }
    return me;
}();


class BusinessToolkitFieldConvertor {
    constructor(options) {
        this.options = options;
    };

    _prepareFields(){
        const fields = fieldModule[this.options.configName]._getTemplate(this.options.panel);
        const metadataFields = [];
        fields.map((f) => {
           const fieldTemplate = _.clone(MetadataFieldTemplateState[f.attribute]);
           fieldTemplate.name = f.name;
           fieldTemplate.value = this.options.fieldData[f.name];
           fieldTemplate.placeholder = f.placeholder;
           fieldTemplate.label = f.label;
           if(f.customStyle){
               fieldTemplate.customStyle = f.customStyle;
           }
           metadataFields.push(fieldTemplate);
        });
        return metadataFields;
    };

    _prepareFieldValues(fieldOptions){
        return fieldModule[this.options.configName]._getTemplateValue(fieldOptions);
    };
}

export default BusinessToolkitFieldConvertor;