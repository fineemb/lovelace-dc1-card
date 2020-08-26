/*
 * @Author        : fineemb
 * @Github        : https://github.com/fineemb
 * @Description   : 
 * @Date          : 2020-02-15 23:10:06s
 * @LastEditors   : fineemb
 * @LastEditTime  : 2020-08-26 15:32:40
 */

console.info("%c PHICOMM DC1 CARD \n%c   Version 1.2.0  ",
"color: orange; font-weight: bold; background: black", 
"color: white; font-weight: bold; background: dimgray");

const LitElement = Object.getPrototypeOf(
    customElements.get("ha-panel-lovelace")
  );
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;
  
class DC1Card extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    static getConfigElement() {
        return document.createElement("dc1-card-editor");
      }

    static getStubConfig() {
        return {name: 'PHICOMM' ,
            sensors:{},
            entitys:[]
        }
    }

    set hass(hass) {
        let config = this._config;
        this._hass = hass;
        for(var i=0;i<this._config.entitys.length;i++){
            this.entitys[i].querySelector("ha-icon.boxicon").setAttribute('icon',config.entitys[i].icon || hass.states[config.entitys[i].entity].attributes.icon);
            this.entitys[i].querySelector("span.dcboxtitle").innerHTML = config.entitys[i].title || hass.states[config.entitys[i].entity].attributes.friendly_name;
            this.entitys[i].className = 'dcbox dc-box-'+ hass.states[config.entitys[i].entity].state;
        }
        for (let key in config.sensors) {
            let str ;
            let v = Math.ceil(hass.states[config.sensors[key]].state*10)/10
            let spanv = this.dcInfo.querySelector('#sensorBox-'+key+'>span.sv');
            switch (key) {
                case 'a':
                    spanv.innerHTML = v;
                    break;
                case 'w':
                    spanv.innerHTML = v;
                    break;
                case 'v':
                    spanv.innerHTML = v;
                    break;
                case 'today':
                    spanv.innerHTML = v;
                    break;
                case 'yesterday':
                    spanv.innerHTML = v;
                    break;
                case 'total':
                    spanv.innerHTML = Math.ceil(v);
                    break;
            }
            
        }
    }
    setConfig(config) {
        this._config = JSON.parse(JSON.stringify(config));

        if(Object.getOwnPropertyNames(this._config.sensors).length<6){
            this.cardH = '113px';
        }else{
            this.cardH = '136px';
        }
        this.name = this._config.name || 'PHICOMM';
        this.background_color = this._config.background_color?this._config.background_color:'var(--card-background-color)';
        this.title_color = this._config.title_color?this._config.title_color:'var(--icon-color-off)';
        this.on_color = this._config.on_color?this._config.on_color:'var(--paper-item-icon-active-color)';
        this.off_color = this._config.off_color?this._config.off_color:'var(--icon-color-off)';

        const root = this.shadowRoot;
        if (root.lastChild) root.removeChild(root.lastChild);
        const aspect = document.createElement('div');
        aspect.id = 'aspect-ratio';
        root.appendChild(aspect);
        const card = document.createElement('ha-card');
        const style = document.createElement('style');
        style.textContent = this._cssData();
        card.className = 'dc1';
        card.appendChild(style);

        const container = document.createElement('div');
        container.id = 'container';
        card.appendChild(container);
        aspect.appendChild(card);

        this.dcInfo = document.createElement('div');
        this.dcInfo.id = 'dcinfo';
        this.dcInfo.className = 'dcbox';
        container.appendChild(this.dcInfo);

        var nameBox = document.createElement('div');
        nameBox.id = 'namebox';
        nameBox.innerHTML = `<div id="name">${this.name}</div>`
        container.appendChild(nameBox);
        
        this.entitys = []

        for(var i=0;i<this._config.entitys.length;i++){
            var Box = document.createElement('div');
            Box.id = 'dcbox'+i;
            Box.className = 'dcbox';
            Box.setAttribute("data-entity",this._config.entitys[i].entity);
            Box.innerHTML = `<div class="dcboxcont"><div class="boxf"><span><ha-icon class="boxicon" icon="${this._config.entitys[i].icon}"></ha-icon></span></div></div><span class="dcboxtitle">${this._config.entitys[i].title}</span>`
            container.appendChild(Box);
            this.entitys.push(Box);
            Box.addEventListener('click', (e) => this._toggle(e));
        }



        for (let key in config.sensors) {
            const sensorBox = document.createElement('div');
            sensorBox.id = 'sensorBox-'+key;
            sensorBox.className = 'sensorBox';
            let str;
            switch (key) {
                case 'a':
                    str = '<span class="sn">电流:</span><span class="sv"></span><span class="su">A</span>';
                    break;
                case 'w':
                    str = '<span class="sn">功率:</span><span class="sv"></span><span class="su">W</span>';
                    break;
                case 'v':
                    str = '<span class="sn">电压:</span><span class="sv"></span><span class="su">V</span>';
                    break;
                case 'today':
                    str = '<span class="sn">今日:</span><span class="sv"></span><span class="su">度</span>';
                    break;
                case 'yesterday':
                    str = '<span class="sn">昨天:</span><span class="sv"></span><span class="su">度</span>';
                    break;
                case 'total':
                    str = '<span class="sn">总量:</span><span class="sv"></span><span class="su">度</span>';
                    break;
            }
            sensorBox.innerHTML = str;
            this.dcInfo.appendChild(sensorBox);
        }

    }
    _toggle(e) {
        let entity = e.currentTarget.dataset.entity;
        this._hass.callService('switch', 'toggle', {
            entity_id: entity
          });
          this.fireEvent(e,'haptic','success');
    }
    _cssData(){
        var css = `
#aspect-ratio {
    position: relative;
}
#aspect-ratio::before {
    content: "";
    display: block;
    padding-bottom: ${this.cardH};
}
#aspect-ratio>:first-child {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background: ${this.background_color};
}
#container{
    height: 100%;
    width: 100%;
    display: flex;
}
.dc-box-off{
    --icon-color: ${this.off_color};
    --box-shadow: var(--box-shadow);

}
.dc-box-on{
    --icon-color: ${this.on_color};
    --box-shadow: 0 0 5px ${this.on_color};

}

.dcbox{
    flex:1;
    margin:0;
    position: relative;
    color: ${this.title_color};
}
.boxicon{
    color: var(--icon-color);
    opacity: var(--box-opacity);
    display: block;
    position: absolute;
    top: calc( 50% - 12px );
    left: calc( 50% - 12px );
}
.dcboxtitle{
    width: 100%;
    display: block;
    text-align: center;

    position: relative;
    top: 80%;
}
.dcboxcont {
    position: relative;
    margin: -50% 5%;
    width: 90%;
    top: 45%;
}
.dcboxcont::before {
    content: "";
    display: block;
    padding-bottom: calc(100%);
}
.dcboxcont>:first-child {
    position: absolute;
    top: 0;
    left: 0;
    height: 80%;
    width: 80%;
    border-radius: 50%;
    margin: 10%;
    font-size: 12px;
    color: var(--icon-color);
    box-shadow: var(--box-shadow);
    box-sizing: border-box;
    border: 1px #ffffff17 solid;
}
#dcinfo{
    background: #00000022;
    display: flex;
    flex-direction: column;
    padding: 10px 5px 6px 15px;
    margin: 0;
    border-radius: var(--ha-card-border-radius) 0px 0px var(--ha-card-border-radius);
    min-width: 90px;
}
.sensorBox{
    flex:1;
    color : var(--icon-color);

    display: flex;
}

.sn,.sv{
    font-size: 12px;
    line-height: 20px;
    flex:1;
    text-overflow: clip;
    display: block;
}
.su{
    font-size: 12px;
    line-height: 20px;
    flex:0.8;
    text-overflow: clip;
    display: block;
}
#namebox{
    width: 20px;
    background: #0000000d;
}
#name{
    transform: rotate(90deg);
    width: 136px;
    height: 20px;
    text-align: center;
    transform-origin: bottom left;
    margin-top: -20px;
    color: ${this.title_color};
    opacity: 0.3;
}
        `
        return css;
    }
    fireEvent(type, detail, options) {
  
        options = options || {}
        detail = detail === null || detail === undefined ? {} : detail
        const e = new Event(type, {
          bubbles: options.bubbles === undefined ? true : options.bubbles,
          cancelable: Boolean(options.cancelable),
          composed: options.composed === undefined ? true : options.composed,
        })
        
        e.detail = detail
        this.dispatchEvent(e)
        return e
      }
}
customElements.define("dc1-card", DC1Card);

