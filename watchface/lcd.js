import { px } from '@zos/utils'
import {Battery} from '@zos/sensor'
import * as hmUI from '@zos/ui'

import {weekdays,nums,lcdPosition,BATT_LOW_THRES,LCD_RESET_TIME} from '../utils/constants.js'

//import { log } from '@zos/utils'
//const logger = log.getLogger('sebo_wf');

export class LCDWidget {

    widgets = [];
    activeWidget = 0;
    widgetResetTimer = null;

    constructor() {
    }

    init(aod = false) {
        this._createDateWidget(aod);
        this._createBatLowIndicator(aod);
    }

    createWidget(type,img,unit,imp_unit) {

        const group = hmUI.createWidget(hmUI.widget.GROUP, lcdPosition);
        group.createWidget(hmUI.widget.TEXT_IMG, {
            x: px(12),
            y: px(30),
            w: lcdPosition.w - px(2*12),
            align_h: hmUI.align.RIGHT,
            type: type,
            font_array: nums,
            unit_en: unit,
            imperial_unit_en: imp_unit
        });
        group.createWidget(hmUI.widget.IMG, {
            x: 0,
            y: px(7),
            src: img
        });       
        group.setProperty(hmUI.prop.VISIBLE, false);
        this.widgets.push(group);

        return group;
    }

    /**
     * Creates touch interaction to switch lcd indicators
     * should be called when all other watchface widgets are created,
     * so it is on top
     */
    createButton(fullscreen = false) {

        if (this.widgets.length < 2)
            return;

        const btnPos = fullscreen?
            {x:0, y:0, w: px(480), h: px(480) }:
            lcdPosition;

        const button = hmUI.createWidget(hmUI.widget.FILL_RECT, {
            ...btnPos,
            color: 0,
            alpha: 0x0,
            show_level: hmUI.show_level.ONLY_NORMAL,
        });

        button.addEventListener(hmUI.event.CLICK_DOWN, () => this.nextWidget() );
    }

    nextWidget() {
        if (this.widgetResetTimer) {
            clearTimeout(this.widgetResetTimer);
            this.widgetResetTimer = null;
        }
    
        this.widgets[this.activeWidget].setProperty(hmUI.prop.VISIBLE, false);
        this.activeWidget = (this.activeWidget+1) % this.widgets.length;
        this.widgets[this.activeWidget].setProperty(hmUI.prop.VISIBLE, true);
    
        if (this.activeWidget > 0) {
            this.widgetResetTimer = setTimeout( () => {
                this.widgetResetTimer = null;
                this.reset();
            }, LCD_RESET_TIME );
        }

    }

    reset() {

        if (this.widgetResetTimer) {
            clearTimeout(this.widgetResetTimer);
            this.widgetResetTimer = null;          
        }

        this.widgets[this.activeWidget].setProperty(hmUI.prop.VISIBLE, false);
        this.widgets[0].setProperty(hmUI.prop.VISIBLE, true);
        this.activeWidget = 0;
    }

    _createDateWidget(aod) {

        const dateWidget = hmUI.createWidget(hmUI.widget.GROUP, lcdPosition);
        dateWidget.createWidget(hmUI.widget.IMG_DATE, {
            day_startX: px(227),
            day_startY: px(30),
            day_en_array: nums,
        });
        dateWidget.createWidget(hmUI.widget.IMG_WEEK, {
            x: px(12),
            y: px(30),
            week_en: weekdays,
        })

        this.widgets.push(dateWidget);

        return dateWidget;
    }
    
    _createBatLowIndicator(aod) {

        let battLowInd;
        
        if (aod) {
            battLowInd = hmUI.createWidget(hmUI.widget.IMG, {
                x: lcdPosition.x,
                y: lcdPosition.y + lcdPosition.indicatorY,
                src: 'lcd_ind/lowbat/lcd_lowbat_0.png'
            });
        }
        else {
            battLowInd = hmUI.createWidget(hmUI.widget.IMG_ANIM, {
                x: lcdPosition.x,
                y: lcdPosition.y + lcdPosition.indicatorY,
                anim_path: 'lcd_ind/lowbat',
                anim_prefix: 'lcd_lowbat',
                anim_ext: 'png',
                anim_fps: 1,
                anim_size: 2,
                repeat_count: 0,
                anim_status: hmUI.anim_status.STOP
            });
        }

        const battery = new Battery();

        const batteryChange = () => {
            const isLow = battery.getCurrent() < BATT_LOW_THRES;
            battLowInd.setProperty(hmUI.prop.VISIBLE, isLow);
            if (!aod)
                battLowInd.setProperty(hmUI.prop.ANIM_STATUS, 
                    isLow? hmUI.anim_status.START: hmUI.anim_status.STOP);
            
            };    
        battery.onChange( batteryChange);
        batteryChange();
    }

}

