import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/app-layout/app-layout.js';
import '@polymer/app-layout/app-scroll-effects/app-scroll-effects.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/iron-autogrow-textarea/iron-autogrow-textarea.js';
import '@polymer/paper-card/paper-card.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-dialog/paper-dialog.js';

/**
 * @customElement
 * @polymer
 */
class PrettyPrint extends PolymerElement {
  static get template() {
    return html`

      <style>
      
        app-header {
            background-color: #4285f4;
            color: #fff; 
        }

        iron-autogrow-textarea{
            width:100%;
            display: flex;
            flex: 1;
        }

        paper-card {
          width: 100%;
          height: 100%;
        }

        paper-button.indigo{
          background-color: #4285f4;
          color: white;
          --paper-button-raised-keyboard-focus: {
            background-color: var(--paper-pink-a200) !important;
            color: white !important;
          };
        }

      </style>
      
      <app-header-layout>
        <app-header slot="header" fixed effects="waterfall">
          <app-toolbar>
            <div main-title>XML/JSON Formatter</div>
            <paper-icon-button icon="sort" on-click="_showDialog"></paper-icon-button>
          </app-toolbar>
        </app-header>
        <paper-card>
          <div class="card-content">
            <iron-autogrow-textarea id="userInput"
                placeholder="Paste your XML/JSON string here."
                rows="20"
                inputmode="String"
                ></iron-autogrow-textarea>
          </div>
          <div class="card-actions">
            <paper-button raised class="indigo" on-click="_handleFormat">Format</paper-button>
            <paper-button raised class="red" on-click="_clearData">Clear</paper-button>
          </div>
        </paper-card>
      </app-header-layout>

      
        <paper-dialog id="modal" modal>
          <h2>About this tool</h2>
          <div>
            <paper-dialog-scrollable>
                <p>This is a Progressive Webapp that does not track you.</p>
                <p>You can use it to format XML and JSON data.</p>
                <p>Very simple, No tracking, no ad targeting. </p>
                <p>Created by Amit Shukla Using Polymer(Web Components).</p>
            </paper-dialog-scrollable>
          </div>
          <div class="buttons">
              <paper-button dialog-confirm autofocus>Ok</paper-button>
          </div>
        </paper-dialog>
      

      
      
    `;
  }

  _showDialog(){
    this.shadowRoot.querySelector("#modal").open();
  }

  _handleFormat(){
    console.log("format operation");
    const udata = this.shadowRoot.querySelector("#userInput");
    let isJson = false;
    let jsonDoc;
    let res;
    console.log(udata.value);
    if(udata.value !== undefined && udata.value !== null && udata.value !== ""){

      try{
        jsonDoc = JSON.parse(udata.value);
        isJson = true;
      }catch(e){
        // probably it might be valid XML
        if(e instanceof SyntaxError){
          console.log("It is not a valid JSON " + udata.value);
        }
      }

      if(isJson){
        res = JSON.stringify(jsonDoc, null, 2);
      }else{
        res = this._formatXml3(udata.value);
      }
      
      udata.value = res;
    }
  }

  _clearData(){
    console.log("clear operation");
    const udata = this.shadowRoot.querySelector("#userInput");
    udata.value = "";
  }

  _formatXml3(text){
    
    let ar = text.replace(/>\s{0,}</g,"><")
          .replace(/</g,"~::~<")
          .replace(/xmlns\:/g,"~::~xmlns:")
          .replace(/xmlns\=/g,"~::~xmlns=")
          .split('~::~'),
      len = ar.length,
      inComment = false,
      deep = 0,
      str = '',
      ix = 0;

    let shift = ['\n']; // array of shifts
	  let step = '  '; // 2 spaces

	// initialize array with shifts; nesting level == 100 //
    for(ix=0;ix<100;ix++){
      shift.push(shift[ix]+step);
    }
  
      for(ix=0;ix<len;ix++) {
      // start comment or <![CDATA[...]]> or <!DOCTYPE //
      if(ar[ix].search(/<!/) > -1) {
        str += shift[deep]+ar[ix];
        inComment = true;
        // end comment  or <![CDATA[...]]> //
        if(ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1 || ar[ix].search(/!DOCTYPE/) > -1 ) {
          inComment = false;
        }
      } else
      // end comment  or <![CDATA[...]]> //
      if(ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1) {
        str += ar[ix];
        inComment = false;
      } else
      // <elm></elm> //
      if( /^<\w/.exec(ar[ix-1]) && /^<\/\w/.exec(ar[ix]) &&
        /^<[\w:\-\.\,]+/.exec(ar[ix-1]) == /^<\/[\w:\-\.\,]+/.exec(ar[ix])[0].replace('/','')) {
        str += ar[ix];
        if(!inComment) deep--;
      } else
        // <elm> //
      if(ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) == -1 && ar[ix].search(/\/>/) == -1 ) {
        str = !inComment ? str += shift[deep++]+ar[ix] : str += ar[ix];
      } else
        // <elm>...</elm> //
      if(ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) > -1) {
        str = !inComment ? str += shift[deep]+ar[ix] : str += ar[ix];
      } else
      // </elm> //
      if(ar[ix].search(/<\//) > -1) {
        str = !inComment ? str += shift[--deep]+ar[ix] : str += ar[ix];
      } else
      // <elm/> //
      if(ar[ix].search(/\/>/) > -1 ) {
        str = !inComment ? str += shift[deep]+ar[ix] : str += ar[ix];
      } else
      // <? xml ... ?> //
      if(ar[ix].search(/<\?/) > -1) {
        str += shift[deep]+ar[ix];
      } else
      // xmlns //
      if( ar[ix].search(/xmlns\:/) > -1  || ar[ix].search(/xmlns\=/) > -1) {
        str += shift[deep]+ar[ix];
      }

      else {
        str += ar[ix];
      }
      }

      return  (str[0] == '\n') ? str.slice(1) : str;
  };

  static get properties() {
    return {
    };
  }

}

window.customElements.define('pretty-print', PrettyPrint);
