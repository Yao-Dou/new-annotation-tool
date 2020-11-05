/**
 * Map from selection id (e.g., "selection-1") to the Characters
 */
let all_colors = ['blue', 'green', 'red', 'purple', 'pink', 'gold', 'navy', 'orange']
let colors_map = {"Language": "#FF0000", "Redundant": "#E054DB", "Off-topic": "#000080", "Contradiction": "#004BE1"}
var situation_text = {};
var old_value = ""

/**
 * All selected spans
 */
class Characters {
    constructor(situationID, num) {
        this.situationID = situationID;
        this.data = [];
        this.displayID = situationID + '-display';
        this.serializeID = situationID + '-serialize';
    }
    add(newCS) {
        // check for duplicates and add if it's not there.
        for (let oldCS of this.data) {
            if (oldCS == null) {
                continue;
            }
            if (oldCS.equals(newCS)) {
                // animate it to show it exists.
                oldCS.noticeMeSenpai = true;
                return;
            }
        }
        this.data.push(newCS);
    }
    remove(cs) {
        for (let i = this.data.length - 1; i >= 0; i--) {
            if (this.data[i] == null) {
                continue;
            }
            if (this.data[i].equals(cs)) {
                this.data[i] = null
            }
        }
    }
    update() {
        this.render();
        this.serialize();
    }
    render() {
        let display = $('#' + this.displayID).empty();
        for (let i = 0; i < this.data.length; i++) {
            console.log(this.data)
            if (this.data[i] == null) {
                continue;
            }
            display.append(this.data[i].render(this.situationID, i));
        }
    }
    serialize() {
        let strings = [];
        for (let character of this.data) {
            if (character == null) {
                continue;
            }
            strings.push(character.serialize(this.situationID));
        }
        let vals = strings.join(',');
        return vals
    }
}
class CharacterSelection {
    constructor(error_type, explanation, severity, start_end_pairs, num) {
        this.error_type = error_type;
        this.explanation = explanation;
        this.severity = severity
        this.start_end_pairs = start_end_pairs
        this.num = num
        this.noticeMeSenpai = false;
    }
    equals(other) {
        return this.error_type == other.error_type && this.explanation == other.explanation && this.severity == other.severity && JSON.stringify(this.start_end_pairs) === JSON.stringify(other.start_end_pairs);;
    }
    render(situationID, num) {
        let error_type = this.error_type, explanation = this.explanation, severity = this.severity, start_end_pairs = this.start_end_pairs; // so they go in the closure
        // let txt = $('#' + situationID).text().substring(start, end);
        let txt = error_type + " (" + severity + "): " + explanation;
        // let new_input_text = txt.replace(/"/g, "_QUOTE_");
        // new_input_text = new_input_text.replace(/</g, "_LEFT_");
        // new_input_text = new_input_text.replace(/>/g, "_RIGHT_");
        let removeButton = $('<button></button>')
            .addClass('bg-transparent white bn hover-black hover-bg-white br-pill mr1')
            .append('✘')
            .on('click', function () {
                document.getElementById(situationID).innerHTML = situation_text[situationID]
                C.remove(new CharacterSelection(error_type, explanation, severity, start_end_pairs));
                C.update();
            });
        let color_class= error_type
        if (color_class == "Knowledge Base") {
            color_class = "KB"
        }
        let span = $('<span></span>')
            .addClass('b bg-' + color_class + ' white pa2 ma1 br-pill dib quality-span')
            .append(removeButton)
            .append(txt);
        span.attr('id', 'quality-span-'+num)
        span.attr('data-situation-id', situationID)
        span.attr('data-error-type', error_type)
        span.attr('data-severity', severity)
        span.attr('data-explanation', explanation)
        span.attr('data-start-end-pairs', start_end_pairs)
        span.attr('data-num', num)
        // span.attr('data-num', characters_num)
        // if the character needs to be noticed, abide.
        if (this.noticeMeSenpai) {
            this.noticeMeSenpai = false;
            span.addClass("animated bounce faster");
            setTimeout(function () {
                span.removeClass('animated bounce faster');
            }, 1000);
        }
        return span;
    }
    serialize(situationID) {
        // let txt = $('#' + situationID).text().substring(start, end);
        // let quality_name = quality_map[situationID][this.num]
        // let new_quality_name = quality_name.replace(/,/g, "_SEP_");
        // new_quality_name = new_quality_name.replace(/"/g, "_QUOTE_");
        // console.log($('#' + situationID).text())
        // // console.log($('#' + situationID).text().substring(0, 5))
        // console.log($('#' + situationID).text().length)
        // return '["' + new_quality_name + '",' + this.start + ',' + this.end + ']';
    }
}

