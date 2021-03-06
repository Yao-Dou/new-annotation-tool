/**
 * Map from selection id (e.g., "selection-1") to the Characters
 */
let all_colors = ['blue', 'green', 'red', 'purple', 'pink', 'gold', 'navy', 'orange']
let original_ontologies = ["Technical_Jargon", "Bad_Math", "Encyclopedic", "Commonsense", "Needs_Google", "Grammar_Usage", "Off-prompt", "Redundant", "Self-contradiction", "Incoherent"]
let black_text_errors_types = ["Commonsense", "Grammar_Usage", "Off-prompt"]
var error_types_dict = {
    "Technical_Jargon": "Technical Jargon",
    "Bad_Math" : "Bad Math",
    "Encyclopedic" : "Wrong: Encyclopedic",
    "Commonsense" : "Wrong: Commonsense",
    "Needs_Google" : "Needs Google",
    "Grammar_Usage" : "Grammar / Usage",
    "Off-prompt" : "Off-prompt",
    "Redundant" : "Redundant",
    "Self-contradiction" : "Self-contradiction",
    "Incoherent" : "Incoherent"
};
var situation_text = {};
var old_value = ""

function substitute(input_text) {
    let new_input_text = input_text.replace(/,/g, "_SEP_");
    new_input_text = new_input_text.replace(/"/g, "_QUOTE_");
    new_input_text = new_input_text.replace(/</g, "_LEFT_");
    new_input_text = new_input_text.replace(/>/g, "_RIGHT_");
    return new_input_text
}

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
            // console.log(this.data)
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
            strings.push(character.serialize());
        }
        let vals = strings.join(',');
        if ($("#no_badness").is(':not(:checked)')) {
            var situationID = this.situationID
            let serialize = $('#' + situationID + '-serialize');
            serialize.attr('value', '[' + vals + ']');
        } else {
            old_value = '[' + vals + ']';
        }
    }
}
class CharacterSelection {
    constructor(error_type, explanation, severity, start_end_pairs, antecedent_start_end_pairs, num) {
        this.error_type = error_type;
        this.explanation = explanation;
        this.severity = severity
        this.start_end_pairs = start_end_pairs
        this.antecedent_start_end_pairs = antecedent_start_end_pairs
        this.num = num
        this.noticeMeSenpai = false;
    }
    equals(other) {
        return this.error_type == other.error_type && this.explanation == other.explanation 
            && this.severity == other.severity && JSON.stringify(this.start_end_pairs) === JSON.stringify(other.start_end_pairs) && JSON.stringify(this.antecedent_start_end_pairs) === JSON.stringify(other.antecedent_start_end_pairs);
    }
    render(situationID, num) {
        let error_type = this.error_type, explanation = this.explanation, severity = this.severity, start_end_pairs = this.start_end_pairs, antecedent_start_end_pairs = this.antecedent_start_end_pairs; // so they go in the closure
        // let txt = $('#' + situationID).text().substring(start, end);
        let txt = error_types_dict[error_type] + " (" + severity + "): " + explanation;
        // let new_input_text = txt.replace(/"/g, "_QUOTE_");
        // new_input_text = new_input_text.replace(/</g, "_LEFT_");
        // new_input_text = new_input_text.replace(/>/g, "_RIGHT_");
        let color_class= error_type
        let text_color = "white"
        let opposite_color = "black"
        if (black_text_errors_types.includes(color_class)) {
            text_color = "black"
            opposite_color = "white"
        }

        let removeButton = $('<button></button>')
            .addClass('bg-transparent ' + text_color +' bn hover-' + opposite_color + ' hover-bg-' + text_color + ' br-pill mr1 pointer')
            .append('✘')
            .on('click', function () {
                document.getElementById(situationID).innerHTML = situation_text[situationID]
                C.remove(new CharacterSelection(error_type, explanation, severity, start_end_pairs, antecedent_start_end_pairs));
                annotate(C, situation_text["situation-0"])
                C.update();
            });

        let span = $('<span></span>')
            .addClass('b grow bg-' + color_class + " " + text_color +' pa2 ma1 br-pill dib quality-span')
            .append(removeButton)
            .append(txt);
        span.attr('id', 'quality-span-'+num)
        // span.addClass('quality-span-'+num)
        span.attr('data-situation-id', situationID)
        span.attr('data-error-type', error_type)
        span.attr('data-severity', severity)
        span.attr('data-explanation', explanation)
        span.attr('data-start-end-pairs', start_end_pairs)
        span.attr('data-antecedent-start-end-pairs', antecedent_start_end_pairs)
        console.log(antecedent_start_end_pairs)
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
    serialize() {
        // let txt = $('#' + situationID).text().substring(start, end);
        // let quality_name = quality_map[situationID][this.num]
        // let new_quality_name = quality_name.replace(/,/g, "_SEP_");
        // new_quality_name = new_quality_name.replace(/"/g, "_QUOTE_");
        // console.log($('#' + situationID).text())
        // // console.log($('#' + situationID).text().substring(0, 5))
        // console.log($('#' + situationID).text().length)
        // console.log($('#' + situationID).text())
        // console.log($('#' + situationID).text().substring(0, 5))
        // console.log($('#' + situationID).text().length)
        return '["' + substitute(this.error_type) + '","' + substitute(this.explanation) + '",' + this.severity + ','+ this.start_end_pairs[0][0] + ',' + this.start_end_pairs[0][1] + ',[' + this.antecedent_start_end_pairs + ']]';
    }
}

// globals
let C = new Characters("situation-0", 0);
// provided externally to the script!
// let start;
// let end;
let start_end_pairs = []
let antecedent_start_end_pairs = []
let n_situations = 1;
let situationID;

function comparespan(span_a, span_b) {
    let index_a = span_a[1]
    let index_b = span_b[1]
    if(index_a == index_b) {
        return span_a[3] - span_b[3]
    }
    return index_a - index_b;
}

function annotate(character, text) {
    let character_selections = character.data
    let span_list = []
    for(selection of character_selections) {
        if (selection == null) {
            continue;
        }
        let num = selection.num
        let p_span_id = "p-span-" + num
        let start_end_pair = selection.start_end_pairs[0]
        span_list.push([p_span_id, start_end_pair[0], true, num, selection.error_type]);
        span_list.push([p_span_id, start_end_pair[1], false, num, selection.error_type]);
        let antecedent_start_end_pairs = selection.antecedent_start_end_pairs
        if (antecedent_start_end_pairs.length > 0) {
            for(antecedent of antecedent_start_end_pairs) {
                span_list.push([p_span_id + "_antecedent", antecedent[0], true, num, selection.error_type + "_antecedent"]);
                span_list.push([p_span_id + "_antecedent", antecedent[1], false, num, selection.error_type + "_antecedent"]);
            }
        }
    }
    // console
    console.log(span_list)
    span_list.sort(comparespan)
    // console.log(span_list)
    let new_text = ""
    for(i in span_list) {
        span = span_list[i]
        var before_pair_end;
        if(i == 0) {
            before_pair_end = 0
        } else{
            before_pair_end = span_list[i - 1][1]
        }
        start_temp = span[1]
        subtxt = text.substring(before_pair_end, start_temp)
        var span_to_add;
        var color_class = span[4]

        if(span[2]) {
            // span_to_add = "<span id=\"p-span-" + span[3]+ "\"class=\"annotation border-" + color_class + "\">"
            span_to_add = "<span class=\"annotation border-" + color_class + " " + span[0]+ "\">"
        } else {
            span_to_add = "</span>"
            // multiple spans cross together (intersect)
            for (j = i; j >0; j--) {
                if (span_list[j - 1][2] && span_list[j-1][3] != span[3]) {
                    var previous_color_class = span_list[j-1][4]
                    span_to_add += "</span>"
                } else {
                    break
                }
            }
            for (j = i; j >0; j--) {
                if (span_list[j - 1][2] && span_list[j-1][3] != span[3]) {
                    var previous_color_class = span_list[j-1][4]
                    span_to_add += "<span class=\"annotation border-" + previous_color_class + " p-span-" + span_list[j-1][3]+ "\">"
                } else {
                    break
                }
            }
        }
        new_text += subtxt + span_to_add
    }
    if (span_list.length == 0) {
        new_text += text
    } else {
        new_text += text.substring(span_list[span_list.length - 1][1])
    }
    document.getElementById("situation-0").innerHTML = new_text
};

function annotate_select_span(character, text, select_span, select_antecedents) {
    let character_selections = character.data
    let span_list = []
    for(selection of character_selections) {
        if (selection == null) {
            continue;
        }
        let num = selection.num
        let p_span_id = "p-span-" + num
        let start_end_pair = selection.start_end_pairs[0]
        span_list.push([p_span_id, start_end_pair[0], true, num, selection.error_type]);
        span_list.push([p_span_id, start_end_pair[1], false, num, selection.error_type]);
    }
    for(l in select_antecedents) {
        if (select_antecedents[l] != null) {
            span_list.push(["select-antecedent--" + (l+1), select_antecedents[l][0], true, -1, "select-antecedent"]);
            span_list.push(["select-antecedent--" + (l+1), select_antecedents[l][1], false, -1, "select-antecedent"]);
        }
    }
    if (select_span !== undefined) {
        span_list.push(["select-span--1", select_span[0], true, -1, "select-span"]);
        span_list.push(["select-span--1", select_span[1], false, -1, "select-span"]);
    }
    // console.log(span_list)
    span_list.sort(comparespan)
    // console.log(span_list)
    let new_text = ""
    for(i in span_list) {
        span = span_list[i]
        var before_pair_end;
        if(i == 0) {
            before_pair_end = 0
        } else{
            before_pair_end = span_list[i - 1][1]
        }
        start_temp = span[1]
        subtxt = text.substring(before_pair_end, start_temp)
        var span_to_add;
        var color_class = span[4]
        if(span[2]) {
            // span_to_add = "<span id=\"p-span-" + span[3]+ "\"class=\"annotation border-" + color_class + "\">"
            span_to_add = "<span class=\"annotation border-" + color_class + " " + span[0]+ "\">"
            if (span[4] == "select-span") {
                span_to_add = "<span class=\"annotation bg-yellow " + span[0]+ "\">"
            }
            if (span[4] == "select-antecedent") {
                span_to_add = "<span class=\"annotation bg-light-yellow " + span[0]+ "\">"
            }
        } else {
            span_to_add = "</span>"
            // multiple spans cross together (intersect)
            for (j = i; j >0; j--) {
                if (span_list[j - 1][2] && span_list[j-1][3] != span[3]) {
                    var previous_color_class = span_list[j-1][4]
                    span_to_add += "</span>"
                } else {
                    break
                }
            }
            for (j = i; j >0; j--) {
                if (span_list[j - 1][2] && span_list[j-1][3] != span[3]) {
                    var previous_color_class = span_list[j-1][4]
                    if (span_list[j - 1][4] == "select-span") {
                        span_to_add += "<span class=\"annotation bg-yellow " + span_list[j-1][0] + "\">"
                    }
                    if (span_list[j - 1][4] == "select-antecedent") {
                        span_to_add += "<span class=\"annotation bg-light-yellow " + span_list[j-1][0] + "\">"
                    }
                    else {
                        span_to_add += "<span class=\"annotation border-" + previous_color_class + " " + span_list[j-1][0]+ "\">"
                    }
                } else {
                    break
                }
            }
        }
        new_text += subtxt + span_to_add
    }
    if (span_list.length == 0) {
        new_text += text
    } else {
        new_text += text.substring(span_list[span_list.length - 1][1])
    }
    document.getElementById("situation-0").innerHTML = new_text
};

function list_antecedents() {
    let display = $('#selection_antecedent').text("Selected antecedents: ");
    // console.log(antecedent_start_end_pairs)
    for (a in antecedent_start_end_pairs) {
        pair = antecedent_start_end_pairs[a]
        if (pair != null) {
            start = pair[0]
            end = pair[1]
            let txt = situation_text["situation-0"].substring(start, end)
            let removeButton = $('<button></button>')
                .addClass('bg-transparent black bn hover-white hover-bg-black br-pill mr1')
                .attr('antecedent-num', a)
                .append('✘')
                .on('click', function () {
                    antecedent_start_end_pairs[$(this).attr('antecedent-num')] = null
                    list_antecedents();
                    // C.remove(new CharacterSelection(error_type, explanation, severity, start_end_pairs));
                    annotate_select_span(C, situation_text["situation-0"], start_end_pairs[0], antecedent_start_end_pairs)
                    // C.update();
                });
            let span = $('<span></span>')
                .addClass('bg-light-yellow black pa2 ma1 dib quality-span')
                .append(removeButton)
                .append(txt);
            display.append(span);
        }
    }
}

function disable_everything() {
    // $('#confirm_button').prop('disabled', true);
    $("input:radio[name='severity']").prop('checked', false);
    $("input:radio[name='error_type']").prop('checked', false);
    $('#explanation').val('');
    $("#button_div").addClass("disable");
    $("#severity_div").addClass("disable");
    $("#explanation_div").addClass("disable");
    $("#antecedent_selection").slideUp("fast");
    // antecedent_start_end_pairs = []
    // annotate_select_span(C, situation_text["situation-0"], start_end_pairs[0], antecedent_start_end_pairs)
}

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
        antecedent_start_end_pairs = []
        annotate(C, situation_text["situation-0"])
        disable_everything();
    });
    $("#situation-0").on("mousedown", function(e){
        pageX = e.pageX;
        pageY = e.pageY;
        document.getElementById("situation-0").innerHTML = situation_text["situation-0"]
    });
    $("#situation-0").on('mouseup', function (e) {
        situationID = e.target.id;
        let selection = window.getSelection();
        if (selection.anchorNode != selection.focusNode || selection.anchorNode == null) {
            // highlight across spans
            return;
        }
        // $('#quality-selection').fadeOut(1);
        let range = selection.getRangeAt(0);
        let [start, end] = [range.startOffset, range.endOffset];
        if (start == end) {
            // disable on single clicks
            annotate(C, situation_text["situation-0"])
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
        if ($("#antecedent_selection").first().is(":hidden")) {
            start_end_pairs = []
            antecedent_start_end_pairs = []
            start_end_pairs.push([start, end])
            let selection_text = "<b>Selected span:</b> <a class=\"selection_a\">";
            start = start_end_pairs[0][0]
            end = start_end_pairs[0][1]
            let select_text = $('#' + situationID).text().substring(start, end)
            selection_text += select_text + "</a>"
            // if (start_end_pairs.length != 1) {
            //     for (pair of start_end_pairs.slice(1)) {
            //         start = pair[0]
            //         end = pair[1]
            //         let select_text = $('#' + situationID).text().substring(start, end)
            //         selection_text += ", <a class=\"selection_a\">" + select_text + "</a>"
            //     }
            // }
            document.getElementById("selection_text").innerHTML = selection_text
            $('#quality-selection').css({
                'display': "inline-block",
                'left': pageX - 45,
                'top' : pageY + 20
            }).fadeIn(200, function() {
                disable_everything()
            });
            annotate_select_span(C, situation_text["situation-0"], [start, end], antecedent_start_end_pairs)
        } else {  
            $("#explanation_div").removeClass("disable");
            antecedent_start_end_pairs.push([start, end])
            list_antecedents()
            // let selection_text = "Selected antecedents: <a class=\"selection_a_antecedent\">";
            // start = antecedent_start_end_pairs[0][0]
            // end = antecedent_start_end_pairs[0][1]
            // let select_text = $('#' + situationID).text().substring(start, end)
            // selection_text += select_text + "</a>"
            // if (antecedent_start_end_pairs.length != 1) {
            //     for (pair of antecedent_start_end_pairs.slice(1)) {
            //         start = pair[0]
            //         end = pair[1]
            //         let select_text = $('#' + situationID).text().substring(start, end)
            //         selection_text += ", <a class=\"selection_a_antecedent\">" + select_text + "</a>"
            //         annotate_select_span(C, situation_text["situation-0"], [start, end])
            //     }
            // }
            // document.getElementById("selection_antecedent").innerHTML = selection_text
            annotate_select_span(C, situation_text["situation-0"], start_end_pairs[0], antecedent_start_end_pairs)
        }
    });
    $('#confirm_button').on("click", function(e) {
        // var disabled = $(this).prop("disabled")

        // get text input value
        var error_type = $('input[name="error_type"]:checked').val();
        var explanation = $("textarea#explanation").val();
        var severity = $('input[name="severity"]:checked').val();
        if (error_type === "" || explanation === "" ||  severity === undefined) {
            alert("Error Type, Explanation, and Severity are required!")
            return false
        }
        let display = $('#' + situationID + "-display")
        display.attr('id', situationID + '-display')
        display.attr('data-situation-id', situationID)
        C.add(new CharacterSelection(error_type, explanation, severity, start_end_pairs, antecedent_start_end_pairs, C.data.length));

        C.update();
        $('#quality-selection').fadeOut(1, function() {
           disable_everything()
        });
        start_end_pairs = []
        antecedent_start_end_pairs = []
        annotate(C, situation_text["situation-0"])
        // console.log(C)
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
        var p_span_id = ".p-span-" + span_num
        $(p_span_id).addClass("bg-"+color_class);
        var antecedent_color_class= color_class+"_antecedent"
        var antecedent_p_span_id = ".p-span-" + span_num + "_antecedent"
        $(antecedent_p_span_id).addClass("bg-"+antecedent_color_class);
        if (black_text_errors_types.includes(color_class)) {
            $(p_span_id).addClass("black");
            $(antecedent_p_span_id).addClass("black")
        } else {
            $(p_span_id).addClass("white");
            $(antecedent_p_span_id).addClass("white")
        }

        // cs = C.data[span_num]
        // var start_end_pair = cs.start_end_pairs[0]
        // let text = document.getElementById(situation_id).innerHTML
        // start_temp = start_end_pair[0]
        // end_temp = start_end_pair[1]
        // subtxt = text.substring(start_temp, end_temp)
        // front_part = text.substring(0, start_temp)
        // end_part = text.substring(end_temp)
        // old_text = text
        // text = front_part + "<span class=\""+color_class+"\">" + subtxt + "</span>" + end_part
        // document.getElementById(situation_id).innerHTML = text
    });
    $(document).on('mouseout','.quality-span',function(e){
        // $(this).css("color","white")
        var color_class = $(this).attr("data-error-type")
        // $(this).addClass(color_class)
        var quality_id = e.target.id
        var situation_id = $(this).attr("data-situation-id")
        var span_num = $(this).attr("data-num")
        var p_span_id = ".p-span-" + span_num
        $(p_span_id).removeClass("bg-"+color_class);
        var antecedent_color_class= color_class+"_antecedent"
        var antecedent_p_span_id = ".p-span-" + span_num + "_antecedent"
        $(antecedent_p_span_id).removeClass("bg-"+antecedent_color_class);
        if (black_text_errors_types.includes(color_class)) {
            $(p_span_id).removeClass("black");
            $(antecedent_p_span_id).removeClass("black")
        } else {
            $(p_span_id).removeClass("white");
            $(antecedent_p_span_id).removeClass("white")
        }

        // document.getElementById(situation_id).innerHTML = situation_text[situation_id]
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
        $("input:radio[name='error_type']").prop('checked', false);
        $("input:radio[name='severity']").prop('checked', false);
        $('#error_type').val('');
        $('#explanation').val('');
    });

    $(".antecedent_able").on('click',function(e){
        if (!$(this).hasClass("selected")) {
            $("input[name='error_type']").removeClass("selected")
            $(this).addClass("selected")
            $("#antecedent_selection").slideDown("fast");
            antecedent_start_end_pairs = []
            annotate_select_span(C, situation_text["situation-0"], start_end_pairs[0], antecedent_start_end_pairs)
            var id = $(this).attr("id")
            if (id == "error-8") {
                document.getElementById("antecedent_select_text").innerHTML = "Select the antecedents (earlier spans of text) that are being repeated."
            } else if (id == "error-9") {
                document.getElementById("antecedent_select_text").innerHTML = "Select the antecedents (earlier spans of text) that are being contradicted."
            }
            document.getElementById("selection_antecedent").innerHTML = "Selected antecedents: "
            $("input:radio[name='severity']").prop('checked', false);
            $('#explanation').val('');
            $("#button_div").addClass("disable");
            $("#severity_div").addClass("disable");
            $("#explanation_div").addClass("disable");
        }
    });

    $(".antecedent_no_able").on('click',function(e){
        $("input[name='error_type']").removeClass("selected")
        $("#antecedent_selection").slideUp("fast");
        antecedent_start_end_pairs = []
        annotate_select_span(C, situation_text["situation-0"], start_end_pairs[0], antecedent_start_end_pairs)
        document.getElementById("selection_antecedent").innerHTML = "Selected antecedents: "
        $("input:radio[name='severity']").prop('checked', false);
        $('#explanation').val('');
        $("#button_div").addClass("disable");
        $("#severity_div").addClass("disable");
        $("#explanation_div").removeClass("disable");
    });

    $("#explanation").on('change keyup paste', function() {
        $("#severity_div").removeClass("disable");
    });

    $(document).on('click','.checkbox-tools-severity',function(e){
        $("#button_div").removeClass("disable");
    });




    // $("#quality-selection").on('keydown',function(e) {
    //     var disabled = $('#confirm_button').prop("disabled")
    //     if(e.key === "Enter" && !disabled) {
    //         e.preventDefault();
    //         $('#confirm_button').click();
    //     }
    // });
    $(document).on("keypress", function(e){
          if (e.key === "Enter") {
            e.preventDefault();
          }
    });

    $( function() {
        $( "#quality-selection" ).draggable();
      } );
});
