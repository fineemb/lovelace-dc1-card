/*
 * @Author        : fineemb
 * @Github        : https://github.com/fineemb
 * @Description   : 
 * @Date          : 2020-02-15 23:10:06s
 * @LastEditors   : fineemb
 * @LastEditTime  : 2020-02-23 16:58:52
 */

console.info("%c PHICOMM DC1 CARD \n%c    Version 1.1.2   ",
"color: orange; font-weight: bold; background: black", 
"color: white; font-weight: bold; background: dimgray");

class DC1Card extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    set hass(hass) {
        let config = this._config;
        this._hass = hass;
        for(var i=0;i<4;i++){
            this.entitys[i].querySelector("iron-icon.boxicon").setAttribute('icon',config.entitys[i].icon || hass.states[config.entitys[i].entity].attributes.icon);
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
        this.name = this._config.name || '排插';
        this.background_color = this._config.background_color?this._config.background_color:'var(--paper-card-background-color)';
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

        for(var i=0;i<4;i++){
            var Box = document.createElement('div');
            Box.id = 'dcbox'+i;
            Box.className = 'dcbox';
            Box.setAttribute("data-entity",this._config.entitys[i].entity);
            Box.innerHTML = `<div class="dcboxcont"><div class="boxf"><span><iron-icon class="boxicon" icon="${this._config.entitys[i].icon}"></iron-icon></span></div></div><span class="dcboxtitle">${this._config.entitys[i].title}</span>`
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
          fireEvent(e,'haptic','success');
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
    --box-opacity: 0.5;
}
.dc-box-on{
    --icon-color: ${this.on_color};
    --box-shadow: 0 0 5px ${this.on_color};
    --box-opacity: 1;
}

.dcbox{
    flex:1;
    margin:0;
    position: relative;
    color: ${this.title_color};
}
.boxicon{
    width: 100%;
    height: 50%;
    margin-top: 25%;
    color: var(--icon-color);
    opacity: var(--box-opacity);
}
.dcboxtitle{
    width: 100%;
    display: block;
    text-align: center;
    opacity: 0.4;
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
    opacity: 0.6;
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
customElements.define('dc1-card', DC1Card);