// globals
let C = new Characters("situation-0", 0);
// provided externally to the script!
// let start;
// let end;
let start_end_pairs = []
let n_situations = 1;
let situationID;
// script
$(document).ready(function () {
    // build up elements we're working with
    situation_text['situation-0'] = $('#' + 'situation-0').text()
    // initialize our data structures NOTE: later we'll have to add data that's loaded
    // into the page (the machine's default guesses). or... maybe we won't?
    var pageX;
    var pageY;
    // $(document).on('mousedown', function(e){
    //     var selector = $("#quality-selection");
    //     if (!selector.is(e.target) &&
    //         !selector.has(e.target).length) {
    //             selector.fadeOut(1);
    //     }
    // });
    $('#close-icon').on("click", function(e) {
        $("input:radio[name='severity']").prop('checked', false);
        $('#error_type').val('');
        $('#explanation').val('');
        $("#quality-selection").fadeOut(0.2);
        start_end_pairs = []
    });
    $("#situation-0").on("mousedown", function(e){
        pageX = e.pageX;
        pageY = e.pageY;
    });
    $("#situation-0").on('mouseup', function (e) {
        situationID = e.target.id;
        let selection = window.getSelection();
        if (selection.anchorNode != selection.focusNode || selection.anchorNode == null) {
            // highlight across spans
            return;
        }
        $('#text_input').val('');
        // $('#quality-selection').fadeOut(1);
        let range = selection.getRangeAt(0);
        let [start, end] = [range.startOffset, range.endOffset];
        if (start == end) {
            // disable on single clicks
            return;
        }
        // manipulate start and end to try to respect word boundaries and remove
        // whitespace.
        end -= 1; // move to inclusive model for these computations.
        let txt = $('#' + situationID).text();
        while (txt.charAt(start) == ' ') {
            start += 1; // remove whitespace
        }
        while (start - 1 >= 0 && txt.charAt(start - 1) != ' ') {
            start -= 1; // find word boundary
        }
        while (txt.charAt(end) == ' ') {
            end -= 1; // remove whitespace
        }
        while (end + 1 <= txt.length - 1 && txt.charAt(end + 1) != ' ') {
            end += 1; // find word boundary
        }
        // move end back to exclusive model
        end += 1;
        // stop if empty or invalid range after movement
        if (start >= end) {
            return;
        }
        start_end_pairs.push([start, end])
        let selection_text = "Selected Span: <a class=\"selection_a\">";
        start = start_end_pairs[0][0]
        end = start_end_pairs[0][1]
        let select_text = $('#' + situationID).text().substring(start, end)
        selection_text += select_text + "</a>"
        if (start_end_pairs.length != 1) {
            for (pair of start_end_pairs.slice(1)) {
                start = pair[0]
                end = pair[1]
                let select_text = $('#' + situationID).text().substring(start, end)
                selection_text += ", <a class=\"selection_a\">" + select_text + "</a>"
            }
        }
        document.getElementById("selection_text").innerHTML = selection_text
        console.log(start_end_pairs.length)
        if (start_end_pairs.length == 1) {
            $('#quality-selection').css({
                'display': "inline-block",
                'left': pageX + 5,
                'top' : pageY - 140
            }).fadeIn(200, function() {
                $('#confirm').prop('disabled', false);
            });
        }
        // document.getElementById("text_input").select();
    });
    $('#confirm_button').on("click", function(e) {
        // var disabled = $(this).prop("disabled")

        // get text input value
        var error_type = document.getElementById("error_type").value;
        var explanation = document.getElementById("explanation").value;
        var severity = $('input[name="severity"]:checked').val();
        if (error_type === "" || explanation === "" ||  severity === undefined) {
            alert("Error Type, Explanation, and Severisty are required!")
            return false
        }
        let display = $('#' + situationID + "-display")
        display.attr('id', situationID + '-display')
        display.attr('data-situation-id', situationID)
        C.add(new CharacterSelection(error_type, explanation, severity, start_end_pairs, C.data.length));

        C.update();
        $('#quality-selection').fadeOut(1, function() {
            $('#confirm').prop('disabled', true);
            $("input:radio[name='severity']").prop('checked', false);
            $('#error_type').val('');
            $('#explanation').val('');
        });
        start_end_pairs = []
    });
    // $(document).on('focusout','.quality',function(e){
    //     var situation_id = $(this).attr("data-situation-id")
    //     var quality_num = $(this).attr("data-quality-num")
    //     var new_quality = $(this).text()
    //     let new_input_text = new_quality.replace(/"/g, "_QUOTE_");
    //     new_input_text = new_input_text.replace(/</g, "_LEFT_");
    //     new_input_text = new_input_text.replace(/>/g, "_RIGHT_");
    //     quality_map[situation_id][quality_num] = new_input_text
    //     AC.update()
    // });
    $(document).on('mouseover','.quality-span',function(e){
        // $(this).css("color","black")
        // $(this).css("background-color","white")
        var color_class = $(this).attr("data-error-type")
        // $(this).removeClass(color_class)
        var quality_id = e.target.id
        var situation_id = $(this).attr("data-situation-id")
        var span_num = $(this).attr("data-num")
        cs = C.data[span_num]
        var start_end_pair = cs.start_end_pairs[0]
        let text = document.getElementById(situation_id).innerHTML
        start_temp = start_end_pair[0]
        end_temp = start_end_pair[1]
        subtxt = text.substring(start_temp, end_temp)
        front_part = text.substring(0, start_temp)
        end_part = text.substring(end_temp)
        old_text = text
        text = front_part + "<span class=\""+color_class+"\">" + subtxt + "</span>" + end_part
        document.getElementById(situation_id).innerHTML = text
    });
    $(document).on('mouseout','.quality-span',function(e){
        // $(this).css("color","white")
        var color_class = $(this).attr("data-error-type")
        // $(this).addClass(color_class)
        var quality_id = e.target.id
        var situation_id = $(this).attr("data-situation-id")
        document.getElementById(situation_id).innerHTML = situation_text[situation_id]
    });
   
    $("#no_badness").on("change", function(){
        if($(this).is(':checked')) {
            old_value = $("#situation-0-serialize").attr("value")
            $("#situation-0-serialize").attr("value", "There is no badeness in text.")
        } else {
            $("#situation-0-serialize").attr("value", old_value)
        }
     });
    
    // clear button in the quality select box
    $("#clear_button").on("click", function(){
        $("input:radio[name='severity']").prop('checked', false);
        $('#error_type').val('');
        $('#explanation').val('');
    })
    // $("#text_input").on('keydown',function(e) {
    //     var disabled = $('#confirm').prop("disabled")
    //     if(e.key === "Enter" && !disabled) {
    //         event.preventDefault();
    //         $('#confirm').click();
    //     }
    // });
    $( function() {
        $( "#quality-selection" ).draggable();
      } );
});
