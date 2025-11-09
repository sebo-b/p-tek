import * as hmUI from '@zos/ui'
import * as hmApp from '@zos/app'
import { WorldClock, Time, checkSensor } from '@zos/sensor'

import {LCDWidget} from './lcd.js'
import {AOD_DARKER,SMOOTH_SECOND_HAND} from '../utils/constants.js'

import { log } from '@zos/utils'
const logger = log.getLogger('sebo_wf');

function FakeWC() {

  this.getCount = () => 1;

  this.getInfo = (v) => {

    let d = new Date();
    let hour = d.getUTCHours();

    const month = d.getUTCMonth();
    if (month > 2 && month < 9)
      hour += 1;
    else {
      const day = d.getUTCDate();
      const weekday = d.getUTCDay();

      const lastWeek = (31 - day) < (7-weekday);
      const geSun1AM = lastWeek && (weekday != 0 || hour >= 1);
      if ((month == 2 && geSun1AM) || (month == 9 && !geSun1AM))
        hour += 1;
    }

    return {
      timeZoneHour: hour+1,
      timeZoneMinute: d.getMinutes()
    }
  }; 

  this.destroy = () => null;

};

WatchFace({

  buildAODScene() {

    hmUI.createWidget(hmUI.widget.IMG, {
      x: 0,
      y: 0,
      w: px(480),
      h: px(480),
      src: 'aod_background.png',
    });

    this.lcd.init(true);
    this.resumeCallbacks.push( () => this.lcd.updateBatteryLowInd() );

    this.buildTZHand(true);

    hmUI.createWidget(hmUI.widget.TIME_POINTER, {
      hour_centerX: px(240),
      hour_centerY: px(240),
      hour_posX: px(20),
      hour_posY: px(240),
      hour_path: 'aod_h_hand.png',
      hour_cover_x: 0,
      hour_cover_y: 0,
      minute_centerX: px(240),
      minute_centerY: px(240),
      minute_posX: px(20),
      minute_posY: px(240),
      minute_path: 'aod_m_hand.png',
// ??     enable: false,
    });

    if (AOD_DARKER > 0)
      hmUI.createWidget(hmUI.widget.FILL_RECT, {
        x: 0,
        y: 0,
        w: px(480),
        h: px(480),
        color: "0x000000",
        alpha: AOD_DARKER
      });
  },

  buildNormalScene() {
    
    hmUI.createWidget(hmUI.widget.IMG, {
      x: 0,
      y: 0,
      w: px(480),
      h: px(480),
      src: 'background.png'
    });

    this.lcd.init();
    
    this.lcd.createWidget( hmUI.data_type.BATTERY,'lcd_ind/lcd_bat.png',"numbers/unit_perc.png");
    this.lcd.createWidget( hmUI.data_type.WEATHER_CURRENT,'lcd_ind/lcd_temp.png',"numbers/unit_c.png","numbers/unit_f.png");
    this.lcd.createWidget( hmUI.data_type.STEP,'lcd_ind/lcd_steps.png');
    this.lcd.createWidget( hmUI.data_type.CAL,'lcd_ind/lcd_kcal.png');

    this.buildTZHand(false);

    let timePointerSetup = {
      hour_centerX: px(240),
      hour_centerY: px(240),
      hour_posX: px(20),
      hour_posY: px(240),
      hour_path: 'h_hand.png',
      hour_cover_x: 0,
      hour_cover_y: 0,
      minute_centerX: px(240),
      minute_centerY: px(240),
      minute_posX: px(20),
      minute_posY: px(240),
      minute_path: 'm_hand.png',
      minute_cover_x: 0,
      minute_cover_y: 0,
    };
    
    if (!SMOOTH_SECOND_HAND)
      timePointerSetup = Object.assign(timePointerSetup, {
        second_centerX: px(240),
        second_centerY: px(240),
        second_posX: px(11),
        second_posY: px(240),
        second_path: 's_hand.png',
        second_cover_x: 0,
        second_cover_y: 0,
      });

    hmUI.createWidget(hmUI.widget.TIME_POINTER, timePointerSetup);

    if (SMOOTH_SECOND_HAND)
      this.buildSmoothSecondHand();

    this.lcd.createButton(false);
    this.pauseCallbacks.push( () => this.lcd.reset() );
    this.resumeCallbacks.push( () => this.lcd.updateBatteryLowInd() );
  },

  buildSmoothSecondHand() {

    let secAngle = () => (Date.now() % 60000) * 6 / 1000;

    let secHandle = hmUI.createWidget(hmUI.widget.IMG, {
      x: 0,
      y: 0,
      w: px(480),
      h: px(480),
      src: "s_hand.png",
      pos_x: px(240-11),
      pos_y: 0,
      center_x: px(240),
      center_y: px(240),
      angle: secAngle(),
    });
    
    const updateAngle = () => secHandle.setProperty(hmUI.prop.ANGLE, secAngle());

    setInterval( updateAngle, 83);
    this.resumeCallbacks.push( updateAngle);
  },

  buildTZHand(aod) {

    this.tzHand = hmUI.createWidget(hmUI.widget.IMG, {
      x: 0,
      y: 0,
      w: px(480),
      h: px(480),
      src: aod? "aod_tz_hand.png": "tz_hand.png",
      pos_x: px(240-16),
      pos_y: 0,
      center_x: px(240),
      center_y: px(240),
    });

    const updateTZHand = () => {

      if (this.wc.getCount() > 0 ) {

        let hAngle = (h,m) => Math.round(h * 30 + m / 2) % 360;

        let locHAngle = hAngle(this.time.getHours(),this.time.getMinutes());
        let tzHAngle = hAngle(this.wc.getInfo(0).timeZoneHour,this.wc.getInfo(0).timeZoneMinute);

        if ( locHAngle == tzHAngle ) {
          this.tzHand.setProperty(hmUI.prop.VISIBLE, false);
        }
        else {
          this.tzHand.setProperty(hmUI.prop.ANGLE, tzHAngle);
          this.tzHand.setProperty(hmUI.prop.VISIBLE, true);
        }
      }
      else {
        this.tzHand.setProperty(hmUI.prop.VISIBLE, false);
      }

    }

    this.time.onPerMinute(updateTZHand);
    this.resumeCallbacks.push( updateTZHand);
    updateTZHand();
  },

  /**
   * Standard interface
   */

  onInit() {
    this.lcd = new LCDWidget();
    this.wc = new FakeWC(); //WorldClock();
    this.time = new Time();

//    const q = checkSensor(WorldClock);
//    logger.log("====== "+q);
  },

  resumeCallbacks: [],
  onResume() {
    for (c of this.resumeCallbacks)
      c.call(this);
  },

  pauseCallbacks: [],
  onPause() {
    for (c of this.pauseCallbacks)
      c.call(this);
  },

  build() {

    if (hmApp.getScene() == hmApp.SCENE_WATCHFACE) {
      this.buildNormalScene();
    }
    else if (hmApp.getScene() == hmApp.SCENE_AOD) {
      this.buildAODScene();
    }
  },

  onDestroy() {
    this.wc.destroy();
  },

})
