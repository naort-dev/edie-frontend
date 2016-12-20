import React from 'react'
import { showAlert, showPrompt, showConfirm } from 'components/shared/Alert.jsx'

export default class RadioGroup extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    render() {
        let config = this.props.config

        $.each(config.items || [], function(i, radioItem){
            var radio, content;

            //Default Value
            // if(i == 0) radioItem.checked = true;
            // else radioItem.checked = false;

            radio = this.props.buildRadio(radioItem, config.name);
            content = this.props.buildRadioContent(radioItem.items);

            //radioboxes.append(radio);
            text.push(radio);

            //Event
            radio.find('input').first().change(function(){
                var previous = text[(config.label ? 1 : 0) + config.items.length - 1];//col;
                var parent = previous.parent();

                if(contents.length) {
                    $.each(contents, function(j, div){
                        //div.hide();
                        div.detach();
                    });
                }


                if(content.length) {
                    $.each(content, function(j, div){
                        //div.show();
                        div.insertAfter(previous);
                        previous = div;
                    });
                    $.each(content, function(j, div){
                        reset(div);
                    });
                }

                if(radioItem.form) {
                    var mainDiv = $('#stepadvanced');
                    var body = mainDiv.find('.panel-body');
                    body.children().remove();
                    var items= radioItem.form[0].items;
                    for(var i = 0; i < items.length; i++){
                        //var row = $(template['row']);
                        var rows= buildInput(items[i]);
                        if(!rows) continue;
                        body.append(rows);
                    }

                    //Dialog Show
                    var dlg = mainDiv.dialog({
                        modal: true,
                        width: 520,
                        title: '',
                        resizable: false,
                    });
                    refineDialog(dlg);

                    //Dialog Close
                    $('#stepadvanced > .panel > .panel-heading [data-rel=close]').off('click').click(function(e){
                        dlg.dialog('destroy');
                    });

                    mainDiv.find('.btn-cancel').off('click').on('click', function(e){
                        dlg.dialog('destroy');
                    });

                    mainDiv.find('.btn-save').off('click').on('click', function(e){
                        var params = {};
                        $.each(dlg.find('input, select'), function(){
                            var input = $(this);
                            var key = input.attr('name');
                            if(!key) return;
                            params[key] = input.val() || '';
                        });

                        $.ajax({
                            dataType : "json",
                            url : radioItem.form[0].server.url,
                            data: params,
                            async : false
                        }).fail(function(jqxhr, res){
                            showAlert('Add User Failed');

                            dlg.dialog('destroy');
                        }).done(function(data){

                            //Add Value To List
                            var select = steps.find('[name=' + radioItem.form[0].result + ']');
                            if(select.length) {
                                var val = data[radioItem.form[0].server.value];
                                if(val) {
                                    var opt = $('<option/>');
                                    opt.attr('value', val);
                                    opt.text(data[radioItem.form[0].server.label]);
                                    select.append(opt);
                                    select.val(val);
                                }
                            }

                            dlg.dialog('destroy');
                        });

                    });
                }
            });
            contents = contents.concat(content);

            if(radioItem.checked) curcontent = content;
        });
        text = text.concat(curcontent);

        //Init
        //$(radioboxes.children().first()).change();
        text[config.label ? 1 : 0].find('input').first().change();

        col.addClass(template['col-xs'] + calcWidth(config.width));

        return text;
    }
}

RadioGroup.defaultProps = {
    config: {},
    values: {},
    buildRadio: null,
    buildRadioContent: null,
}