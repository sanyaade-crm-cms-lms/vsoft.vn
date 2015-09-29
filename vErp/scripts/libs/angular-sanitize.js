(function(window,angular,undefined){'use strict';var $sanitizeMinErr=angular.$$minErr('$sanitize');function $SanitizeProvider(){this.$get=['$$sanitizeUri',function($$sanitizeUri){return function(html){var buf=[];htmlParser(html,htmlSanitizeWriter(buf,function(uri,isImage){return!/^unsafe/.test($$sanitizeUri(uri,isImage));}));return buf.join('');};}];}
function sanitizeText(chars){var buf=[];var writer=htmlSanitizeWriter(buf,angular.noop);writer.chars(chars);return buf.join('');}
var START_TAG_REGEXP=/^<((?:[a-zA-Z])[\w:-]*)((?:\s+[\w:-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)\s*(>?)/,END_TAG_REGEXP=/^<\/\s*([\w:-]+)[^>]*>/,ATTR_REGEXP=/([\w:-]+)(?:\s*=\s*(?:(?:"((?:[^"])*)")|(?:'((?:[^'])*)')|([^>\s]+)))?/g,BEGIN_TAG_REGEXP=/^</,BEGING_END_TAGE_REGEXP=/^<\//,COMMENT_REGEXP=/<!--(.*?)-->/g,DOCTYPE_REGEXP=/<!DOCTYPE([^>]*?)>/i,CDATA_REGEXP=/<!\[CDATA\[(.*?)]]>/g,SURROGATE_PAIR_REGEXP=/[\uD800-\uDBFF][\uDC00-\uDFFF]/g,NON_ALPHANUMERIC_REGEXP=/([^\#-~| |!])/g;var voidElements=makeMap("area,br,col,hr,img,wbr");var optionalEndTagBlockElements=makeMap("colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr"),optionalEndTagInlineElements=makeMap("rp,rt"),optionalEndTagElements=angular.extend({},optionalEndTagInlineElements,optionalEndTagBlockElements);var blockElements=angular.extend({},optionalEndTagBlockElements,makeMap("address,article,"+"aside,blockquote,caption,center,del,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,"+"h6,header,hgroup,hr,ins,map,menu,nav,ol,pre,script,section,table,ul"));var inlineElements=angular.extend({},optionalEndTagInlineElements,makeMap("a,abbr,acronym,b,"+"bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,q,ruby,rp,rt,s,"+"samp,small,span,strike,strong,sub,sup,time,tt,u,var"));var specialElements=makeMap("script,style");var validElements=angular.extend({},voidElements,blockElements,inlineElements,optionalEndTagElements);var uriAttrs=makeMap("background,cite,href,longdesc,src,usemap");var validAttrs=angular.extend({},uriAttrs,makeMap('abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,'+'color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,'+'ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,'+'scope,scrolling,shape,size,span,start,summary,target,title,type,'+'valign,value,vspace,width'));function makeMap(str){var obj={},items=str.split(','),i;for(i=0;i<items.length;i++)obj[items[i]]=true;return obj;}
function htmlParser(html,handler){if(typeof html!=='string'){if(html===null||typeof html==='undefined'){html='';}else{html=''+html;}}
var index,chars,match,stack=[],last=html,text;stack.last=function(){return stack[stack.length-1];};while(html){text='';chars=true;if(!stack.last()||!specialElements[stack.last()]){if(html.indexOf("<!--")===0){index=html.indexOf("--",4);if(index>=0&&html.lastIndexOf("-->",index)===index){if(handler.comment)handler.comment(html.substring(4,index));html=html.substring(index+3);chars=false;}}else if(DOCTYPE_REGEXP.test(html)){match=html.match(DOCTYPE_REGEXP);if(match){html=html.replace(match[0],'');chars=false;}}else if(BEGING_END_TAGE_REGEXP.test(html)){match=html.match(END_TAG_REGEXP);if(match){html=html.substring(match[0].length);match[0].replace(END_TAG_REGEXP,parseEndTag);chars=false;}}else if(BEGIN_TAG_REGEXP.test(html)){match=html.match(START_TAG_REGEXP);if(match){if(match[4]){html=html.substring(match[0].length);match[0].replace(START_TAG_REGEXP,parseStartTag);}
chars=false;}else{text+='<';html=html.substring(1);}}
if(chars){index=html.indexOf("<");text+=index<0?html:html.substring(0,index);html=index<0?"":html.substring(index);if(handler.chars)handler.chars(decodeEntities(text));}}else{html=html.replace(new RegExp("(.*)<\\s*\\/\\s*"+stack.last()+"[^>]*>",'i'),function(all,text){text=text.replace(COMMENT_REGEXP,"$1").replace(CDATA_REGEXP,"$1");if(handler.chars)handler.chars(decodeEntities(text));return"";});parseEndTag("",stack.last());}
if(html==last){throw $sanitizeMinErr('badparse',"The sanitizer was unable to parse the following block "+"of html: {0}",html);}
last=html;}
parseEndTag();function parseStartTag(tag,tagName,rest,unary){tagName=angular.lowercase(tagName);if(blockElements[tagName]){while(stack.last()&&inlineElements[stack.last()]){parseEndTag("",stack.last());}}
if(optionalEndTagElements[tagName]&&stack.last()==tagName){parseEndTag("",tagName);}
unary=voidElements[tagName]||!!unary;if(!unary)
stack.push(tagName);var attrs={};rest.replace(ATTR_REGEXP,function(match,name,doubleQuotedValue,singleQuotedValue,unquotedValue){var value=doubleQuotedValue||singleQuotedValue||unquotedValue||'';attrs[name]=decodeEntities(value);});if(handler.start)handler.start(tagName,attrs,unary);}
function parseEndTag(tag,tagName){var pos=0,i;tagName=angular.lowercase(tagName);if(tagName)
for(pos=stack.length-1;pos>=0;pos--)
if(stack[pos]==tagName)
break;if(pos>=0){for(i=stack.length-1;i>=pos;i--)
if(handler.end)handler.end(stack[i]);stack.length=pos;}}}
var hiddenPre=document.createElement("pre");var spaceRe=/^(\s*)([\s\S]*?)(\s*)$/;function decodeEntities(value){if(!value){return'';}
var parts=spaceRe.exec(value);var spaceBefore=parts[1];var spaceAfter=parts[3];var content=parts[2];if(content){hiddenPre.innerHTML=content.replace(/</g,"&lt;");content='textContent'in hiddenPre?hiddenPre.textContent:hiddenPre.innerText;}
return spaceBefore+content+spaceAfter;}
function encodeEntities(value){return value.replace(/&/g,'&amp;').replace(SURROGATE_PAIR_REGEXP,function(value){var hi=value.charCodeAt(0);var low=value.charCodeAt(1);return'&#'+(((hi-0xD800)*0x400)+(low-0xDC00)+0x10000)+';';}).replace(NON_ALPHANUMERIC_REGEXP,function(value){return'&#'+value.charCodeAt(0)+';';}).replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function htmlSanitizeWriter(buf,uriValidator){var ignore=false;var out=angular.bind(buf,buf.push);return{start:function(tag,attrs,unary){tag=angular.lowercase(tag);if(!ignore&&specialElements[tag]){ignore=tag;}
if(!ignore&&validElements[tag]===true){out('<');out(tag);angular.forEach(attrs,function(value,key){var lkey=angular.lowercase(key);var isImage=(tag==='img'&&lkey==='src')||(lkey==='background');if(validAttrs[lkey]===true&&(uriAttrs[lkey]!==true||uriValidator(value,isImage))){out(' ');out(key);out('="');out(encodeEntities(value));out('"');}});out(unary?'/>':'>');}},end:function(tag){tag=angular.lowercase(tag);if(!ignore&&validElements[tag]===true){out('</');out(tag);out('>');}
if(tag==ignore){ignore=false;}},chars:function(chars){if(!ignore){out(encodeEntities(chars));}}};}
angular.module('ngSanitize',[]).provider('$sanitize',$SanitizeProvider);angular.module('ngSanitize').filter('linky',['$sanitize',function($sanitize){var LINKY_URL_REGEXP=/((ftp|https?):\/\/|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s.;,(){}<>"]/,MAILTO_REGEXP=/^mailto:/;return function(text,target){if(!text)return text;var match;var raw=text;var html=[];var url;var i;while((match=raw.match(LINKY_URL_REGEXP))){url=match[0];if(match[2]==match[3])url='mailto:'+url;i=match.index;addText(raw.substr(0,i));addLink(url,match[0].replace(MAILTO_REGEXP,''));raw=raw.substring(i+match[0].length);}
addText(raw);return $sanitize(html.join(''));function addText(text){if(!text){return;}
html.push(sanitizeText(text));}
function addLink(url,text){html.push('<a ');if(angular.isDefined(target)){html.push('target="');html.push(target);html.push('" ');}
html.push('href="');html.push(url);html.push('">');addText(text);html.push('</a>');}};}]);})(window,window.angular);