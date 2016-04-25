//Functions for draggable labels

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    var prefix="http://babelnet.org/rdf/s"
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    $(ev.target).val(prefix+($("#"+data).attr("cui"))); //.text()
    
}

//Functions for generating JSON-LD

function addFields(){
    var fields=["context","type","topic"];
    var ftag='<input class="object" type="text" ondrop="drop(event)" onndragover="allowDrop(event)" size="50" placeholder="..escribe o arrastra etiqueta.."'
    for(var i in fields){
        $("#fieldsarea").append('<label for="'+fields[i]+'">'+id2json(fields[i])+' </label><br>')
                    .append(ftag+" id='"+fields[i]+"'>")
                    .append('<br>');
    }
}

function id2json(s){
    if (s=="context") return "@context";
    if (s=="id") return "@id";
    if (s=="type") return "@type";
    return s;
}

function getObject(){
    obj={};
    fields=$(".object");
    for(i in fields){
        value=$("#"+fields[i].id).val();
        if (value!==""){
           obj[id2json(fields[i].id)]=$("#"+fields[i].id).val();
        }
    };
    $("#jsonld").val(JSON.stringify(obj));
}

//Search Babelnet for URIs of topics

function getBabelNetData(){
    var keyword=$("#query").val().replace(/ /g,"+");
    var url="http://krono.act.uji.es/annotator/es/q="+keyword;
    
    if (keyword.length<2){return false;}
    
    $("#labelarea").empty();
    
    $.getJSON(url)
        .done(function(data){
            results=data["Annotations"];
            labels={};
            for (i in results){
                lab=results[i]["match"].replace(/ /g,"_");
                if (labels[lab]!=null){ lab=lab+"_"+i; }
                labels[lab]=results[i]["cui"];
            }
            if (Object.keys(labels).length==0){
                $("#labelarea").append("<span class='label label-warning'>No results</span>")
            }
            else{
                addLabels(labels);
            }
        })
    .fail(function(){alert("error: service not available");})
              
}

function addLabels(data){
    var babelnet="http://babelnet.org/synset?word=bn:"
    var ltag='<a class="label label-success" draggable="true" ondragstart="drag(event)" '
    for(var key in data){
        if (data[key]!==null){
        $("#labelarea").append(ltag+" id='"+key+"' href='"+babelnet+data[key]+"&lang=ES' cui='"+data[key]+"' target='_blank'>"+key+" </a>").append("<br>");
       extractLex(data[key],key);
        }
    }    
}
            
//Query labels of concepts

function extractLex(cui,tagid){
    var url="http://krono.act.uji.es/annotator/es/lexico/"+cui;
    var hid=tagid;
    if (cui.length>4){
        $.getJSON(url)
            .done(function(data){
                var lex=data["result"];
                lex=lex.slice(0,40)+"..";
                lex=lex.replace(/n~/g,"ñ");
                $("#"+hid).append("<span >"+lex+"</span><br>");
            })
        .fail(function(){alert("error");});
    }
}
        