export class DC1CardEditor extends LitElement {
    setConfig(config) {
        this.config = deepClone(config);
    }

    static get properties() {
        return {
            hass: {},
            config: {}
        };
    }
    render() {
        var sensorRE = new RegExp("sensor\.dc|sensor\.tc")
        var switchRE = new RegExp("switch\.dc|switch\.tc")
        var sensors = [
            {c:"a",n:"电流"},
            {c:"w",n:"功率"},
            {c:"v",n:"电压"},
            {c:"today",n:"今日电量"},
            {c:"yesterday",n:"昨日电量"},
            {c:"total",n:"总电量"}
        ]
        if (!this.hass) {
            return html`dddddd
            `;
        }
        return html`
        <div class="card-config">
            <paper-input
                label="${this.hass.localize("ui.panel.lovelace.editor.card.generic.title")} (${this.hass.localize("ui.panel.lovelace.editor.card.config.optional")})"
                .value="${this.config.name}"
                .configValue="${"title"}"
                @value-changed="${this._titleChanged}"
            ></paper-input>
            <h3>信息显示</h3>
            <div class="side-by-side info">
            ${sensors.map(sensor =>  html`
                <paper-input-container>
                    <label slot="label">${sensor.n}</label>
                    <input type="text" value="${this.config.sensors[sensor.c]||""}" slot="input" list="Bsensors" autocapitalize="none" @change=${e => this._changeInfo(e,sensor.c)}>
                    <ha-icon-button slot="suffix" icon="mdi:close" title="${this.hass.localize("ui.panel.lovelace.editor.card.map.delete")}" .item="${sensor.c}" .type="${"sensor"}" @click=${this._delEntity}></ha-icon-button>
                </paper-input-container>
            `)}
            
            </div>
            <div class="side-by-side">
                <paper-input-container>
                    <label slot="label">背景颜色</label>
                    <input type="color" value="${this.config.background_color?this.config.background_color:"#999999"}" slot="input" .ctype="${"background_color"}" @input="${this._colorChanged}">
                    <ha-icon-button slot="suffix" icon="${this.config.background_color?"mdi:palette":"mdi:palette-outline"}" title="${this.hass.localize("ui.panel.lovelace.editor.card.map.delete")}" .item="${"background_color"}" .type="${"color"}" @click=${this._delEntity}></ha-icon-button>
                </paper-input-container>
                <paper-input-container>
                    <label slot="label">文本颜色</label>
                    <input type="color" value="${this.config.title_color?this.config.title_color:"#999999"}" slot="input" .ctype="${"title_color"}" @input="${this._colorChanged}">
                    <ha-icon-button slot="suffix" icon="${this.config.title_color?"mdi:palette":"mdi:palette-outline"}" title="${this.hass.localize("ui.panel.lovelace.editor.card.map.delete")}" .item="${"title_color"}" .type="${"color"}" @click=${this._delEntity}></ha-icon-button>
                </paper-input-container>
                <paper-input-container>
                    <label slot="label">开状态颜色</label>
                    <input type="color" value="${this.config.on_color?this.config.on_color:"#999999"}" slot="input" .ctype="${"on_color"}" @input="${this._colorChanged}">
                    <ha-icon-button slot="suffix" icon="${this.config.on_color?"mdi:palette":"mdi:palette-outline"}" title="${this.hass.localize("ui.panel.lovelace.editor.card.map.delete")}" .item="${"on_color"}" .type="${"color"}" @click=${this._delEntity}></ha-icon-button>

                </paper-input-container>
                <paper-input-container>
                    <label slot="label">关状态颜色</label>
                    <input type="color" value="${this.config.off_color?this.config.off_color:"#999999"}" slot="input" .ctype="${"off_color"}" @input="${this._colorChanged}">
                    <ha-icon-button slot="suffix" icon="${this.config.off_color?"mdi:palette":"mdi:palette-outline"}" title="${this.hass.localize("ui.panel.lovelace.editor.card.map.delete")}" .item="${"off_color"}" .type="${"color"}" @click=${this._delEntity}></ha-icon-button>

                </paper-input-container>
            </div>
            <h3>插孔</h3>
            ${this.config.entitys.map((entity,index) =>  html`

            <div class="side-by-side">
                <paper-input-container class="fs">
                    <label slot="label">图标</label>
                    <div slot="prefix">mdi:</div>
                    <ha-icon slot="suffix" icon="${entity.icon}" ></ha-icon>
                    <input type="text" value="${entity.icon.split(":")[1]}" .index=${index} slot="input" autocapitalize="none" @input="${this._iconChanged}">
                </paper-input-container>
                <paper-input
                    class="fs"
                    label="名称"
                    .value="${entity.title}"
                    .index=${index}
                    .configValue="${"switchtitle"}"
                    @value-changed="${this._titleChanged}"
                ></paper-input>
                <paper-input-container>
                    <label slot="label">开关实体</label>
                    <input type="text" value="${entity.entity}" slot="input" list="Bswitchs" autocapitalize="none" @change="${this._changeEntity}">
                    <ha-icon-button slot="suffix" icon="mdi:close" title="${this.hass.localize("ui.panel.lovelace.editor.card.map.delete")}" .index=${index} .type="${"entity"}" @click=${this._delEntity}></ha-icon-button>
                </paper-input-container>
            </div>
            
            `)}

            <paper-input-container >
                <label slot="label">添加开关实体</label>
                <input type="text" value="" slot="input" list="Bswitchs" autocapitalize="none" @change=${this._addEntity}>
                <ha-icon slot="suffix" icon="mdi:plus" title="${this.hass.localize("ui.dialogs.helper_settings.input_select.add")}"></ha-icon>
            </paper-input-container>
        </div>
        <datalist id="Bswitchs">
            ${Object.keys(this.hass.states).filter(a => switchRE.test(a) ).map(entId => html`
                <option value=${entId}>${this.hass.states[entId].attributes.friendly_name || entId}</option>
            `)}
        </datalist>
        <datalist id="Bsensors">
            ${Object.keys(this.hass.states).filter(a => sensorRE.test(a) ).map(entId => html`
                <option value=${entId}>${this.hass.states[entId].attributes.friendly_name || entId}</option>
            `)}
        </datalist>
        `
    }
    _colorChanged(e){
        const target = e.target;

        if (!this.config || !this.hass || !target ) {
            return;
        }
        if(target.ctype == "background_color"){
            this.config = {
                ...this.config,
                "background_color": target.value
            };
        }
        if(target.ctype == "title_color"){
            this.config = {
                ...this.config,
                "title_color": target.value
            };
        }
        if(target.ctype == "on_color"){
            this.config = {
                ...this.config,
                "on_color": target.value
            };
        }
        if(target.ctype == "off_color"){
            this.config = {
                ...this.config,
                "off_color": target.value
            };
        }
        this.configChanged(this.config)
    }
    _delEntity(e){
        const target = e.target;
        if (!this.config || !this.hass || !target ) {
            return;
        } 
        if(target.type == "color"){
            const sensors = this.config.sensors
            delete this.config[target.item];
        }
        if(target.type == "sensor"){
            const sensors = this.config.sensors
            delete sensors[target.item];
            this.config = {
                ...this.config,
                "sensors": sensors
            };
            e.target.value = ''
        }
        if(target.type == "entity"){
            const entitys = this.config.entitys
            entitys.splice(target.index, 1);
            this.config = {
                ...this.config,
                "entitys": entitys
            };
        }

        this.configChanged(this.config)
    }
    _iconChanged(e){
        const target = e.target;
        if (!this.config || !this.hass || !target ) {
            return;
        }
        const entitys = this.config.entitys
        entitys[target.index].icon = "mdi:"+target.value
        this.config = {
            ...this.config,
            "entitys": entitys
        };
        this.configChanged(this.config)
    }
    _titleChanged(e){
        const target = e.target;

        if (!this.config || !this.hass || !target ) {
            return;
        }
        
        if(target.configValue == "switchtitle"){
            const entitys = this.config.entitys
            entitys[target.index].title = target.value
            this.config = {
                ...this.config,
                "entitys": entitys
            };
        }
        if(target.configValue == "title"){
            this.config = {
                ...this.config,
                "name": target.value
            };
        }
        this.configChanged(this.config)
    }
    _changeInfo(e,c){

        const target = e.target.value;
        const targetInfo = c;
        if (!this.config || !this.hass || !target || !this.hass.states[target]) {
            return;
        }
        const sensors = this.config.sensors || {}
        sensors[c] = target;
        this.config = {
            ...this.config,
            "sensors": sensors
        };
        this.configChanged(this.config)
        e.target.blur();
    }
    _addEntity(ev){
        const target = ev.target.value || ev.target.previousElementSibling.value;
        if (!this.config || !this.hass || !target || !this.hass.states[target]) {
          return;
        }
        const entitys = this.config.entitys || []
        let flag = true;
        entitys.forEach(item=>{
          if(target===item.entity){ 
            flag = false;
            ev.target.value = ''
          }
        })
        if(flag){
            entitys.push({
                entity:target,
                title: this.hass.states[target].attributes.friendly_name,
                icon:"mdi:power"
            })
          this.config = {
            ...this.config,
            "entitys": entitys
          };
          this.configChanged(this.config)
          ev.target.value = ''
        }
    
      }
      configChanged(newConfig) {
        const event = new Event("config-changed", {
          bubbles: true,
          composed: true
        });
        event.detail = {config: newConfig};
        this.dispatchEvent(event);
      }
    static get styles() {
        return css `
        a{
          color: var(--accent-color);
        }
        .side-by-side {
            display: flex;
            align-items: flex-end;
            flex-wrap: wrap;
          }
          .side-by-side > * {
            flex: 1;
            padding-right: 4px;
          }
          .info > * {
            flex: none;
            width: calc(33% - 10px);
            padding: 0 5px;
          }

          ha-switch{
            margin-right: 10px;
          }
          ha-icon-button{
            --mdc-icon-button-size: 24px;
          }
          .fs{
              flex:0.3;
          }
        `
      }

}
customElements.define("dc1-card-editor", DC1CardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "dc1-card",
  name: "斐讯排插",
  preview: true, // Optional - defaults to false
  description: "自定义斐讯排插卡片" // Optional
});

function deepClone(value) {
    if (!(!!value && typeof value == 'object')) {
      return value;
    }
    if (Object.prototype.toString.call(value) == '[object Date]') {
      return new Date(value.getTime());
    }
    if (Array.isArray(value)) {
      return value.map(deepClone);
    }
    var result = {};
    Object.keys(value).forEach(
      function(key) { result[key] = deepClone(value[key]); });
    return result;
  }
